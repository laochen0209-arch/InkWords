import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const UNIVERSAL_VERIFICATION_CODE = '123456'

export async function POST(request: NextRequest) {
  console.log('[AUTH API] 收到请求')

  try {
    console.log('[AUTH API] 开始解析请求体')
    const body = await request.json()
    console.log('[AUTH API] 请求体:', JSON.stringify(body))
    
    const { email, password } = body

    if (!email || !password) {
      console.log('[AUTH API] 参数验证失败')
      return NextResponse.json(
        { error: '邮箱和验证码不能为空' },
        { status: 400 }
      )
    }

    console.log('[AUTH API] 检查验证码')
    if (password !== UNIVERSAL_VERIFICATION_CODE) {
      console.log('[AUTH API] 验证码错误')
      return NextResponse.json(
        { error: '验证码错误，请检查后输入' },
        { status: 400 }
      )
    }

    console.log('[AUTH API] 验证码正确，开始数据库操作')
    console.log('[AUTH API] 邮箱:', email)

    try {
      console.log('[AUTH API] 执行 prisma.user.upsert')
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
      
      console.log('[AUTH API] 数据库操作成功，用户ID:', user.id)
      console.log('[AUTH API] 返回成功响应')

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
    } catch (dbError: any) {
      console.error('[AUTH API] 数据库错误:', dbError)
      const errorMessage = dbError instanceof Error ? dbError.message : '数据库操作失败'
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[AUTH API] 服务器错误:', error)
    const errorMessage = error instanceof Error ? error.message : '未知服务器错误'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
