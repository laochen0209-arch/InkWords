/**
 * @file route.ts
 * @description 用户资料 API - 用于国内网络环境数据中转
 * @author InkWords Team
 * @date 2026-02-20
 *
 * 功能说明：
 * - 获取当前登录用户的完整资料
 * - 包含 VIP 状态、学习统计等所有字段
 * - 通过服务端请求绕过 GFW 阻断
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 用户资料接口
 */
interface UserProfile {
  id: string
  email: string
  name: string
  avatar: string | null
  subscription_status: string | null
  points: number
  current_period_end: string | null
  study_daily_count: number
  library_daily_count: number
  practice_tickets: number
  streak: number
  is_pro: boolean
  last_reset_date: string | null
  created_at: string
  updated_at: string
}

/**
 * GET 请求处理函数
 *
 * 获取当前登录用户的完整资料
 *
 * @param request - Next.js 请求对象
 * @returns Next.js 响应对象
 */
export async function GET(request: NextRequest) {
  try {
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
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
            }
          },
        },
      }
    )

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          message: '请先登录'
        },
        { status: 401 }
      )
    }

    console.log(`[API /user/profile] 收到请求，userId: ${authUser.id}`)

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        avatar,
        subscription_status,
        points,
        current_period_end,
        study_daily_count,
        library_daily_count,
        practice_tickets,
        streak,
        is_pro,
        last_reset_date,
        created_at,
        updated_at
      `)
      .eq('id', authUser.id)
      .single()

    if (userError) {
      console.error('[API /user/profile] 查询失败:', userError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found',
          message: '用户不存在'
        },
        { status: 404 }
      )
    }

    const profile: UserProfile = {
      id: userData.id,
      email: userData.email || authUser.email || '',
      name: userData.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || '墨语学习者',
      avatar: userData.avatar || authUser.user_metadata?.avatar_url || null,
      subscription_status: userData.subscription_status || null,
      points: userData.points || 0,
      current_period_end: userData.current_period_end || null,
      study_daily_count: userData.study_daily_count || 0,
      library_daily_count: userData.library_daily_count || 0,
      practice_tickets: userData.practice_tickets || 0,
      streak: userData.streak || 0,
      is_pro: userData.is_pro === true,
      last_reset_date: userData.last_reset_date || null,
      created_at: userData.created_at || '',
      updated_at: userData.updated_at || ''
    }

    console.log(`[API /user/profile] 成功返回用户资料，is_pro: ${profile.is_pro}`)

    return NextResponse.json({
      success: true,
      data: profile
    })

  } catch (error: any) {
    console.error('[API /user/profile] 服务器错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: '网络拥堵，请稍后重试'
      },
      { status: 500 }
    )
  }
}
