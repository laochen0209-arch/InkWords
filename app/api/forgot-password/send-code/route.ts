/**
 * 忘记密码 - 发送验证码 API
 *
 * 文件说明：
 * 处理忘记密码时的验证码发送请求
 *
 * 功能：
 * - 验证邮箱格式
 * - 检查用户是否存在
 * - 使用自定义邮件服务发送6位数字验证码
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendVerificationCode as sendEmail } from '@/lib/email'

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
  console.log('[FORGOT PASSWORD SEND CODE API] 收到发送验证码请求')

  try {
    const supabase = await createServerClient()
    const body = await request.json()
    const { email } = body

    // 验证邮箱格式
    if (!email || !isValidEmail(email)) {
      console.log('[FORGOT PASSWORD SEND CODE API] 邮箱格式无效')
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
      console.error('[FORGOT PASSWORD SEND CODE API] 查询用户失败:', queryError)
      return NextResponse.json(
        { error: '数据库查询失败' },
        { status: 500 }
      )
    }

    if (!existingUser) {
      console.log('[FORGOT PASSWORD SEND CODE API] 用户不存在')
      return NextResponse.json(
        { error: '该邮箱未注册' },
        { status: 400 }
      )
    }

    // 生成6位验证码
    const code = generateCode()

    // 设置过期时间（5分钟后）
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 5)

    // 删除该邮箱之前的验证码
    const { error: deleteError } = await supabase
      .from('verification_codes')
      .delete()
      .eq('email', email)
      .eq('type', 'reset')

    if (deleteError) {
      console.error('[FORGOT PASSWORD SEND CODE API] 删除旧验证码失败:', deleteError)
    }

    // 存储新验证码
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        email,
        code,
        type: 'reset',
        expires_at: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('[FORGOT PASSWORD SEND CODE API] 存储验证码失败:', insertError)
      return NextResponse.json(
        { error: '验证码存储失败: ' + insertError.message },
        { status: 500 }
      )
    }

    console.log('='.repeat(50))
    console.log('📧 发送忘记密码验证码')
    console.log('='.repeat(50))
    console.log('📧 邮箱:', email)
    console.log('🔑 验证码:', code)
    console.log('⏰ 过期时间:', expiresAt.toLocaleString())
    console.log('='.repeat(50))

    // 发送邮件
    const emailResult = await sendEmail(email, code, 'reset_password')

    if (!emailResult.success) {
      console.error('[FORGOT PASSWORD SEND CODE API] 邮件发送失败:', emailResult.message)
      return NextResponse.json(
        { error: emailResult.message },
        { status: 500 }
      )
    }

    console.log('✅ 忘记密码验证码邮件已发送')
    console.log('='.repeat(50))

    return NextResponse.json(
      {
        message: '验证码已发送到您的邮箱',
        expiresIn: 300 // 5分钟（秒）
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('[FORGOT PASSWORD SEND CODE API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
