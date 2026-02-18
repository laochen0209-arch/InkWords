/**
 * @fileoverview 生成考试试卷 API
 * @description 调用 N8N Webhook 触发生成试卷工作流，支持动态参数
 * @author InkWords Team
 * @version 1.0.0
 * 
 * 支持参数：
 * - targetLanguage: 'Chinese' | 'English' - 目标语言
 * - examType: 'HSK' | 'BCT' | 'IELTS' | 'TOEFL' | 'CET-4' | 'CET-6' | 'TOCFL' - 考试类型
 * - level: string - 等级 (如 'Level 1', 'Level 4', 'Band 6.5')
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// 禁用缓存
export const dynamic = 'force-dynamic'

/**
 * 验证用户身份并获取用户信息
 */
async function getUserInfo(request: NextRequest) {
  const supabase = await createServerClient()
  
  // 从 header 获取用户ID（用于外部调用）
  const userIdFromHeader = request.headers.get('x-user-id')
  if (userIdFromHeader) {
    const { data: user } = await supabase
      .from('users')
      .select('id, email, is_pro')
      .eq('id', userIdFromHeader)
      .single()
    return user
  }
  
  // 从 session 获取用户
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    const { data: user } = await supabase
      .from('users')
      .select('id, email, is_pro')
      .eq('id', session.user.id)
      .single()
    return user
  }
  
  return null
}

/**
 * POST 处理生成试卷请求
 */
export async function POST(request: NextRequest) {
  console.log('[GENERATE EXAM] 收到生成试卷请求')

  try {
    // 1. 验证用户身份
    const user = await getUserInfo(request)
    if (!user) {
      console.error('[GENERATE EXAM] 用户未认证')
      return NextResponse.json(
        { error: 'Unauthorized', message: '请先登录' },
        { status: 401 }
      )
    }

    console.log('[GENERATE EXAM] 用户:', user.id, user.email)

    // 2. 解析请求体
    const body = await request.json()
    const { 
      targetLanguage,  // 'Chinese' | 'English'
      examType,        // 'HSK' | 'BCT' | 'IELTS' | etc.
      level,           // 'Level 1', 'Level 4', 'Band 6.5', etc.
      category         // 可选：额外分类信息
    } = body

    console.log('[GENERATE EXAM] 请求参数:', {
      targetLanguage,
      examType,
      level,
      category
    })

    // 3. 参数验证
    if (!examType) {
      return NextResponse.json(
        { error: 'Bad Request', message: '缺少 examType 参数' },
        { status: 400 }
      )
    }

    // 4. 确定目标语言（如果未提供则根据 examType 推断）
    const chineseExams = ['HSK', 'BCT', 'TOCFL']
    const determinedTargetLanguage = targetLanguage || 
      (chineseExams.includes(examType) ? 'Chinese' : 'English')

    // 5. 确定等级（如果未提供则使用默认值）
    const determinedLevel = level || getDefaultLevel(examType)

    console.log('[GENERATE EXAM] 处理后的参数:', {
      targetLanguage: determinedTargetLanguage,
      examType,
      level: determinedLevel
    })

    // 6. 检查 N8N Webhook URL 配置
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    if (!n8nWebhookUrl) {
      console.error('[GENERATE EXAM] N8N_WEBHOOK_URL 未配置')
      return NextResponse.json(
        { 
          error: 'Service Unavailable', 
          message: '生成服务未配置，请联系管理员',
          details: 'N8N_WEBHOOK_URL environment variable is not set'
        },
        { status: 503 }
      )
    }

    // 7. 调用 N8N Webhook
    console.log('[GENERATE EXAM] 调用 N8N Webhook:', n8nWebhookUrl)
    
    const n8nPayload = {
      // 核心参数
      targetLanguage: determinedTargetLanguage,
      examType: examType,
      level: determinedLevel,
      category: category || examType,
      
      // 用户上下文
      userId: user.id,
      userEmail: user.email,
      isPro: user.is_pro,
      
      // 时间戳和元数据
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    }

    console.log('[GENERATE EXAM] N8N Payload:', n8nPayload)

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET || ''}`,
        'X-Request-Source': 'inkwords-webapp'
      },
      body: JSON.stringify(n8nPayload)
    })

    // 8. 处理 N8N 响应
    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('[GENERATE EXAM] N8N 调用失败:', {
        status: n8nResponse.status,
        statusText: n8nResponse.statusText,
        error: errorText
      })
      
      return NextResponse.json(
        { 
          error: 'Generation Failed', 
          message: '试卷生成服务暂时不可用',
          details: `N8N Error: ${n8nResponse.status} ${n8nResponse.statusText}`
        },
        { status: 502 }
      )
    }

    const n8nResult = await n8nResponse.json()
    console.log('[GENERATE EXAM] N8N 响应:', n8nResult)

    // 9. 返回成功响应
    return NextResponse.json({
      success: true,
      message: '试卷生成任务已提交',
      data: {
        requestId: n8nPayload.requestId,
        examType: examType,
        targetLanguage: determinedTargetLanguage,
        level: determinedLevel,
        status: 'processing',
        estimatedTime: '30-60 seconds'
      }
    })

  } catch (error: any) {
    console.error('[GENERATE EXAM] 处理请求失败:', error)
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: '处理请求时发生错误',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * GET 获取支持的考试类型列表
 */
export async function GET(request: NextRequest) {
  const examTypes = [
    {
      type: 'HSK',
      name: '汉语水平考试',
      targetLanguage: 'Chinese',
      levels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6']
    },
    {
      type: 'BCT',
      name: '商务汉语考试',
      targetLanguage: 'Chinese',
      levels: ['Level A', 'Level B']
    },
    {
      type: 'TOCFL',
      name: '华语文能力测试',
      targetLanguage: 'Chinese',
      levels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8']
    },
    {
      type: 'IELTS',
      name: '雅思',
      targetLanguage: 'English',
      levels: ['Band 4.0', 'Band 5.0', 'Band 6.0', 'Band 6.5', 'Band 7.0', 'Band 7.5', 'Band 8.0', 'Band 9.0']
    },
    {
      type: 'TOEFL',
      name: '托福',
      targetLanguage: 'English',
      levels: ['0-30', '31-60', '61-90', '91-110', '111-120']
    },
    {
      type: 'CET-4',
      name: '大学英语四级',
      targetLanguage: 'English',
      levels: ['Level 1', 'Level 2', 'Level 3', 'Level 4']
    },
    {
      type: 'CET-6',
      name: '大学英语六级',
      targetLanguage: 'English',
      levels: ['Level 1', 'Level 2', 'Level 3', 'Level 4']
    }
  ]

  return NextResponse.json({
    success: true,
    data: {
      examTypes,
      defaultLevels: {
        'HSK': 'Level 3',
        'BCT': 'Level A',
        'TOCFL': 'Level 3',
        'IELTS': 'Band 6.0',
        'TOEFL': '61-90',
        'CET-4': 'Level 2',
        'CET-6': 'Level 2'
      }
    }
  })
}

/**
 * 根据考试类型获取默认等级
 */
function getDefaultLevel(examType: string): string {
  const defaultLevels: Record<string, string> = {
    'HSK': 'Level 3',
    'BCT': 'Level A',
    'TOCFL': 'Level 3',
    'IELTS': 'Band 6.0',
    'TOEFL': '61-90',
    'CET-4': 'Level 2',
    'CET-6': 'Level 2'
  }
  return defaultLevels[examType] || 'Intermediate'
}

/**
 * 生成唯一请求ID
 */
function generateRequestId(): string {
  return `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
