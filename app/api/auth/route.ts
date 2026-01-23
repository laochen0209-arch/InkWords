import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const UNIVERSAL_VERIFICATION_CODE = '123456'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和验证码不能为空' },
        { status: 400 }
      )
    }

    if (password !== UNIVERSAL_VERIFICATION_CODE) {
      return NextResponse.json(
        { error: '验证码错误，请检查后输入' },
        { status: 400 }
      )
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        lastLoginDate: new Date()
      },
      create: {
        email,
        password: UNIVERSAL_VERIFICATION_CODE,
        points: 0,
        streak: 0,
        lastLoginDate: new Date()
      }
    })

    return NextResponse.json(
      { 
        message: '登录成功',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          points: user.points,
          streak: user.streak
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : '未知服务器错误'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
