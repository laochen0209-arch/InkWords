/**
 * @file route.ts
 * @description 用户活动记录 API - 用于国内网络环境数据中转
 * @author InkWords Team
 * @date 2026-02-20
 *
 * 功能说明：
 * - 获取用户活动记录（支持按类型过滤）
 * - 支持分页查询
 * - 通过服务端请求绕过 GFW 阻断
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 用户活动记录接口
 */
interface UserActivity {
  id: string
  user_id: string
  action_type: 'read_article' | 'take_exam' | 'learn_word' | string
  target_id: string | null
  details: Record<string, any>
  created_at: string
}

/**
 * GET 请求处理函数
 *
 * 查询参数：
 * - userId: 用户ID（必填）
 * - action_type: 活动类型过滤（可选）
 * - limit: 返回数量限制（默认100）
 * - offset: 偏移量（默认0）
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

    const { searchParams } = new URL(request.url)
    const actionType = searchParams.get('action_type')
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    console.log(`[API /user/activities] 收到请求，userId: ${user.id}, actionType: ${actionType}`)

    let query = supabase
      .from('user_activities')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (actionType) {
      query = query.eq('action_type', actionType)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[API /user/activities] 查询失败:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database query failed',
          message: '数据加载失败，请稍后重试'
        },
        { status: 500 }
      )
    }

    console.log(`[API /user/activities] 成功返回 ${data?.length || 0} 条活动记录`)

    return NextResponse.json({
      success: true,
      data: data as UserActivity[],
      count: count || 0,
      limit,
      offset
    })

  } catch (error: any) {
    console.error('[API /user/activities] 服务器错误:', error)
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
