/**
 * Stripe Checkout 会话创建 API
 *
 * 文件说明：
 * 创建 Stripe Checkout 会话，用于处理会员订阅支付
 *
 * 功能：
 * - 接收 priceId 和 userId
 * - 创建 Stripe Checkout 会话
 * - 返回支付页面 URL
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Stripe 客户端实例
 * 使用服务端密钥初始化
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

/**
 * 创建 Checkout 会话
 *
 * 请求参数：
 * - priceId: Stripe 价格 ID (月付或年付)
 * - userId: 用户 ID
 *
 * 返回数据：
 * - url: Stripe Checkout 页面 URL
 */
export async function POST(request: NextRequest) {
  console.log('[CHECKOUT API] 收到创建结账会话请求')

  try {
    const body = await request.json()
    const { priceId, userId } = body

    // 验证必要参数
    if (!priceId || !userId) {
      console.log('[CHECKOUT API] 缺少必要参数')
      return NextResponse.json(
        { error: '缺少必要参数: priceId 和 userId' },
        { status: 400 }
      )
    }

    // 获取用户信息
    const supabase = await createServerClient()
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, stripe_customer_id')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.log('[CHECKOUT API] 用户不存在:', userError)
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    console.log('[CHECKOUT API] 用户查询成功:', user.email)

    // 获取或创建 Stripe Customer
    let customerId = user.stripe_customer_id

    if (!customerId) {
      // 创建新的 Stripe Customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id

      // 保存 customerId 到数据库
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)

      console.log('[CHECKOUT API] 创建 Stripe Customer:', customerId)
    }

    // 获取基础 URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    // 创建 Checkout 会话
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/profile?success=true`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        userId: userId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    })

    console.log('[CHECKOUT API] 创建 Checkout 会话成功:', session.id)

    return NextResponse.json(
      { url: session.url },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[CHECKOUT API] 创建结账会话失败:', error)

    return NextResponse.json(
      { error: '创建结账会话失败', message: error.message },
      { status: 500 }
    )
  }
}
