/**
 * @file route.ts
 * @description 获取考试结果详情接口
 * @author InkWords Team
 * @date 2026-02-01
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET 获取考试结果
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: '结果ID不能为空' },
        { status: 400 }
      )
    }

    // 从数据库查询考试结果
    const examResult = await prisma.examResult.findUnique({
      where: { id }
    })

    if (!examResult) {
      return NextResponse.json(
        { error: '考试结果不存在' },
        { status: 404 }
      )
    }

    // 返回结果
    return NextResponse.json({
      id: examResult.id,
      examType: examResult.examType,
      score: examResult.score,
      maxScore: examResult.maxScore,
      details: examResult.details,
      aiFeedback: examResult.aiFeedback,
      createdAt: examResult.createdAt.toISOString()
    })
  } catch (error) {
    console.error('获取考试结果失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
