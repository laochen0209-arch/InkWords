/**
 * 用户信息 API 路由
 * 
 * 文件说明：
 * 获取当前登录用户的详细信息，包括基本资料和学习统计
 * 
 * 功能：
 * - 获取用户基本信息
 * - 获取今日学习统计数据
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

/**
 * 获取用户信息
 * 
 * 返回数据：
 * - user: 用户基本信息
 * - todayStats: 今日学习统计（学习时长、学习数量等）
 */
export async function GET(request: NextRequest) {
  console.log('[USER ME API] 收到请求')

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 从查询参数获取 userId
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const email = request.headers.get('x-user-email')

    if (!userId && !email) {
      console.log('[USER ME API] 缺少用户标识')
      return NextResponse.json(
        { error: '未授权访问，缺少用户标识' },
        { status: 401 }
      )
    }

    console.log('[USER ME API] 查询用户:', { userId, email })

    // 查询用户信息
    let query = supabase
      .from('users')
      .select('id, email, name, avatar, points, streak, last_login_date')

    if (userId) {
      query = query.eq('id', userId)
    } else if (email) {
      query = query.eq('email', email)
    }

    const { data: user, error: userError } = await query.single()

    if (userError || !user) {
      console.log('[USER ME API] 用户不存在:', userError)
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取今日学习统计
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const { data: todayStats, error: statsError } = await supabase
      .from('user_study_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayStr)
      .single()

    // 如果今日统计不存在，返回默认值
    const stats = todayStats || {
      words_learned: 0,
      sentences_learned: 0,
      total_learned: 0,
      study_time: 0
    }

    console.log('[USER ME API] 查询成功，用户ID:', user.id)

    return NextResponse.json(
      { 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          points: user.points,
          streak: user.streak
        },
        todayStats: {
          wordsLearned: stats.words_learned || 0,
          sentencesLearned: stats.sentences_learned || 0,
          totalLearned: stats.total_learned || 0,
          studyTime: stats.study_time || 0
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[USER ME API] 服务器错误:', error)
    
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
