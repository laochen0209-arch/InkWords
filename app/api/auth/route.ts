import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 查询用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          email,
          password,
          points: 0,
          streak: 0
        }
      })
      return NextResponse.json(
        { 
          message: '注册成功',
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            avatar: newUser.avatar,
            points: newUser.points,
            streak: newUser.streak
          }
        },
        { status: 200 }
      )
    }

    if (existingUser && existingUser.password === password) {
      return NextResponse.json(
        { 
          message: '登录成功',
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            avatar: existingUser.avatar,
            points: existingUser.points,
            streak: existingUser.streak
          }
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: '邮箱或密码错误' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
