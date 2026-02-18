/**
 * 忘记密码 - 重置密码 API
 *
 * 文件说明：
 * 处理忘记密码时的密码重置请求
 *
 * 功能：
 * - 验证邮箱格式
 * - 验证自定义验证码（从 verification_codes 表）
 * - 更新用户密码
 * - 同步更新 public.users 表的密码
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'

/**
 * 验证邮箱格式
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  console.log('[FORGOT PASSWORD RESET API] 收到重置密码请求')

  try {
    const supabase = await createServerClient()
    const body = await request.json()
    const { email, code, newPassword } = body

    // 验证必填字段
    if (!email || !code || !newPassword) {
      console.log('[FORGOT PASSWORD RESET API] 缺少必填字段')
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    if (!isValidEmail(email)) {
      console.log('[FORGOT PASSWORD RESET API] 邮箱格式无效')
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    // 验证密码长度
    if (newPassword.length < 6) {
      console.log('[FORGOT PASSWORD RESET API] 密码太短')
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      )
    }

    // 第一步：验证自定义验证码
    console.log('[FORGOT PASSWORD RESET API] 验证自定义验证码')
    const { data: verificationData, error: verificationError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('type', 'reset')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (verificationError || !verificationData) {
      console.error('[FORGOT PASSWORD RESET API] 验证码验证失败:', verificationError)
      return NextResponse.json(
        { error: '验证码错误或已过期' },
        { status: 400 }
      )
    }

    console.log('[FORGOT PASSWORD RESET API] 验证码验证成功')

    // 第二步：获取用户并更新密码
    console.log('[FORGOT PASSWORD RESET API] 获取用户信息')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      console.error('[FORGOT PASSWORD RESET API] 用户不存在:', userError)
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 第三步：使用 Supabase Admin API 更新密码
    console.log('[FORGOT PASSWORD RESET API] 更新用户密码')
    const adminClient = createAdminClient()
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      userData.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('[FORGOT PASSWORD RESET API] 更新密码失败:', updateError)
      return NextResponse.json(
        { error: `重置密码失败: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log('[FORGOT PASSWORD RESET API] Auth 密码更新成功')

    // 第四步：同步更新 public.users 表的密码
    console.log('[FORGOT PASSWORD RESET API] 同步更新 public.users 表')
    const { error: profileError } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('email', email)

    if (profileError) {
      console.error('[FORGOT PASSWORD RESET API] 更新 public.users 失败:', profileError)
    }

    // 第五步：删除已使用的验证码
    console.log('[FORGOT PASSWORD RESET API] 删除已使用的验证码')
    await supabase
      .from('verification_codes')
      .delete()
      .eq('email', email)
      .eq('type', 'reset')

    console.log('[FORGOT PASSWORD RESET API] 密码重置成功')

    return NextResponse.json(
      {
        message: '密码重置成功',
        user: {
          email,
        },
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('[FORGOT PASSWORD RESET API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
