import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const TEST_VERIFICATION_CODE = '123456'

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

    console.log('='.repeat(50))
    console.log('🔐 验证登录/注册请求')
    console.log('='.repeat(50))
    console.log('📧 邮箱:', email)
    console.log('🔑 验证码:', password)
    console.log('='.repeat(50))

    if (password !== TEST_VERIFICATION_CODE) {
      console.log('❌ 验证码错误')
      return NextResponse.json(
        { error: '验证码错误' },
        { status: 400 }
      )
    }

    console.log('✅ 验证码正确（万能验证码）')

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    let user

    if (!existingUser) {
      console.log('📝 创建新用户')
      user = await prisma.user.create({
        data: {
          email,
          password: TEST_VERIFICATION_CODE,
          points: 0,
          streak: 0
        }
      })
      console.log('✅ 用户创建成功:', user.id)
    } else {
      console.log('📝 更新现有用户')
      user = await prisma.user.update({
        where: { email },
        data: {
          lastLoginDate: new Date()
        }
      })
      console.log('✅ 用户更新成功:', user.id)
    }

    console.log('='.repeat(50))
    console.log('🎉 登录/注册成功')
    console.log('='.repeat(50))

    return NextResponse.json(
      { 
        message: existingUser ? '登录成功' : '注册成功',
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
  } catch (error) {
    console.error('='.repeat(50))
    console.error('❌ Auth error:', error)
    console.error('='.repeat(50))
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
