import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkLibraryQuota } from '@/lib/quotas/check-quotas'

/**
 * 获取文章列表 API
 * 支持按分类筛选和分页，包含配额检查
 */
export async function GET(request: NextRequest) {
  console.log('========== API 开始执行 ==========')

  try {
    // 创建 Supabase 客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const userId = request.headers.get('x-user-id')

    console.log('API 请求参数:', { category, limit, offset, userId })

    // 检查配额（如果提供了用户ID）
    if (userId) {
      console.log('[ARTICLES API] 检查用户配额:', userId)
      const quotaCheck = await checkLibraryQuota(userId)
      console.log('[ARTICLES API] 配额检查结果:', quotaCheck)
      if (!quotaCheck.allowed) {
        console.log('[ARTICLES API] 配额检查失败，返回 403')
        return NextResponse.json(
          {
            articles: [],
            totalCount: 0,
            hasMore: false,
            error: quotaCheck.error,
            code: quotaCheck.code,
            remaining: quotaCheck.remaining
          },
          { status: 403 }
        )
      }
    }

    // 构建查询
    let query = supabase
      .from('articles')
      .select('id, title_en, title_zh, category', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 添加分类筛选
    if (category && category !== 'all') {
      const categoryLower = category.toLowerCase()
      if (categoryLower === 'classics') {
        query = query.in('category', ['classics', 'Classics', 'culture', 'history'])
      } else {
        query = query.eq('category', categoryLower)
      }
    }

    console.log('开始查询文章...')

    const { data: articles, error, count } = await query

    if (error) {
      console.error('查询文章错误:', error)
      throw error
    }

    console.log('文章查询成功，数量:', articles?.length || 0)
    console.log('总数:', count)

    // 转换字段名以兼容前端期望的格式
    const mappedArticles = (articles || []).map(article => ({
      id: article.id,
      titleEn: article.title_en,
      titleZh: article.title_zh,
      category: article.category
    }))

    console.log('========== API 执行成功 ==========')

    return NextResponse.json(
      {
        articles: mappedArticles,
        totalCount: count || 0,
        hasMore: offset + (articles?.length || 0) < (count || 0)
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('========== API 执行失败 ==========')
    console.error('获取文章列表失败:', error)
    console.error('错误消息:', error?.message)

    return NextResponse.json(
      {
        articles: [],
        totalCount: 0,
        hasMore: false,
        error: '获取文章列表失败',
        errorDetails: error?.message || '未知错误'
      },
      { status: 500 }
    )
  }
}
