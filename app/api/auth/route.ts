import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const UNIVERSAL_VERIFICATION_CODE = '123456'

export async function POST(request: NextRequest) {
  try {
    console.log('='.repeat(60))
    console.log('🔐 [AUTH API] 开始处理请求')
    console.log('='.repeat(60))

    const body = await request.json()
    const { email, password } = body

    console.log('📧 接收参数 - email:', email, 'password:', password)

    if (!email || !password) {
      console.log('❌ 参数验证失败：邮箱和验证码不能为空')
      return NextResponse.json(
        { error: '邮箱和验证码不能为空' },
        { status: 400 }
      )
    }

    console.log('🔑 检查验证码...')
    
    if (password !== UNIVERSAL_VERIFICATION_CODE) {
      console.log('❌ 验证码错误')
      return NextResponse.json(
        { error: '验证码错误，请检查后输入' },
        { status: 400 }
      )
    }

    console.log('✅ 验证码正确（万能验证码）')

    console.log('🔍 查询用户是否存在...')
    let user
    
    try {
      user = await prisma.user.upsert({
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
      
      console.log('✅ 用户操作成功 - ID:', user.id)
      console.log('📊 用户数据:', {
        id: user.id,
        email: user.email,
        points: user.points,
        streak: user.streak
      })
    } catch (dbError) {
      console.error('❌ 数据库操作失败:', dbError)
      return NextResponse.json(
        { error: '数据库操作失败，请稍后重试' },
        { status: 500 }
      )
    }

    console.log('='.repeat(60))
    console.log('🎉 [AUTH API] 请求处理成功')
    console.log('='.repeat(60))

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
  } catch (error) {
    console.error('='.repeat(60))
    console.error('❌ [AUTH API] 服务器错误:', error)
    console.error('错误类型:', error instanceof Error ? error.name : typeof error)
    console.error('错误消息:', error instanceof Error ? error.message : String(error))
    console.error('='.repeat(60))
    
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
