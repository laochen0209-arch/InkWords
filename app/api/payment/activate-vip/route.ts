/**
 * @file route.ts
 * @description 支付成功后自动激活 VIP 权益 API
 * @author InkWords Team
 * @date 2026-02-09
 * 
 * 安全说明：
 * 使用 Supabase SSR 从 Cookie 中解析用户身份，严禁从请求头或 Body 读取用户 ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
      console.error('[ActivateVIP] 无法从 Cookie 获取用户:', userError)
      return NextResponse.json(
        { error: 'Unauthorized - 请先登录' },
        { status: 401 }
      )
    }

    console.log('[ActivateVIP] 已验证用户身份:', user.id, user.email)

    // ============================================================================
    // 执行 VIP 激活操作
    // ============================================================================
    
    // 1. 更新数据库 (开启 VIP + 赠送积分 + 设置订阅类型和有效期)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_vip: true,
        subscription_status: 'active',
        subscription_type: 'yearly',
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        points: 8888,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('[ActivateVIP] 更新用户数据失败:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // 2. 记录激活日志
    const { error: logError } = await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        action_type: 'vip_activated',
        target_id: null,
        details: {
          activated_at: new Date().toISOString(),
          subscription_type: 'yearly',
          points_added: 8888
        },
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.warn('[ActivateVIP] 记录活动日志失败:', logError)
      // 不影响主流程，继续返回成功
    }

    console.log('[ActivateVIP] VIP 激活成功:', user.id)

    return NextResponse.json({
      success: true,
      message: 'VIP 权益已激活',
      data: {
        user_id: user.id,
        is_vip: true,
        subscription_status: 'yearly',
        points: 8888
      }
    })

  } catch (error: any) {
    console.error('[ActivateVIP] 激活过程出错:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
