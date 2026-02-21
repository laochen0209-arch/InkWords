/**
 * @file route.ts
 * @description 用户配额 API - 用于检查和消耗用户配额
 * @author InkWords Team
 * @date 2026-02-20
 *
 * 功能说明：
 * - GET: 获取用户当前配额状态
 * - POST: 检查并消耗配额
 * - 支持学习配额、阅读配额、练习券检查
 * - VIP 用户直接放行
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 配额类型
 */
type QuotaType = 'study' | 'library' | 'practice'

/**
 * 配额检查结果
 */
interface QuotaCheckResult {
  allowed: boolean
  error?: string
  code?: string
  remaining?: number
  isVip?: boolean
}

/**
 * 免费用户每日限制
 */
const DAILY_LIMITS: Record<QuotaType, number> = {
  study: 5,
  library: 5,
  practice: 0
}

/**
 * 检查用户是否为 VIP
 */
function checkIsVip(user: {
  is_pro?: boolean
  subscription_status?: string | null
  current_period_end?: string | null
}): boolean {
  if (user.is_pro === true) {
    return true
  }

  const vipStatuses = ['yearly', 'monthly', 'active', 'pro']
  if (user.subscription_status && vipStatuses.includes(user.subscription_status.toLowerCase())) {
    if (user.current_period_end) {
      const expiryDate = new Date(user.current_period_end)
      const now = new Date()
      return expiryDate > now
    }
    return true
  }

  return false
}

/**
 * GET 请求处理函数
 * 获取用户当前配额状态
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

    console.log(`[API /user/quota] GET 请求，userId: ${authUser.id}`)

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        is_pro,
        subscription_status,
        current_period_end,
        study_daily_count,
        library_daily_count,
        practice_tickets,
        last_reset_date
      `)
      .eq('id', authUser.id)
      .single()

    if (userError) {
      console.error('[API /user/quota] 查询失败:', userError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database query failed',
          message: '数据加载失败，请稍后重试'
        },
        { status: 500 }
      )
    }

    const isVip = checkIsVip(userData || {})

    const quota = {
      isVip,
      study: {
        used: userData?.study_daily_count || 0,
        limit: isVip ? -1 : DAILY_LIMITS.study,
        remaining: isVip ? -1 : Math.max(0, DAILY_LIMITS.study - (userData?.study_daily_count || 0))
      },
      library: {
        used: userData?.library_daily_count || 0,
        limit: isVip ? -1 : DAILY_LIMITS.library,
        remaining: isVip ? -1 : Math.max(0, DAILY_LIMITS.library - (userData?.library_daily_count || 0))
      },
      practice: {
        tickets: userData?.practice_tickets || 0,
        limit: isVip ? -1 : 0
      }
    }

    return NextResponse.json({
      success: true,
      quota
    })

  } catch (error: any) {
    console.error('[API /user/quota] 服务器错误:', error)
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

/**
 * POST 请求处理函数
 * 检查并消耗配额
 *
 * 请求体：
 * - type: 配额类型 (study | library | practice)
 * - action: 操作类型 (check | consume)
 *
 * @param request - Next.js 请求对象
 * @returns Next.js 响应对象
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { type, action = 'check' } = body as { type: QuotaType; action?: 'check' | 'consume' }

    if (!type || !['study', 'library', 'practice'].includes(type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid quota type',
          message: '无效的配额类型'
        },
        { status: 400 }
      )
    }

    console.log(`[API /user/quota] POST 请求，userId: ${authUser.id}, type: ${type}, action: ${action}`)

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        is_pro,
        subscription_status,
        current_period_end,
        study_daily_count,
        library_daily_count,
        practice_tickets,
        last_reset_date
      `)
      .eq('id', authUser.id)
      .single()

    if (userError) {
      console.error('[API /user/quota] 查询失败:', userError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database query failed',
          message: '数据加载失败，请稍后重试'
        },
        { status: 500 }
      )
    }

    const isVip = checkIsVip(userData || {})

    if (isVip) {
      return NextResponse.json({
        success: true,
        result: {
          allowed: true,
          isVip: true,
          remaining: -1
        } as QuotaCheckResult
      })
    }

    const today = new Date().toISOString().split('T')[0]
    const lastReset = userData?.last_reset_date
      ? new Date(userData.last_reset_date).toISOString().split('T')[0]
      : null

    let studyDailyCount = userData?.study_daily_count || 0
    let libraryDailyCount = userData?.library_daily_count || 0
    let practiceTickets = userData?.practice_tickets || 0

    if (lastReset !== today) {
      studyDailyCount = 0
      libraryDailyCount = 0
      await supabase
        .from('users')
        .update({
          study_daily_count: 0,
          library_daily_count: 0,
          last_reset_date: new Date().toISOString()
        })
        .eq('id', authUser.id)
    }

    let result: QuotaCheckResult

    switch (type) {
      case 'study':
        if (studyDailyCount >= DAILY_LIMITS.study) {
          result = {
            allowed: false,
            error: '今日学习次数已达上限，请升级会员享受无限学习',
            code: 'LIMIT_REACHED',
            remaining: 0,
            isVip: false
          }
        } else {
          if (action === 'consume') {
            await supabase
              .from('users')
              .update({ study_daily_count: studyDailyCount + 1 })
              .eq('id', authUser.id)
          }
          result = {
            allowed: true,
            remaining: DAILY_LIMITS.study - studyDailyCount - (action === 'consume' ? 1 : 0),
            isVip: false
          }
        }
        break

      case 'library':
        if (libraryDailyCount >= DAILY_LIMITS.library) {
          result = {
            allowed: false,
            error: '今日阅读次数已达上限，请升级会员享受无限阅读',
            code: 'LIMIT_REACHED',
            remaining: 0,
            isVip: false
          }
        } else {
          if (action === 'consume') {
            await supabase
              .from('users')
              .update({ library_daily_count: libraryDailyCount + 1 })
              .eq('id', authUser.id)
          }
          result = {
            allowed: true,
            remaining: DAILY_LIMITS.library - libraryDailyCount - (action === 'consume' ? 1 : 0),
            isVip: false
          }
        }
        break

      case 'practice':
        if (practiceTickets <= 0) {
          result = {
            allowed: false,
            error: '练习券已用完，请升级会员享受无限练习',
            code: 'NO_TICKETS',
            remaining: 0,
            isVip: false
          }
        } else {
          if (action === 'consume') {
            await supabase
              .from('users')
              .update({ practice_tickets: practiceTickets - 1 })
              .eq('id', authUser.id)
          }
          result = {
            allowed: true,
            remaining: practiceTickets - (action === 'consume' ? 1 : 0),
            isVip: false
          }
        }
        break

      default:
        result = {
          allowed: false,
          error: '未知的配额类型',
          code: 'UNKNOWN_TYPE',
          isVip: false
        }
    }

    console.log(`[API /user/quota] 返回结果:`, result)

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error: any) {
    console.error('[API /user/quota] 服务器错误:', error)
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
