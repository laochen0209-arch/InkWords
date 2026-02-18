/**
 * 验证邮箱验证码 API
 *
 * 文件说明：
 * 验证用户输入的邮箱验证码
 *
 * 功能：
 * - 验证验证码是否正确
 * - 检查验证码是否过期
 * - 删除已使用的验证码
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * 验证验证码
 * POST /api/verify-code
 *
 * 请求体：
 * - email: 邮箱地址
 * - code: 验证码
 * - type: 验证码类型（register, reset_password, change_email）
 */
export async function POST(request: NextRequest) {
  console.log('[VERIFY CODE API] 收到验证请求')

  try {
    // 【修复】使用带 cookie 支持的客户端
    const supabase = await createServerClient()

    const body = await request.json()
    const { email, code, type = 'register' } = body

    // 验证必填字段
    if (!email || !code) {
      console.log('[VERIFY CODE API] 缺少必填字段')
      return NextResponse.json(
        { error: '请填写邮箱和验证码' },
        { status: 400 }
      )
    }

    // 查询验证码
    const { data: verificationData, error: queryError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('type', type)
      .single()

    if (queryError || !verificationData) {
      console.log('[VERIFY CODE API] 验证码不存在或错误')
      return NextResponse.json(
        { error: '验证码错误或已过期' },
        { status: 400 }
      )
    }

    // 检查验证码是否过期
    const expiresAt = new Date(verificationData.expires_at)
    const now = new Date()

    if (now > expiresAt) {
      console.log('[VERIFY CODE API] 验证码已过期')
      // 删除过期验证码
      await supabase
        .from('verification_codes')
        .delete()
        .eq('id', verificationData.id)

      return NextResponse.json(
        { error: '验证码已过期，请重新获取' },
        { status: 400 }
      )
    }

    console.log('[VERIFY CODE API] 验证码验证成功')

    // 删除已使用的验证码
    const { error: deleteError } = await supabase
      .from('verification_codes')
      .delete()
      .eq('id', verificationData.id)

    if (deleteError) {
      console.error('[VERIFY CODE API] 删除验证码失败:', deleteError)
      // 非致命错误，继续执行
    }

    return NextResponse.json(
      {
        message: '验证码验证成功',
        email: email,
        type: type
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('[VERIFY CODE API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
