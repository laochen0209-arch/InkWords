import { NextRequest, NextResponse } from 'next/server'

// 直接导入 PrismaClient
import { PrismaClient } from '@/lib/generated/prisma'

// 使用全局实例，避免重复创建
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * 获取文章列表 API
 * 支持按分类筛选和分页
 */
export async function GET(request: NextRequest) {
  console.log('========== API 开始执行 ==========')
  
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    // 大幅降低查询限制，从 500 改为 50，避免查询超时
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('API 请求参数:', { category, limit, offset })

    let where = {}
    if (category && category !== 'all') {
      const categoryLower = category.toLowerCase()
      if (categoryLower === 'classics') {
        where = {
          category: {
            in: ['classics', 'Classics', 'culture', 'history']
          }
        }
      } else {
        where = {
          category: categoryLower
        }
      }
    }

    console.log('查询条件:', where)
    console.log('开始查询文章...')

    // 简化查询，只返回必要的字段，避免查询超时
    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        titleEn: true,
        titleZh: true,
        category: true
      }
    })

    console.log('文章查询成功，数量:', articles.length)
    console.log('开始查询总数...')

    // 查询总数
    const totalCount = await prisma.article.count({ where })

    console.log('总数查询成功:', totalCount)
    console.log('查询结果:', { 
      articlesCount: articles.length, 
      totalCount, 
      hasMore: offset + articles.length < totalCount 
    })

    console.log('========== API 执行成功 ==========')

    return NextResponse.json(
      {
        articles,
        totalCount,
        hasMore: offset + articles.length < totalCount
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('========== API 执行失败 ==========')
    console.error('获取文章列表失败:', error)
    console.error('错误类型:', typeof error)
    console.error('错误名称:', error?.name)
    console.error('错误消息:', error?.message)
    console.error('错误代码:', error?.code)
    console.error('错误堆栈:', error?.stack)
    
    // 尝试序列化错误对象
    try {
      console.error('错误对象 JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    } catch (e) {
      console.error('无法序列化错误对象')
    }
    
    return NextResponse.json(
      { 
        articles: [],
        totalCount: 0,
        hasMore: false,
        error: '获取文章列表失败',
        errorDetails: error?.message || '未知错误',
        errorCode: error?.code || 'UNKNOWN'
      },
      { status: 500 }
    )
  }
  // 注意：不要在 finally 中关闭连接，使用全局实例
}
