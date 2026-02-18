/**
 * 签到 API 路由
 * 
 * 文件说明：
 * 处理用户签到操作和获取签到状态
 * 使用原生 @supabase/supabase-js 客户端
 * 
 * 功能：
 * - POST: 执行签到操作
 * - GET: 获取签到状态
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * 创建 Supabase 服务端客户端
 * 使用 Service Role Key 确保有写入权限
 */
const createSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return createClient(supabaseUrl, supabaseKey)
}

/**
 * GET 请求处理器
 * 
 * 获取用户签到状态
 * 
 * @returns 返回签到状态数据
 */
export async function GET(request: NextRequest) {
  console.log('[CHECKIN GET API] 收到请求')

  try {
    // 【关键】使用原生 supabase-js 创建服务端客户端
    const supabase = createSupabaseServerClient()
    
    // 从查询参数获取 userId
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      console.log('[CHECKIN GET API] 缺少 userId')
      return NextResponse.json(
        { error: '未授权，缺少用户标识' },
        { status: 401 }
      )
    }

    console.log('[CHECKIN GET API] 当前用户:', userId)

    // 从 users 表获取用户数据（包含 streak）
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, streak')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      console.log('[CHECKIN GET API] 用户数据不存在，创建新记录')
      // 如果 users 表没有记录，创建一个
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: '', // 暂时为空，后续可以补充
          streak: 0,
          points: 0
        })
      
      if (insertError) {
        console.error('[CHECKIN GET API] 创建用户记录失败:', insertError)
        return NextResponse.json(
          { error: '获取用户数据失败' },
          { status: 500 }
        )
      }
      
      // 返回默认数据
      return NextResponse.json(
        {
          checked: false,
          streak: 0,
          weekStatus: [false, false, false, false, false, false, false]
        },
        { status: 200 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    // 检查今日是否已签到
    const { data: todayCheckIn } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .eq('date', todayStr)
      .single()

    const checked = !!todayCheckIn

    // 获取本周签到状态
    const weekStatus = await getWeekStatus(supabase, userId, today)

    console.log('[CHECKIN GET API] 查询成功，签到状态:', { checked, streak: userData.streak, weekStatus })

    return NextResponse.json(
      {
        checked,
        streak: userData.streak || 0,
        weekStatus
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[CHECKIN GET API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

/**
 * POST 请求处理器
 * 
 * 执行签到操作
 * 
 * @returns 返回签到结果
 */
export async function POST(request: NextRequest) {
  console.log('[CHECKIN POST API] 收到请求')

  try {
    // 【关键】使用原生 supabase-js 创建服务端客户端
    const supabase = createSupabaseServerClient()
    
    // 解析前端传来的用户标识
    const body = await request.json().catch(() => ({}))
    const userId = body.userId
    
    if (!userId) {
      console.log('[CHECKIN POST API] 缺少 userId')
      return NextResponse.json(
        { error: '未授权，缺少用户标识' },
        { status: 401 }
      )
    }

    console.log('[CHECKIN POST API] 当前用户:', userId)

    // 获取用户当前数据
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, streak, points')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      console.log('[CHECKIN POST API] 用户数据不存在')
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    // 检查今日是否已签到
    const { data: existingCheckIn } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .eq('date', todayStr)
      .single()

    if (existingCheckIn) {
      console.log('[CHECKIN POST API] 今日已签到')
      return NextResponse.json(
        { error: '今日已签到' },
        { status: 400 }
      )
    }

    // 创建签到记录
    const { error: checkInError } = await supabase
      .from('check_ins')
      .insert({
        user_id: userId,
        date: todayStr
      })

    if (checkInError) {
      console.error('[CHECKIN POST API] 签到失败:', checkInError)
      return NextResponse.json(
        { error: `签到失败: ${checkInError.message || '未知错误'}` },
        { status: 500 }
      )
    }

    // 计算新的连续签到天数和积分
    const newStreak = (userData.streak || 0) + 1
    const pointsToAdd = 10 // 每次签到获得 10 积分
    const newPoints = (userData.points || 0) + pointsToAdd

    // 更新用户连续签到天数和积分
    const { error: updateError } = await supabase
      .from('users')
      .update({
        streak: newStreak,
        points: newPoints,
        last_login_date: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('[CHECKIN POST API] 更新用户数据失败:', updateError)
      // 签到记录已创建，但更新失败，返回成功但记录错误
      console.warn('[CHECKIN POST API] 签到成功但积分更新失败')
    }

    // 获取本周签到状态
    const weekStatus = await getWeekStatus(supabase, userId, today)

    console.log('[CHECKIN POST API] 签到成功，新streak:', newStreak, '新积分:', newPoints)

    return NextResponse.json(
      {
        checked: true,
        streak: newStreak,
        points: newPoints,
        pointsAdded: pointsToAdd,
        weekStatus
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[CHECKIN POST API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

/**
 * 获取本周签到状态
 * 
 * @param supabase - Supabase 客户端
 * @param userId - 用户ID
 * @param today - 今天的日期
 * @returns 本周签到状态数组（7天）
 */
async function getWeekStatus(supabase: any, userId: string, today: Date): Promise<boolean[]> {
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('date')
    .eq('user_id', userId)
    .gte('date', weekStart.toISOString().split('T')[0])
    .lte('date', weekEnd.toISOString().split('T')[0])

  const weekStatus = [false, false, false, false, false, false, false]

  checkIns?.forEach((checkIn: any) => {
    const checkInDate = new Date(checkIn.date)
    const dayOfWeek = checkInDate.getDay()
    weekStatus[dayOfWeek] = true
  })

  return weekStatus
}
