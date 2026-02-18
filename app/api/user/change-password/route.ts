/**
 * 用户密码修改 API
 *
 * 文件说明：
 * 修改用户密码，使用 Supabase Auth 进行验证和更新
 *
 * 功能：
 * - 验证当前密码
 * - 更新 public.users 表的 password 字段
 * - 更新 Supabase Auth 用户密码
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 环境变量检查
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * 创建 Supabase Admin 客户端
 * 使用 Service Role Key 绕过 RLS
 */
const createAdminClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase 环境变量未设置')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * 修改密码
 * POST /api/user/change-password
 *
 * 请求体：
 * - userId: 用户ID（必填）
 * - currentPassword: 当前密码
 * - newPassword: 新密码
 */
export async function POST(request: NextRequest) {
  console.log('[CHANGE PASSWORD API] 收到密码修改请求')

  try {
    // 【修复】严格检查环境变量
    if (!supabaseUrl) {
      console.error('[CHANGE PASSWORD API] NEXT_PUBLIC_SUPABASE_URL 未设置')
      return NextResponse.json(
        { error: '服务器配置错误：缺少 Supabase URL' },
        { status: 500 }
      )
    }

    if (!supabaseServiceKey) {
      console.error('[CHANGE PASSWORD API] SUPABASE_SERVICE_ROLE_KEY 未设置')
      return NextResponse.json(
        { error: '服务器配置错误：缺少 Service Role Key' },
        { status: 500 }
      )
    }

    const supabase = createAdminClient()

    const body = await request.json()
    const { userId, currentPassword, newPassword } = body

    if (!userId) {
      console.log('[CHANGE PASSWORD API] 缺少 userId')
      return NextResponse.json(
        { error: '未授权访问，缺少用户标识' },
        { status: 401 }
      )
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '请填写当前密码和新密码' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '新密码长度至少为6位' },
        { status: 400 }
      )
    }

    const { data: userData, error: queryError } = await supabase
      .from('users')
      .select('password, email')
      .eq('id', userId)
      .single()

    if (queryError || !userData) {
      console.error('[CHANGE PASSWORD API] 查询用户失败:', queryError)
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    if (userData.password !== currentPassword) {
      console.log('[CHANGE PASSWORD API] 当前密码错误')
      return NextResponse.json(
        { error: '当前密码错误' },
        { status: 400 }
      )
    }

    console.log('[CHANGE PASSWORD API] 当前密码验证通过')

    const { error: dbError } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', userId)

    if (dbError) {
      console.error('[CHANGE PASSWORD API] 数据库更新失败:', dbError)
      return NextResponse.json(
        { error: '密码修改失败: ' + dbError.message },
        { status: 500 }
      )
    }

    // 异步更新 Supabase Auth 密码
    ;(async () => {
      try {
        const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
          userId,
          { password: newPassword }
        )

        if (authUpdateError) {
          console.error('[CHANGE PASSWORD API] Auth 密码更新失败:', authUpdateError)
        }
      } catch (authError) {
        console.error('[CHANGE PASSWORD API] Auth 更新异常:', authError)
      }
    })()

    console.log('[CHANGE PASSWORD API] 密码修改成功:', userId)

    return NextResponse.json(
      { message: '密码修改成功' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[CHANGE PASSWORD API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误: ' + (error.message || '未知错误') },
      { status: 500 }
    )
  }
}
