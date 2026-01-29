/**
 * 用户信息 API 路由
 * 
 * 文件说明：
 * 获取当前登录用户的详细信息，包括基本资料和学习统计
 * 
 * 功能：
 * - 获取用户基本信息
 * - 获取今日学习统计数据
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * 获取用户信息
 * 
 * 返回数据：
 * - user: 用户基本信息
 * - todayStats: 今日学习统计（学习时长、学习数量等）
 */
export async function GET(request: NextRequest) {
  console.log('[USER ME API] 收到请求')

  try {
    const email = request.headers.get('x-user-email')

    if (!email) {
      console.log('[USER ME API] 缺少用户邮箱')
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    console.log('[USER ME API] 查询用户邮箱:', email)

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        points: true,
        streak: true,
        lastLoginDate: true
      }
    })

    if (!user) {
      console.log('[USER ME API] 用户不存在')
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取今日学习统计（如果不存在则创建默认记录）
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let todayStats = await prisma.userStudyStats.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today
        }
      }
    })

    // 如果今日统计不存在，创建默认记录
    if (!todayStats) {
      console.log('[USER ME API] 今日统计不存在，创建默认记录')
      todayStats = await prisma.userStudyStats.create({
        data: {
          userId: user.id,
          date: today,
          wordsLearned: 0,
          sentencesLearned: 0,
          totalLearned: 0,
          studyTime: 0
        }
      })
    }

    console.log('[USER ME API] 查询成功，用户ID:', user.id)

    return NextResponse.json(
      { 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          points: user.points,
          streak: user.streak
        },
        todayStats: {
          wordsLearned: todayStats.wordsLearned || 0,
          sentencesLearned: todayStats.sentencesLearned || 0,
          totalLearned: todayStats.totalLearned || 0,
          studyTime: todayStats.studyTime || 0
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[USER ME API] 服务器错误:', error)
    
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
