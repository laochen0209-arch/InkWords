/**
 * 用户统计数据 API
 *
 * 文件说明：
 * 获取用户今日学习、阅读、练习券等统计数据
 *
 * 功能：
 * - 获取今日学习统计 (study_daily_count)
 * - 获取今日阅读统计 (library_daily_count)
 * - 获取练习券数量 (practice_tickets)
 * - 获取 VIP 状态 (is_pro, subscription_status)
 * - 获取连续学习天数 (streak)
 *
 * @author InkWords Team
 * @date 2026-02-20
 * @version 2.0.0 - 增强版，支持更多字段
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 用户统计数据接口
 */
interface UserStats {
  study_daily_count: number
  library_daily_count: number
  practice_tickets: number
  streak: number
  points: number
  is_pro: boolean
  subscription_status: string | null
  current_period_end: string | null
  last_reset_date: string | null
}

/**
 * 获取用户统计数据
 * GET /api/user/stats
 *
 * 返回数据：
 * - study_daily_count: 今日学习数量
 * - library_daily_count: 今日阅读数量
 * - practice_tickets: 练习券数量
 * - streak: 连续学习天数
 * - points: 积分
 * - is_pro: VIP 状态
 * - subscription_status: 订阅状态
 * - current_period_end: 会员到期时间
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          message: '请先登录'
        },
        { status: 401 }
      )
    }

    console.log(`[API /user/stats] 收到请求，userId: ${user.id}`)

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        study_daily_count,
        library_daily_count,
        practice_tickets,
        streak,
        points,
        is_pro,
        subscription_status,
        current_period_end,
        last_reset_date
      `)
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('[API /user/stats] 查询失败:', userError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database query failed',
          message: '数据加载失败，请稍后重试'
        },
        { status: 500 }
      )
    }

    const stats: UserStats = {
      study_daily_count: userData?.study_daily_count || 0,
      library_daily_count: userData?.library_daily_count || 0,
      practice_tickets: userData?.practice_tickets || 0,
      streak: userData?.streak || 0,
      points: userData?.points || 0,
      is_pro: userData?.is_pro === true,
      subscription_status: userData?.subscription_status || null,
      current_period_end: userData?.current_period_end || null,
      last_reset_date: userData?.last_reset_date || null
    }

    console.log(`[API /user/stats] 成功返回统计数据，is_pro: ${stats.is_pro}`)

    return NextResponse.json(
      { 
        success: true,
        stats 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[API /user/stats] 服务器错误:', error)
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
