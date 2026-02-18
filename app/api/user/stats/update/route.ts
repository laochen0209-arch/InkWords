/**
 * 更新用户统计数据 API
 *
 * 文件说明：
 * 更新用户今日学习、阅读、练习券等统计数据
 *
 * 功能：
 * - 增加今日学习计数 (study_daily_count)
 * - 增加今日阅读计数 (library_daily_count)
 * - 消耗练习券 (practice_tickets)
 * - 增加积分 (points)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * 更新用户统计数据
 * POST /api/user/stats/update
 *
 * 请求体：
 * - action: 'study' | 'read' | 'practice' | 'earn_points'
 * - value?: number (可选，默认为 1)
 * - userId?: string (可选，用户ID)
 */
export async function POST(request: NextRequest) {
  console.log('[USER STATS UPDATE API] 收到请求')

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 解析请求体
    const body = await request.json()
    const { action, value = 1, userId: bodyUserId } = body

    // 从查询参数获取 userId
    const { searchParams } = new URL(request.url)
    const queryUserId = searchParams.get('userId')

    const userId = bodyUserId || queryUserId

    if (!userId) {
      console.log('[USER STATS UPDATE API] 未授权访问，缺少用户标识')
      return NextResponse.json(
        { error: '未授权访问，缺少用户标识' },
        { status: 401 }
      )
    }

    if (!action || !['study', 'read', 'practice', 'earn_points'].includes(action)) {
      return NextResponse.json(
        { error: '无效的 action 参数' },
        { status: 400 }
      )
    }

    console.log(`[USER STATS UPDATE API] 用户 ${userId} 执行 ${action} 操作，值: ${value}`)

    // 获取当前用户数据（包含会员状态）
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('study_daily_count, library_daily_count, practice_tickets, points, last_reset_date, subscription_status')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('[USER STATS UPDATE API] 获取用户数据失败:', fetchError)
      return NextResponse.json(
        { error: '获取用户数据失败: ' + fetchError.message },
        { status: 500 }
      )
    }

    // 检查是否需要重置每日计数（新的一天）
    const today = new Date().toISOString().split('T')[0]
    const lastResetDate = userData?.last_reset_date
      ? new Date(userData.last_reset_date).toISOString().split('T')[0]
      : null

    let updates: any = {}

    // 如果是新的一天，重置每日计数
    if (lastResetDate !== today) {
      updates.study_daily_count = 0
      updates.library_daily_count = 0
      updates.last_reset_date = new Date().toISOString()
    }

    // 根据 action 更新相应字段
    switch (action) {
      case 'study':
        updates.study_daily_count = (updates.study_daily_count ?? userData?.study_daily_count ?? 0) + value
        break
      case 'read':
        updates.library_daily_count = (updates.library_daily_count ?? userData?.library_daily_count ?? 0) + value
        break
      case 'practice':
        // 检查用户是否是 VIP（会员免练习券）
        const isVip = ['yearly', 'monthly', 'active', 'pro'].includes(userData?.subscription_status || '')
        
        if (isVip) {
          // VIP 用户不消耗练习券
          console.log('[USER STATS UPDATE API] VIP 用户免练习券')
          updates.practice_tickets = userData?.practice_tickets ?? 5
        } else {
          // 非 VIP 用户消耗练习券
          const currentTickets = userData?.practice_tickets ?? 5
          if (currentTickets < value) {
            return NextResponse.json(
              { error: '练习券不足', currentTickets },
              { status: 403 }
            )
          }
          updates.practice_tickets = currentTickets - value
        }
        break
      case 'earn_points':
        updates.points = (userData?.points ?? 0) + value
        break
    }

    // 更新数据库
    const { data: updatedData, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('[USER STATS UPDATE API] 更新失败:', updateError)
      return NextResponse.json(
        { error: '更新失败: ' + updateError.message },
        { status: 500 }
      )
    }

    console.log('[USER STATS UPDATE API] 更新成功:', updates)

    return NextResponse.json(
      {
        success: true,
        stats: {
          study_daily_count: updatedData.study_daily_count,
          library_daily_count: updatedData.library_daily_count,
          practice_tickets: updatedData.practice_tickets,
          points: updatedData.points,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[USER STATS UPDATE API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
