/**
 * @fileoverview 用户学习进度API
 * @description 记录和获取用户学习进度，支持智能学习系统的核心功能
 * @author InkWords Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * 进度项类型
 */
interface ProgressItem {
  contentType: string
  contentId: string
}

/**
 * 记录用户学习进度
 * POST /api/study/progress
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { category, contentType, contentId } = body

    if (!category || !contentType || !contentId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 记录学习进度
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_category_contentType_contentId: {
          userId,
          category,
          contentType,
          contentId,
        },
      },
      update: {
        isLearned: true,
        learnedAt: new Date(),
      },
      create: {
        userId,
        category,
        contentType,
        contentId,
        isLearned: true,
        learnedAt: new Date(),
      },
    })

    // 更新今日学习统计
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.userStudyStats.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        [contentType === 'word' ? 'wordsLearned' : 'sentencesLearned']: {
          increment: 1,
        },
        totalLearned: {
          increment: 1,
        },
      },
      create: {
        userId,
        date: today,
        [contentType === 'word' ? 'wordsLearned' : 'sentencesLearned']: 1,
        totalLearned: 1,
      },
    })

    return NextResponse.json(
      { success: true, progress },
      { status: 200 }
    )
  } catch (error) {
    console.error('记录学习进度失败:', error)
    return NextResponse.json(
      { error: '记录学习进度失败' },
      { status: 500 }
    )
  }
}

/**
 * 获取用户学习进度
 * GET /api/study/progress?category=daily
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { learnedIds: [] },
        { status: 200 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const whereClause: {
      userId: string
      isLearned: boolean
      category?: string
    } = {
      userId,
      isLearned: true,
    }

    if (category) {
      whereClause.category = category
    }

    const progress = await prisma.userProgress.findMany({
      where: whereClause,
      select: {
        contentType: true,
        contentId: true,
        learnedAt: true,
      },
    })

    // 按类型分组
    const learnedIds = {
      words: progress.filter((p: ProgressItem) => p.contentType === 'word').map((p: ProgressItem) => p.contentId),
      sentences: progress.filter((p: ProgressItem) => p.contentType === 'sentence').map((p: ProgressItem) => p.contentId),
    }

    return NextResponse.json(
      { learnedIds },
      { status: 200 }
    )
  } catch (error) {
    console.error('获取学习进度失败:', error)
    return NextResponse.json(
      { learnedIds: { words: [], sentences: [] } },
      { status: 200 }
    )
  }
}

/**
 * 重置用户学习进度
 * DELETE /api/study/progress?category=daily
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const whereClause: {
      userId: string
      category?: string
    } = { userId }

    if (category) {
      whereClause.category = category
    }

    await prisma.userProgress.deleteMany({
      where: whereClause,
    })

    return NextResponse.json(
      { success: true, message: '学习进度已重置' },
      { status: 200 }
    )
  } catch (error) {
    console.error('重置学习进度失败:', error)
    return NextResponse.json(
      { error: '重置学习进度失败' },
      { status: 500 }
    )
  }
}
