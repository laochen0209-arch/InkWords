/**
 * 用户资料更新 API
 *
 * 文件说明：
 * 更新用户头像和昵称，同步到数据库和 Supabase Auth
 *
 * 功能：
 * - 更新 public.users 表的 name 和 avatar 字段
 * - 更新 Supabase Auth user metadata
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
 * 更新用户资料
 * POST /api/user/update
 *
 * 请求体：
 * - userId: 用户ID（必填）
 * - name: 昵称（可选）
 * - avatar: 头像 URL/Base64（可选）
 */
export async function POST(request: NextRequest) {
  console.log('[USER UPDATE API] 收到更新请求')

  try {
    // 【修复】严格检查环境变量
    if (!supabaseUrl) {
      console.error('[USER UPDATE API] NEXT_PUBLIC_SUPABASE_URL 未设置')
      return NextResponse.json(
        { error: '服务器配置错误：缺少 Supabase URL' },
        { status: 500 }
      )
    }

    if (!supabaseServiceKey) {
      console.error('[USER UPDATE API] SUPABASE_SERVICE_ROLE_KEY 未设置')
      return NextResponse.json(
        { error: '服务器配置错误：缺少 Service Role Key' },
        { status: 500 }
      )
    }

    const supabase = createAdminClient()

    const body = await request.json()
    const { userId, name, avatar } = body

    if (!userId) {
      console.log('[USER UPDATE API] 缺少 userId')
      return NextResponse.json(
        { error: '未授权访问，缺少用户标识' },
        { status: 401 }
      )
    }

    const updateData: { name?: string; avatar?: string } = {}
    if (name !== undefined) updateData.name = name
    if (avatar !== undefined) updateData.avatar = avatar

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '没有要更新的数据' },
        { status: 400 }
      )
    }

    console.log('[USER UPDATE API] 更新用户资料:', userId, Object.keys(updateData))

    const { data: updatedUser, error: dbError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (dbError) {
      console.error('[USER UPDATE API] 数据库更新失败:', dbError)
      return NextResponse.json(
        { error: '更新失败: ' + dbError.message },
        { status: 500 }
      )
    }

    // 异步更新 Supabase Auth user metadata
    ;(async () => {
      try {
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            name: name || updatedUser.name,
            avatar_url: avatar || updatedUser.avatar,
          },
        })
      } catch (authError) {
        console.error('[USER UPDATE API] Auth metadata 更新失败:', authError)
      }
    })()

    console.log('[USER UPDATE API] 更新成功:', updatedUser.id)

    return NextResponse.json(
      {
        message: '更新成功',
        user: updatedUser,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[USER UPDATE API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误: ' + (error.message || '未知错误') },
      { status: 500 }
    )
  }
}
