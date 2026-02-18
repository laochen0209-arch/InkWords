/**
 * Stripe Webhook 监听 API
 *
 * 文件说明：
 * 接收 Stripe 支付事件回调，处理订阅状态变更
 *
 * 功能：
 * - 验证 Stripe 签名
 * - 处理 checkout.session.completed (支付成功)
 * - 处理 invoice.payment_succeeded (续费成功)
 * - 处理 invoice.payment_failed (续费失败)
 * - 处理 customer.subscription.updated (订阅更新)
 * - 处理 customer.subscription.deleted (订阅删除)
 * - 更新用户会员状态和订阅类型
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Stripe 客户端实例
 * 使用服务端密钥初始化
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

/**
 * Webhook 密钥
 * 用于验证 Stripe 请求的签名
 */
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * 获取订阅类型
 * 根据 subscription.items.data[0].price.recurring.interval 判断
 *
 * @param subscription - Stripe Subscription 对象
 * @returns 'monthly' | 'yearly' | 'lifetime'
 */
function getSubscriptionType(subscription: Stripe.Subscription): 'monthly' | 'yearly' | 'lifetime' {
  const item = subscription.items.data[0]
  if (!item || !item.price) {
    return 'monthly' // 默认月度
  }

  // 检查是否为一次性付款（终身会员）
  if (item.price.type === 'one_time') {
    return 'lifetime'
  }

  // 检查周期性订阅
  const interval = item.price.recurring?.interval
  if (interval === 'year') {
    return 'yearly'
  }

  // 默认为月度
  return 'monthly'
}

/**
 * 处理 Stripe Webhook 请求
 *
 * 支持的事件类型：
 * - checkout.session.completed: 支付成功，激活会员
 * - invoice.payment_succeeded: 续费成功，更新到期时间
 * - invoice.payment_failed: 续费失败，取消会员
 * - customer.subscription.updated: 订阅更新
 * - customer.subscription.deleted: 订阅删除
 */
export async function POST(request: NextRequest) {
  console.log('[WEBHOOK API] 收到 Stripe Webhook 请求')

  try {
    // 获取原始请求体和签名
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.log('[WEBHOOK API] 缺少 Stripe 签名')
      return NextResponse.json(
        { error: '缺少 Stripe 签名' },
        { status: 400 }
      )
    }

    // 验证签名并解析事件
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (err: any) {
      console.error('[WEBHOOK API] 签名验证失败:', err.message)
      return NextResponse.json(
        { error: '签名验证失败', message: err.message },
        { status: 400 }
      )
    }

    console.log('[WEBHOOK API] 事件类型:', event.type)

    const supabase = await createServerClient()

    // 处理不同的事件类型
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session, supabase)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice, supabase)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice, supabase)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription, supabase)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription, supabase)
        break
      }

      default:
        console.log(`[WEBHOOK API] 未处理的事件类型: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error('[WEBHOOK API] 处理 Webhook 失败:', error)

    return NextResponse.json(
      { error: '处理 Webhook 失败', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * 处理支付成功事件
 *
 * 功能：
 * - 从 session.metadata 获取 userId
 * - 获取订阅详情
 * - 判断订阅类型 (monthly/yearly/lifetime)
 * - 更新用户会员状态为 Pro
 * - 设置会员到期时间
 * - 写入 subscription_type
 *
 * @param session - Stripe Checkout Session
 * @param supabase - Supabase 客户端
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  supabase: SupabaseClient
) {
  console.log('[WEBHOOK API] 处理支付成功事件:', session.id)

  // 从 metadata 获取 userId
  const userId = session.metadata?.userId

  if (!userId) {
    console.error('[WEBHOOK API] Session 中缺少 userId')
    return
  }

  // 获取订阅详情
  const subscriptionId = session.subscription as string

  if (!subscriptionId) {
    console.error('[WEBHOOK API] Session 中缺少 subscription')
    return
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000)

  // 判断订阅类型
  const subscriptionType = getSubscriptionType(subscription)

  console.log('[WEBHOOK API] 订阅信息:', {
    subscriptionId,
    currentPeriodEnd,
    status: subscription.status,
    subscriptionType,
  })

  // 更新用户会员状态
  const { error } = await supabase
    .from('users')
    .update({
      is_pro: true,
      current_period_end: currentPeriodEnd.toISOString(),
      stripe_subscription_id: subscriptionId,
      subscription_type: subscriptionType,
    })
    .eq('id', userId)

  if (error) {
    console.error('[WEBHOOK API] 更新用户会员状态失败:', error)
    throw error
  }

  console.log('[WEBHOOK API] 用户会员状态已更新:', userId, '类型:', subscriptionType)
}

/**
 * 处理续费成功事件
 *
 * 功能：
 * - 从 invoice 获取 subscription
 * - 获取订阅详情
 * - 判断订阅类型
 * - 更新到期时间和订阅类型
 *
 * @param invoice - Stripe Invoice
 * @param supabase - Supabase 客户端
 */
async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: SupabaseClient
) {
  console.log('[WEBHOOK API] 处理续费成功事件:', invoice.id)

  const subscriptionId = (invoice as any).subscription as string

  if (!subscriptionId) {
    console.log('[WEBHOOK API] Invoice 中没有 subscription，跳过处理')
    return
  }

  // 获取订阅详情
  const subscription = await stripe.subscriptions.retrieve(subscriptionId as string)
  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000)

  // 判断订阅类型
  const subscriptionType = getSubscriptionType(subscription)

  // 查找对应的用户
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (userError || !user) {
    console.error('[WEBHOOK API] 未找到对应用户:', userError)
    return
  }

  // 更新用户会员状态
  const { error } = await supabase
    .from('users')
    .update({
      is_pro: true,
      current_period_end: currentPeriodEnd.toISOString(),
      subscription_type: subscriptionType,
    })
    .eq('id', user.id)

  if (error) {
    console.error('[WEBHOOK API] 更新用户会员状态失败:', error)
    throw error
  }

  console.log('[WEBHOOK API] 用户续费成功，状态已更新:', user.email, '类型:', subscriptionType)
}

/**
 * 处理续费失败事件
 *
 * 功能：
 * - 从 invoice 获取 customer
 * - 查找对应用户
 * - 将用户会员状态设为 false
 *
 * @param invoice - Stripe Invoice
 * @param supabase - Supabase 客户端
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: Awaited<ReturnType<typeof createServerClient>>
) {
  console.log('[WEBHOOK API] 处理续费失败事件:', invoice.id)

  const subscriptionId = (invoice as any).subscription as string

  if (!subscriptionId) {
    console.error('[WEBHOOK API] Invoice 中缺少 subscription')
    return
  }

  // 查找对应的用户
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (userError || !user) {
    console.error('[WEBHOOK API] 未找到对应用户:', userError)
    return
  }

  // 更新用户会员状态为 false
  const { error } = await supabase
    .from('users')
    .update({
      is_pro: false,
    })
    .eq('id', user.id)

  if (error) {
    console.error('[WEBHOOK API] 更新用户会员状态失败:', error)
    throw error
  }

  console.log('[WEBHOOK API] 用户会员已取消:', user.email)
}

/**
 * 处理订阅删除事件
 *
 * 功能：
 * - 将用户会员状态设为 false
 * - 清除订阅 ID
 * - 清除订阅类型
 *
 * @param subscription - Stripe Subscription
 * @param supabase - Supabase 客户端
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: SupabaseClient
) {
  console.log('[WEBHOOK API] 处理订阅删除事件:', subscription.id)

  // 查找对应的用户
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (userError || !user) {
    console.error('[WEBHOOK API] 未找到对应用户:', userError)
    return
  }

  // 更新用户会员状态
  const { error } = await supabase
    .from('users')
    .update({
      is_pro: false,
      stripe_subscription_id: null,
      subscription_type: null,
    })
    .eq('id', user.id)

  if (error) {
    console.error('[WEBHOOK API] 更新用户会员状态失败:', error)
    throw error
  }

  console.log('[WEBHOOK API] 用户订阅已删除:', user.id)
}

/**
 * 处理订阅更新事件
 *
 * 功能：
 * - 更新会员到期时间
 * - 根据订阅状态更新 is_pro
 * - 更新订阅类型
 *
 * @param subscription - Stripe Subscription
 * @param supabase - Supabase 客户端
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: SupabaseClient
) {
  console.log('[WEBHOOK API] 处理订阅更新事件:', subscription.id)

  // 查找对应的用户
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (userError || !user) {
    console.error('[WEBHOOK API] 未找到对应用户:', userError)
    return
  }

  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000)
  const isActive = subscription.status === 'active' || subscription.status === 'trialing'

  // 判断订阅类型
  const subscriptionType = getSubscriptionType(subscription)

  // 更新用户会员状态
  const { error } = await supabase
    .from('users')
    .update({
      is_pro: isActive,
      current_period_end: currentPeriodEnd.toISOString(),
      subscription_type: subscriptionType,
    })
    .eq('id', user.id)

  if (error) {
    console.error('[WEBHOOK API] 更新用户会员状态失败:', error)
    throw error
  }

  console.log('[WEBHOOK API] 用户订阅已更新:', user.id, '状态:', subscription.status, '类型:', subscriptionType)
}
