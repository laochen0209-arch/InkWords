/**
 * @fileoverview 用户学习进度API
 * @description 记录和获取用户学习进度，支持智能学习系统的核心功能
 * @author InkWords Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * 进度项类型
 */
interface ProgressItem {
  contentType: string
  contentId: string
}

/**
 * 记录用户学习进度
 * POST /api/study/progress
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { category, contentType, contentId } = body

    if (!category || !contentType || !contentId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 检查是否已存在进度记录
    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('category', category)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single()

    if (existingProgress) {
      // 更新现有记录
      await supabase
        .from('user_progress')
        .update({
          is_learned: true,
          learned_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id)
    } else {
      // 创建新记录
      await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          category,
          content_type: contentType,
          content_id: contentId,
          is_learned: true,
          learned_at: new Date().toISOString()
        })
    }

    // 更新今日学习统计
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const { data: existingStats } = await supabase
      .from('user_study_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', todayStr)
      .single()

    if (existingStats) {
      // 更新现有统计
      const updateData: any = {
        total_learned: (existingStats.total_learned || 0) + 1
      }
      if (contentType === 'word') {
        updateData.words_learned = (existingStats.words_learned || 0) + 1
      } else {
        updateData.sentences_learned = (existingStats.sentences_learned || 0) + 1
      }
      
      await supabase
        .from('user_study_stats')
        .update(updateData)
        .eq('id', existingStats.id)
    } else {
      // 创建新统计记录
      await supabase
        .from('user_study_stats')
        .insert({
          user_id: userId,
          date: todayStr,
          words_learned: contentType === 'word' ? 1 : 0,
          sentences_learned: contentType === 'sentence' ? 1 : 0,
          total_learned: 1
        })
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('记录学习进度失败:', error)
    return NextResponse.json(
      { error: '记录学习进度失败' },
      { status: 500 }
    )
  }
}

/**
 * 获取用户学习进度
 * GET /api/study/progress?category=daily
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { learnedIds: { words: [], sentences: [] } },
        { status: 200 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase
      .from('user_progress')
      .select('content_type, content_id, learned_at')
      .eq('user_id', userId)
      .eq('is_learned', true)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: progress, error } = await query

    if (error) {
      console.error('获取学习进度失败:', error)
      return NextResponse.json(
        { learnedIds: { words: [], sentences: [] } },
        { status: 200 }
      )
    }

    // 按类型分组
    const learnedIds = {
      words: (progress || []).filter((p: any) => p.content_type === 'word').map((p: any) => p.content_id),
      sentences: (progress || []).filter((p: any) => p.content_type === 'sentence').map((p: any) => p.content_id),
    }

    return NextResponse.json(
      { learnedIds },
      { status: 200 }
    )
  } catch (error) {
    console.error('获取学习进度失败:', error)
    return NextResponse.json(
      { learnedIds: { words: [], sentences: [] } },
      { status: 200 }
    )
  }
}

/**
 * 重置用户学习进度
 * DELETE /api/study/progress?category=daily
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase
      .from('user_progress')
      .delete()
      .eq('user_id', userId)

    if (category) {
      query = query.eq('category', category)
    }

    await query

    return NextResponse.json(
      { success: true, message: '学习进度已重置' },
      { status: 200 }
    )
  } catch (error) {
    console.error('重置学习进度失败:', error)
    return NextResponse.json(
      { error: '重置学习进度失败' },
      { status: 500 }
    )
  }
}
