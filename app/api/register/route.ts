/**
 * 用户注册 API
 *
 * 文件说明：
 * 处理用户注册请求，验证邮箱验证码
 * 使用 Supabase Auth 创建用户，然后将用户信息存入 public.users 表
 *
 * 功能：
 * - 验证邮箱格式
 * - 验证验证码是否正确且未过期
 * - 检查邮箱是否已注册
 * - 使用 Supabase Auth 创建用户
 * - 将用户信息存入 public.users 表（包含 id 字段）
 * - 删除已使用的验证码
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
 * 创建 Supabase Auth 客户端
 * 用于用户认证操作
 */
const createAuthClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 环境变量未设置')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

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
    // 【修复】检查环境变量
    if (!supabaseUrl) {
      console.error('[REGISTER API] NEXT_PUBLIC_SUPABASE_URL 未设置')
      return NextResponse.json(
        { error: '服务器配置错误：缺少 Supabase URL' },
        { status: 500 }
      )
    }

    if (!supabaseServiceKey) {
      console.error('[REGISTER API] SUPABASE_SERVICE_ROLE_KEY 未设置')
      return NextResponse.json(
        { error: '服务器配置错误：缺少 Service Role Key' },
        { status: 500 }
      )
    }

    if (!supabaseAnonKey) {
      console.error('[REGISTER API] NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置')
      return NextResponse.json(
        { error: '服务器配置错误：缺少 Anon Key' },
        { status: 500 }
      )
    }

    // 【修复】使用 Admin 客户端绕过 RLS
    const adminSupabase = createAdminClient()
    const authSupabase = createAuthClient()
    
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

    // 检查邮箱是否已注册（public.users 表）
    const { data: existingUser, error: queryError } = await adminSupabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (queryError && queryError.code !== 'PGRST116') {
      console.error('[REGISTER API] 查询用户失败:', queryError)
    }

    if (existingUser) {
      console.log('[REGISTER API] 邮箱已注册')
      return NextResponse.json(
        { error: '该邮箱已注册' },
        { status: 400 }
      )
    }

    // 验证验证码
    const { data: verificationCode, error: codeError } = await adminSupabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('type', 'register')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (codeError || !verificationCode) {
      console.log('[REGISTER API] 验证码已过期或不存在:', codeError)
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

    // 1. 使用 Supabase Auth 创建用户
    console.log('[REGISTER API] 创建 Auth 用户:', email)
    const { data: authData, error: authError } = await authSupabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    })

    if (authError) {
      console.error('[REGISTER API] 创建 Auth 用户失败:', authError)
      return NextResponse.json(
        { error: `注册失败: ${authError.message}` },
        { status: 500 }
      )
    }

    if (!authData.user) {
      console.error('[REGISTER API] 创建 Auth 用户返回空')
      return NextResponse.json(
        { error: '注册失败: 无法创建用户' },
        { status: 500 }
      )
    }

    const userId = authData.user.id
    console.log('[REGISTER API] Auth 用户创建成功, userId:', userId)

    // 2. 将用户信息存入 public.users 表（必须包含 id 字段）
    console.log('[REGISTER API] 创建 public.users 记录')
    const { data: newUser, error: profileError } = await adminSupabase
      .from('users')
      .insert({
        id: userId, // <-- 关键：必须使用 Auth 用户的 UUID
        email,
        password, // 注意：生产环境应该加密密码
        name: name || email.split('@')[0],
        points: 0,
        streak: 0,
        practice_tickets: 5, // 新用户赠送5张练习券
        study_daily_count: 0,
        library_daily_count: 0,
      })
      .select()
      .single()

    if (profileError) {
      console.error('[REGISTER API] 创建 public.users 记录失败:', profileError)
      console.error('[REGISTER API] 错误详情:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
      })

      // 如果 public.users 插入失败，尝试删除已创建的 Auth 用户
      // 注意：这里可能需要使用 admin API 来删除用户

      return NextResponse.json(
        { error: `注册失败: ${profileError.message}` },
        { status: 500 }
      )
    }

    // 删除已使用的验证码
    const { error: deleteError } = await adminSupabase
      .from('verification_codes')
      .delete()
      .eq('email', email)
      .eq('type', 'register')

    if (deleteError) {
      console.error('[REGISTER API] 删除验证码失败:', deleteError)
      // 非致命错误，继续执行
    }

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
          streak: newUser.streak,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[REGISTER API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误: ' + (error.message || '未知错误') },
      { status: 500 }
    )
  }
}
