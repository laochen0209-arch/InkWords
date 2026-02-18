/**
 * Stripe Customer Portal 会话创建 API
 *
 * 文件说明：
 * 创建 Stripe Customer Portal 会话，用于管理订阅（查看账单、取消订阅等）
 *
 * 功能：
 * - 获取当前登录用户
 * - 查询用户的 stripe_customer_id
 * - 创建 Billing Portal 会话
 * - 返回门户页面 URL
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
 * 创建 Customer Portal 会话
 *
 * 请求方式：POST
 * 认证方式：通过 x-user-email 请求头
 *
 * 返回数据：
 * - url: Stripe Customer Portal 页面 URL
 */
export async function POST(request: NextRequest) {
  console.log('[PORTAL API] 收到创建门户会话请求')

  try {
    // 从请求头获取用户邮箱
    const email = request.headers.get('x-user-email')

    if (!email) {
      console.log('[PORTAL API] 缺少用户邮箱')
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 查询用户信息
    const supabase = await createServerClient()
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id')
      .eq('email', email)
      .single()

    if (userError || !user) {
      console.log('[PORTAL API] 用户不存在:', userError)
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    console.log('[PORTAL API] 用户查询成功:', user.email)

    // 检查是否有 Stripe Customer ID
    if (!user.stripe_customer_id) {
      console.log('[PORTAL API] 用户没有 Stripe Customer ID')
      return NextResponse.json(
        { error: '未找到订阅信息，请先订阅会员' },
        { status: 400 }
      )
    }

    // 获取基础 URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    // 创建 Customer Portal 会话
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${baseUrl}/dashboard`,
    })

    console.log('[PORTAL API] 创建 Portal 会话成功:', portalSession.id)

    return NextResponse.json(
      { url: portalSession.url },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[PORTAL API] 创建门户会话失败:', error)

    return NextResponse.json(
      { error: '创建门户会话失败', message: error.message },
      { status: 500 }
    )
  }
}
