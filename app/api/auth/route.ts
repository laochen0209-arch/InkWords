import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const UNIVERSAL_VERIFICATION_CODE = '123456'

async function testDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('[AUTH API] 数据库连接测试成功')
    return true
  } catch (error: any) {
    console.error('[AUTH API] 数据库连接测试失败:', error)
    return false
  }
}

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

    console.log('[AUTH API] 测试数据库连接...')
    const isConnected = await testDatabaseConnection()
    
    if (!isConnected) {
      console.error('[AUTH API] 数据库连接失败')
      return NextResponse.json(
        { error: '数据库连接失败，请联系管理员配置 Vercel 环境变量 DATABASE_URL' },
        { status: 500 }
      )
    }

    console.log('[AUTH API] 执行 prisma.user.upsert')
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        lastLoginDate: new Date()
      },
      create: {
        email,
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
  } catch (error: any) {
    console.error('[AUTH API] 服务器错误:', error)
    console.error('[AUTH API] 错误类型:', error?.constructor?.name)
    console.error('[AUTH API] 错误消息:', error?.message || String(error))
    
    let errorMessage = error instanceof Error ? error.message : String(error)
    
    if (errorMessage.includes('Can\'t reach database server') || errorMessage.includes('Unable to establish connection')) {
      errorMessage = '数据库连接失败，请检查 Vercel 环境变量 DATABASE_URL 是否正确配置'
    }
    
    if (errorMessage.includes('column `password` does not exist')) {
      errorMessage = '数据库表结构不匹配，请联系管理员检查 User 表结构'
    }
    
    console.log('[AUTH API] 返回错误响应:', errorMessage)
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
