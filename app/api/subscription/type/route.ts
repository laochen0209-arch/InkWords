/**
 * 获取用户订阅类型 API
 *
 * 文件说明：
 * 查询用户的 Stripe 订阅信息，返回订阅类型（月度/年度）
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

/**
 * 获取订阅类型
 *
 * 请求方式：GET
 * 认证方式：通过 Supabase Session
 */
export async function GET(request: NextRequest) {
  console.log('[SUBSCRIPTION TYPE API] 收到获取订阅类型请求')

  try {
    // 获取当前用户
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[SUBSCRIPTION TYPE API] 用户未登录')
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 查询用户的 stripe_customer_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.stripe_customer_id) {
      console.log('[SUBSCRIPTION TYPE API] 用户没有 Stripe Customer ID')
      return NextResponse.json(
        { planType: null },
        { status: 200 }
      )
    }

    // 从 Stripe 获取订阅信息
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: 'active',
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      console.log('[SUBSCRIPTION TYPE API] 没有找到活跃订阅')
      return NextResponse.json(
        { planType: null },
        { status: 200 }
      )
    }

    const subscription = subscriptions.data[0]
    
    // 根据订阅间隔判断类型
    // interval: 'month' = 月度, 'year' = 年度
    const interval = subscription.items.data[0]?.price.recurring?.interval
    const planType = interval === 'year' ? 'yearly' : 'monthly'

    console.log('[SUBSCRIPTION TYPE API] 订阅类型:', planType, 'interval:', interval)

    return NextResponse.json(
      { planType, interval },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[SUBSCRIPTION TYPE API] 获取订阅类型失败:', error)
    return NextResponse.json(
      { error: '获取订阅类型失败', message: error.message },
      { status: 500 }
    )
  }
}
