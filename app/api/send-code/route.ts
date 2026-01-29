/**
 * 发送邮箱验证码 API
 * 
 * 文件说明：
 * 用于发送邮箱验证码，支持注册和重置密码场景
 * 
 * 功能：
 * - 生成6位随机验证码
 * - 存储到数据库并设置过期时间（5分钟）
 * - 测试模式直接返回验证码
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * 生成6位随机验证码
 */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * 验证邮箱格式
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  console.log('[SEND CODE API] 收到发送验证码请求')

  try {
    const body = await request.json()
    const { email, type = 'register' } = body

    // 验证邮箱格式
    if (!email || !isValidEmail(email)) {
      console.log('[SEND CODE API] 邮箱格式无效')
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    // 如果是注册，检查邮箱是否已存在
    if (type === 'register') {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        console.log('[SEND CODE API] 邮箱已注册')
        return NextResponse.json(
          { error: '该邮箱已注册' },
          { status: 400 }
        )
      }
    }

    // 生成验证码
    const code = generateCode()

    // 设置过期时间（5分钟后）
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 5)

    // 删除该邮箱之前的验证码
    await prisma.verificationCode.deleteMany({
      where: {
        email,
        type
      }
    })

    // 存储新验证码
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        type,
        expiresAt
      }
    })

    console.log('='.repeat(50))
    console.log('📧 测试模式：发送邮箱验证码')
    console.log('='.repeat(50))
    console.log('📧 邮箱:', email)
    console.log('🔑 验证码:', code)
    console.log('⏰ 过期时间:', expiresAt.toLocaleString())
    console.log('='.repeat(50))
    console.log('✅ 验证码已发送（测试模式）')
    console.log('='.repeat(50))

    return NextResponse.json(
      { 
        message: '验证码发送成功',
        code: code, // 测试模式返回验证码
        expiresIn: 300 // 5分钟（秒）
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('[SEND CODE API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
