import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, score, mode } = body

    if (!userId || !score || !mode) {
      return NextResponse.json(
        { error: '参数不完整' },
        { status: 400 }
      )
    }

    const practiceLog = await prisma.practiceLog.create({
      data: {
        userId,
        score,
        mode,
      }
    })

    return NextResponse.json(
      { 
        message: '练习记录保存成功',
        log: practiceLog
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Practice submit error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
