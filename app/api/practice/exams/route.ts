/**
 * @file route.ts
 * @description 试卷数据 API 路由 - 用于国内网络环境数据中转
 * @author InkWords Team
 * @date 2026-02-20
 * 
 * 功能说明：
 * - 支持按考试类型查询试卷列表
 * - 支持按试卷 ID 查询单个试卷
 * - 通过服务端请求绕过 GFW 阻断
 * - 返回规范 JSON 格式数据
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * GET 请求处理函数
 * 
 * 查询参数：
 * - type: 考试类型（如 IELTS, TOEFL, CET-4 等）
 * - id: 试卷 ID（可选，用于查询单个试卷）
 * 
 * @param request - Next.js 请求对象
 * @returns Next.js 响应对象
 */
export async function GET(request: NextRequest) {
  try {
    // ============================================================================
    // 1. 获取并验证查询参数
    // ============================================================================
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get('id')
    const examType = searchParams.get('type')

    // ============================================================================
    // 2. 按 ID 查询单个试卷
    // ============================================================================
    if (examId) {
      console.log(`[API /practice/exams] 收到请求，examId: ${examId}`)
      
      const supabase = createAdminClient()
      
      const { data, error } = await supabase
        .from('mock_exams')
        .select('*')
        .eq('id', examId)
        .single()

      if (error) {
        console.error('[API /practice/exams] 查询单个试卷失败:', error)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Exam not found',
            message: '试卷不存在或已被删除'
          },
          { status: 404 }
        )
      }

      console.log('[API /practice/exams] 成功返回单个试卷:', data?.id)

      return NextResponse.json({
        success: true,
        data: data
      })
    }

    // ============================================================================
    // 3. 按考试类型查询试卷列表
    // ============================================================================
    if (!examType) {
      console.error('[API /practice/exams] 缺少考试类型参数')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing exam type parameter',
          message: '网络拥堵，请稍后重试'
        },
        { status: 400 }
      )
    }

    console.log(`[API /practice/exams] 收到请求，examType: ${examType}`)

    // ============================================================================
    // 4. 使用服务端 Supabase 客户端查询数据
    // ============================================================================
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('mock_exams')
      .select('*')
      .eq('exam_type', examType)
      .order('created_at', { ascending: false })

    // ============================================================================
    // 5. 处理查询错误
    // ============================================================================
    if (error) {
      console.error('[API /practice/exams] 查询失败:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database query failed',
          message: '数据加载失败，请稍后重试'
        },
        { status: 500 }
      )
    }

    console.log(`[API /practice/exams] 成功返回 ${data?.length || 0} 条试卷数据`)

    // ============================================================================
    // 6. 返回成功响应
    // ============================================================================
    return NextResponse.json({
      success: true,
      data: data,
      count: data?.length || 0
    })

  } catch (error: any) {
    console.error('[API /practice/exams] 服务器错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: '网络拥堵，请稍后重试'
      },
      { status: 500 }
    )
  }
}
