/**
 * @file route.ts
 * @description 用户登录 API
 * @author InkWords Team
 * @date 2026-02-04
 * 
 * 修改说明：
 * 使用 @supabase/ssr 创建 Session Cookie，使 Middleware 能正确识别登录状态
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 用户登录
 * POST /api/auth
 * 
 * 流程：
 * 1. 验证用户存在于数据库
 * 2. 验证密码正确
 * 3. 使用 Supabase Auth 创建 Session Cookie
 */
export async function POST(request: NextRequest) {
  console.log('[AUTH API] 收到登录请求')

  try {
    const body = await request.json()
    const { email, password } = body

    // 验证必填字段
    if (!email || !password) {
      console.log('[AUTH API] 缺少必填字段')
      return NextResponse.json(
        { error: '请填写邮箱和密码' },
        { status: 400 }
      )
    }

    // 创建 Supabase Server Client（带 Cookie 支持）
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // 忽略设置错误
            }
          },
        },
      }
    )

    // 先查询用户是否存在（数据库验证）
    const { data: existingUser, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (queryError) {
      // PGRST116 表示未找到记录
      if (queryError.code === 'PGRST116') {
        console.log('[AUTH API] 用户不存在:', email)
        return NextResponse.json(
          { error: '用户不存在，请先注册' },
          { status: 400 }
        )
      }

      console.error('[AUTH API] 查询用户错误:', queryError)
      return NextResponse.json(
        { error: '数据库查询失败' },
        { status: 500 }
      )
    }

    // 验证密码
    if (existingUser.password !== password) {
      console.log('[AUTH API] 密码错误:', email)
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 400 }
      )
    }

    // 密码正确，创建 Supabase Auth Session
    console.log('[AUTH API] 密码验证成功，创建 Session:', email)
    
    // 使用 signInWithPassword 创建 Session Cookie
    // 注意：这要求用户在 Supabase Auth 中也存在
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('[AUTH API] Auth 登录失败:', authError)
      
      // 如果 Auth 用户不存在，尝试创建
      if (authError.message.includes('Invalid login credentials')) {
        console.log('[AUTH API] Auth 用户不存在，尝试创建用户:', email)
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: existingUser.name,
            },
          },
        })

        if (signUpError) {
          console.error('[AUTH API] 创建 Auth 用户失败:', signUpError)
          return NextResponse.json(
            { error: '登录失败，请稍后重试' },
            { status: 500 }
          )
        }

        console.log('[AUTH API] Auth 用户创建成功:', email)
        
        // 新创建的用户需要验证邮箱，但我们可以立即登录
        // 再次尝试登录
        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (retryError) {
          console.error('[AUTH API] 重试登录失败:', retryError)
          return NextResponse.json(
            { error: '登录失败，请稍后重试' },
            { status: 500 }
          )
        }

        console.log('[AUTH API] 登录成功（新创建 Auth 用户）:', email)
        return NextResponse.json(
          {
            message: '登录成功',
            user: {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
              avatar: existingUser.avatar,
              points: existingUser.points,
              streak: existingUser.streak
            }
          },
          { status: 200 }
        )
      }

      return NextResponse.json(
        { error: '登录失败，请稍后重试' },
        { status: 500 }
      )
    }

    console.log('[AUTH API] 登录成功:', email)
    return NextResponse.json(
      {
        message: '登录成功',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          avatar: existingUser.avatar,
          points: existingUser.points,
          streak: existingUser.streak
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('[AUTH API] 服务器错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
