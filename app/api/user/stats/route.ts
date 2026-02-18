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
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 获取用户统计数据
 * GET /api/user/stats
 *
 * 返回数据：
 * - study_daily_count: 今日学习数量
 * - library_daily_count: 今日阅读数量
 * - practice_tickets: 练习券数量
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
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('study_daily_count, library_daily_count, practice_tickets')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: '查询失败: ' + userError.message },
        { status: 500 }
      )
    }

    const today = new Date().toISOString().split('T')[0]
    const { data: todayStudyData, error: studyError } = await supabase
      .from('study_records')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', today)
      .lte('created_at', today + 'T23:59:59')

    const { data: todayReadingData, error: readingError } = await supabase
      .from('reading_records')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', today)
      .lte('created_at', today + 'T23:59:59')

    const stats = {
      study_daily_count: todayStudyData?.length || userData?.study_daily_count || 0,
      library_daily_count: todayReadingData?.length || userData?.library_daily_count || 0,
      practice_tickets: userData?.practice_tickets || 0,
    }

    return NextResponse.json(
      { stats },
      { status: 200 }
    )
  } catch (error) {
    console.error('[USER STATS API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
