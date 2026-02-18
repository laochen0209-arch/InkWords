/**
 * 修改密码 - 重置密码 API
 *
 * 文件说明：
 * 处理修改密码时的密码重置请求
 *
 * 功能：
 * - 验证邮箱格式
 * - 验证验证码（OTP）
 * - 更新用户密码
 * - 同步更新 public.users 表的密码
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
  console.log('[CHANGE PASSWORD RESET API] 收到修改密码请求')

  try {
    const supabase = await createServerClient()
    const body = await request.json()
    const { email, code, newPassword } = body

    // 验证必填字段
    if (!email || !code || !newPassword) {
      console.log('[CHANGE PASSWORD RESET API] 缺少必填字段')
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    if (!isValidEmail(email)) {
      console.log('[CHANGE PASSWORD RESET API] 邮箱格式无效')
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    // 验证密码长度
    if (newPassword.length < 6) {
      console.log('[CHANGE PASSWORD RESET API] 密码太短')
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      )
    }

    // 第一步：验证 OTP 验证码
    console.log('[CHANGE PASSWORD RESET API] 验证 OTP 验证码')
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    if (verifyError) {
      console.error('[CHANGE PASSWORD RESET API] 验证码验证失败:', verifyError)
      return NextResponse.json(
        { error: `验证码错误或已过期: ${verifyError.message}` },
        { status: 400 }
      )
    }

    if (!verifyData.session) {
      console.error('[CHANGE PASSWORD RESET API] 验证成功但未获取到 session')
      return NextResponse.json(
        { error: '验证失败，请重试' },
        { status: 500 }
      )
    }

    console.log('[CHANGE PASSWORD RESET API] OTP 验证成功，获取到 session')

    // 第二步：更新用户密码
    console.log('[CHANGE PASSWORD RESET API] 更新用户密码')
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('[CHANGE PASSWORD RESET API] 更新密码失败:', updateError)
      return NextResponse.json(
        { error: `修改密码失败: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log('[CHANGE PASSWORD RESET API] Auth 密码更新成功')

    // 第三步：同步更新 public.users 表的密码
    console.log('[CHANGE PASSWORD RESET API] 同步更新 public.users 表')
    const { error: profileError } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('email', email)

    if (profileError) {
      console.error('[CHANGE PASSWORD RESET API] 更新 public.users 失败:', profileError)
      // 虽然 Auth 密码已更新成功，但记录一下错误
      // 不影响返回成功，因为用户可以使用新密码登录了
    }

    console.log('[CHANGE PASSWORD RESET API] 密码修改成功')

    return NextResponse.json(
      {
        message: '密码修改成功',
        user: {
          email,
        },
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('[CHANGE PASSWORD RESET API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
