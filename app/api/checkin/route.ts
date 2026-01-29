/**
 * 签到 API 路由
 * 
 * 文件说明：
 * 处理用户签到操作和获取签到状态
 * 
 * 功能：
 * - POST: 执行签到操作
 * - GET: 获取签到状态
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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
    const email = request.headers.get('x-user-email')

    if (!email) {
      console.log('[CHECKIN GET API] 缺少用户邮箱')
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    console.log('[CHECKIN GET API] 查询用户邮箱:', email)

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        streak: true
      }
    })

    if (!user) {
      console.log('[CHECKIN GET API] 用户不存在')
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayCheckIn = await prisma.checkIn.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today
        }
      }
    })

    const checked = !!todayCheckIn

    const weekStatus = await getWeekStatus(user.id, today)

    console.log('[CHECKIN GET API] 查询成功，签到状态:', { checked, streak: user.streak, weekStatus })

    return NextResponse.json(
      {
        checked,
        streak: user.streak,
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
    const email = request.headers.get('x-user-email')

    if (!email) {
      console.log('[CHECKIN POST API] 缺少用户邮箱')
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('[CHECKIN POST API] 用户邮箱:', email)

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('[CHECKIN POST API] 用户不存在')
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingCheckIn = await prisma.checkIn.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today
        }
      }
    })

    if (existingCheckIn) {
      console.log('[CHECKIN POST API] 今日已签到')
      return NextResponse.json(
        { error: '今日已签到' },
        { status: 400 }
      )
    }

    const checkIn = await prisma.checkIn.create({
      data: {
        userId: user.id,
        date: today
      }
    })

    const newStreak = user.streak + 1

    await prisma.user.update({
      where: { id: user.id },
      data: {
        streak: newStreak,
        lastLoginDate: new Date()
      }
    })

    const weekStatus = await getWeekStatus(user.id, today)

    console.log('[CHECKIN POST API] 签到成功，新streak:', newStreak)

    return NextResponse.json(
      {
        checked: true,
        streak: newStreak,
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
 * @param userId - 用户ID
 * @param today - 今天的日期
 * @returns 本周签到状态数组（7天）
 */
async function getWeekStatus(userId: string, today: Date): Promise<boolean[]> {
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const checkIns = await prisma.checkIn.findMany({
    where: {
      userId,
      date: {
        gte: weekStart,
        lte: weekEnd
      }
    }
  })

  const weekStatus = [false, false, false, false, false, false, false, false]

  checkIns.forEach(checkIn => {
    const dayOfWeek = checkIn.date.getDay()
    weekStatus[dayOfWeek] = true
  })

  return weekStatus
}
