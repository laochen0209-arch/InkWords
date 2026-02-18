/**
 * 修改密码 - 发送验证码 API
 *
 * 文件说明：
 * 处理修改密码时的验证码发送请求
 *
 * 功能：
 * - 验证邮箱格式
 * - 检查用户是否登录
 * - 使用 Supabase Auth 发送 OTP 验证码
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * 验证邮箱格式
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  console.log('[CHANGE PASSWORD SEND CODE API] 收到发送验证码请求')

  try {
    const supabase = await createServerClient()
    const body = await request.json()
    const { email } = body

    // 验证邮箱格式
    if (!email || !isValidEmail(email)) {
      console.log('[CHANGE PASSWORD SEND CODE API] 邮箱格式无效')
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    // 检查用户是否存在
    const { data: existingUser, error: queryError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (queryError && queryError.code !== 'PGRST116') {
      console.error('[CHANGE PASSWORD SEND CODE API] 查询用户失败:', queryError)
      return NextResponse.json(
        { error: '数据库查询失败' },
        { status: 500 }
      )
    }

    if (!existingUser) {
      console.log('[CHANGE PASSWORD SEND CODE API] 用户不存在')
      return NextResponse.json(
        { error: '该邮箱未注册' },
        { status: 400 }
      )
    }

    // 使用 Supabase Auth 发送 OTP 验证码
    console.log('[CHANGE PASSWORD SEND CODE API] 发送 OTP 验证码:', email)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // 不创建新用户，只发送给已存在的用户
      },
    })

    if (otpError) {
      console.error('[CHANGE PASSWORD SEND CODE API] 发送 OTP 失败:', otpError)
      return NextResponse.json(
        { error: `发送验证码失败: ${otpError.message}` },
        { status: 500 }
      )
    }

    console.log('[CHANGE PASSWORD SEND CODE API] OTP 验证码发送成功')

    return NextResponse.json(
      {
        message: '验证码已发送到您的邮箱',
        expiresIn: 3600, // OTP 通常有效期为 1 小时（3600秒）
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('[CHANGE PASSWORD SEND CODE API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
