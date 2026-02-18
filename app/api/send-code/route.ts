/**
 * 发送邮箱验证码 API
 *
 * 文件说明：
 * 用于发送邮箱验证码，支持注册和重置密码场景
 *
 * 功能：
 * - 生成6位随机验证码
 * - 存储到数据库并设置过期时间（5分钟）
 * - 通过邮件发送验证码
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendVerificationCode as sendEmail } from '@/lib/email'

// 环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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

/**
 * 确保 verification_codes 表存在
 */
async function ensureVerificationCodesTable(supabase: ReturnType<typeof createAdminClient>) {
  try {
    // 尝试查询表，检查是否存在
    const { error } = await supabase
      .from('verification_codes')
      .select('id', { count: 'exact', head: true })
      .limit(1)

    if (error) {
      console.error('[SEND CODE API] 验证表存在性失败:', error)
      // 如果表不存在，返回 false
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        return false
      }
    }
    return true
  } catch (err) {
    console.error('[SEND CODE API] 检查表存在性出错:', err)
    return false
  }
}

export async function POST(request: NextRequest) {
  console.log('[SEND CODE API] 收到发送验证码请求')

  try {
    // 【修复】检查环境变量
    if (!supabaseUrl) {
      console.error('[SEND CODE API] NEXT_PUBLIC_SUPABASE_URL 未设置')
      return NextResponse.json(
        { error: '服务器配置错误：缺少 Supabase URL' },
        { status: 500 }
      )
    }

    if (!supabaseServiceKey) {
      console.error('[SEND CODE API] SUPABASE_SERVICE_ROLE_KEY 未设置')
      return NextResponse.json(
        { error: '服务器配置错误：缺少 Service Role Key' },
        { status: 500 }
      )
    }

    // 【修复】使用 Admin 客户端绕过 RLS
    const supabase = createAdminClient()
    
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

    // 检查 verification_codes 表是否存在
    const tableExists = await ensureVerificationCodesTable(supabase)
    if (!tableExists) {
      console.error('[SEND CODE API] verification_codes 表不存在')
      return NextResponse.json(
        { error: '数据库表未初始化，请联系管理员' },
        { status: 500 }
      )
    }

    // 如果是注册，检查邮箱是否已存在
    if (type === 'register') {
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (userError && userError.code !== 'PGRST116') {
        console.error('[SEND CODE API] 查询用户失败:', userError)
        return NextResponse.json(
          { error: '数据库查询失败' },
          { status: 500 }
        )
      }

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
    const { error: deleteError } = await supabase
      .from('verification_codes')
      .delete()
      .eq('email', email)
      .eq('type', type)

    if (deleteError) {
      console.error('[SEND CODE API] 删除旧验证码失败:', deleteError)
      // 非致命错误，继续执行
    }

    // 存储新验证码
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        email,
        code,
        type,
        expires_at: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('[SEND CODE API] 存储验证码失败:', insertError)
      console.error('[SEND CODE API] 错误详情:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })
      return NextResponse.json(
        { error: '验证码存储失败: ' + insertError.message },
        { status: 500 }
      )
    }

    console.log('='.repeat(50))
    console.log('📧 发送邮箱验证码')
    console.log('='.repeat(50))
    console.log('📧 邮箱:', email)
    console.log('🔑 验证码:', code)
    console.log('⏰ 过期时间:', expiresAt.toLocaleString())
    console.log('='.repeat(50))

    // 发送邮件
    const emailResult = await sendEmail(email, code, type)

    if (!emailResult.success) {
      console.error('[SEND CODE API] 邮件发送失败:', emailResult.message)
      return NextResponse.json(
        { error: emailResult.message },
        { status: 500 }
      )
    }

    console.log('✅ 验证码邮件已发送')
    console.log('='.repeat(50))

    return NextResponse.json(
      {
        message: '验证码已发送到您的邮箱',
        expiresIn: 300 // 5分钟（秒）
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('[SEND CODE API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误: ' + (error.message || '未知错误') },
      { status: 500 }
    )
  }
}
