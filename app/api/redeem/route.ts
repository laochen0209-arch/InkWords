/**
 * @file route.ts
 * @description 积分兑换 VIP 会员 API
 * @author InkWords Team
 * @date 2026-02-15
 * 
 * 功能：
 * - 用户使用 100 积分兑换 1 天 VIP 会员
 * - 安全验证用户身份
 * - 检查积分是否足够
 * - 正确处理现有会员（延期 vs 新增）
 * - 记录用户活动日志
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 积分兑换 VIP 会员
 * POST /api/redeem
 */
export async function POST(request: NextRequest) {
  try {
    // ============================================================================
    // 【安全关键】从 Cookie 创建 Supabase 客户端，验证用户身份
    // ============================================================================
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // 不需要设置 cookie，只读验证
          },
        },
      }
    )

    // ============================================================================
    // 【零信任安全】从 Session Cookie 获取用户，严禁从请求头/Body 读取
    // ============================================================================
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('[Redeem] 无法从 Cookie 获取用户:', userError)
      return NextResponse.json(
        { error: 'Unauthorized - 请先登录' },
        { status: 401 }
      )
    }

    console.log('[Redeem] 已验证用户身份:', user.id, user.email)

    // ============================================================================
    // 获取当前用户数据
    // ============================================================================
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('points, subscription_status, current_period_end')
      .eq('id', user.id)
      .single()

    if (fetchError || !userData) {
      console.error('[Redeem] 获取用户数据失败:', fetchError)
      return NextResponse.json(
        { error: '获取用户数据失败' },
        { status: 500 }
      )
    }

    // ============================================================================
    // 检查积分是否足够
    // ============================================================================
    const REDEEM_POINTS = 100
    if ((userData.points || 0) < REDEEM_POINTS) {
      return NextResponse.json(
        { error: '积分不足！需要 100 积分才能兑换' },
        { status: 400 }
      )
    }

    // ============================================================================
    // 计算会员到期时间
    // ============================================================================
    let newExpiryDate: Date
    
    // 检查用户是否已有未过期的会员
    const now = new Date()
    if (userData.current_period_end) {
      const currentExpiry = new Date(userData.current_period_end)
      if (currentExpiry > now) {
        // 现有会员未过期，在现有基础上延期 1 天
        newExpiryDate = new Date(currentExpiry.getTime() + 24 * 60 * 60 * 1000)
      } else {
        // 会员已过期，从现在开始算 1 天
        newExpiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      }
    } else {
      // 没有会员记录，从现在开始算 1 天
      newExpiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    }

    // ============================================================================
    // 更新数据库：扣除积分 + 激活/延期 VIP
    // ============================================================================
    const { error: updateError } = await supabase
      .from('users')
      .update({
        points: (userData.points || 0) - REDEEM_POINTS,
        subscription_status: 'active',
        current_period_end: newExpiryDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('[Redeem] 更新用户数据失败:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // ============================================================================
    // 记录用户活动日志
    // ============================================================================
    const { error: logError } = await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        action_type: 'points_redeemed',
        target_id: null,
        details: {
          redeemed_at: new Date().toISOString(),
          points_spent: REDEEM_POINTS,
          vip_days: 1,
          new_expiry_date: newExpiryDate.toISOString()
        },
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.warn('[Redeem] 记录活动日志失败:', logError)
      // 不影响主流程，继续返回成功
    }

    console.log('[Redeem] 积分兑换成功:', user.id, '1天VIP')

    return NextResponse.json({
      success: true,
      message: '兑换成功！您已获得 1 天 VIP 会员',
      data: {
        user_id: user.id,
        points_spent: REDEEM_POINTS,
        vip_days: 1,
        expiry_date: newExpiryDate.toISOString()
      }
    })

  } catch (error: any) {
    console.error('[Redeem] 兑换过程出错:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
