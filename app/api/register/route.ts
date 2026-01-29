/**
 * 用户注册 API
 *
 * 文件说明：
 * 处理用户注册请求，验证邮箱验证码
 *
 * 功能：
 * - 验证邮箱格式
 * - 验证验证码是否正确且未过期
 * - 检查邮箱是否已注册
 * - 创建新用户
 * - 删除已使用的验证码
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * 验证邮箱格式
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  console.log('[REGISTER API] 收到注册请求')

  try {
    const body = await request.json()
    const { email, password, code, name } = body

    // 验证必填字段
    if (!email || !password || !code) {
      console.log('[REGISTER API] 缺少必填字段')
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    if (!isValidEmail(email)) {
      console.log('[REGISTER API] 邮箱格式无效')
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    // 验证密码长度
    if (password.length < 6) {
      console.log('[REGISTER API] 密码太短')
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('[REGISTER API] 邮箱已注册')
      return NextResponse.json(
        { error: '该邮箱已注册' },
        { status: 400 }
      )
    }

    // 验证验证码
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        type: 'register',
        expiresAt: {
          gt: new Date() // 未过期
        }
      },
      orderBy: {
        createdAt: 'desc' // 取最新的验证码
      }
    })

    if (!verificationCode) {
      console.log('[REGISTER API] 验证码已过期或不存在')
      return NextResponse.json(
        { error: '验证码已过期，请重新获取' },
        { status: 400 }
      )
    }

    if (verificationCode.code !== code) {
      console.log('[REGISTER API] 验证码错误')
      return NextResponse.json(
        { error: '验证码错误' },
        { status: 400 }
      )
    }

    // 创建新用户
    const newUser = await prisma.user.create({
      data: {
        email,
        password, // 注意：生产环境应该加密密码
        name: name || email.split('@')[0], // 如果没有提供名称，使用邮箱前缀
        points: 0,
        streak: 0
      }
    })

    // 删除已使用的验证码
    await prisma.verificationCode.deleteMany({
      where: {
        email,
        type: 'register'
      }
    })

    console.log('[REGISTER API] 注册成功:', newUser.email)

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

  } catch (error) {
    console.error('[REGISTER API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
