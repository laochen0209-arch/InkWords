import { NextResponse } from 'next/server'

// 直接导入 PrismaClient
import { PrismaClient } from '@/lib/generated/prisma'

// 创建新的 PrismaClient 实例
const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('开始测试数据库连接...')
    
    // 测试数据库连接
    const result = await prisma.$queryRaw`SELECT 1`
    console.log('数据库连接测试成功:', result)
    
    // 测试查询文章表
    const articles = await prisma.article.findMany({
      take: 5,
      select: {
        id: true,
        titleEn: true,
        titleZh: true,
        category: true
      }
    })
    
    console.log('文章查询成功:', { count: articles.length, articles })
    
    return NextResponse.json(
      {
        message: '数据库连接测试成功！',
        data: {
          connection: 'success',
          articles: articles,
          count: articles.length
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('数据库连接测试失败:', error)
    console.error('错误详情:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    return NextResponse.json(
      {
        message: '数据库连接测试失败！',
        error: error.message,
        errorCode: error.code
      },
      { status: 500 }
    )
  } finally {
    // 关闭 PrismaClient 连接
    await prisma.$disconnect()
    console.log('PrismaClient 连接已关闭')
  }
}
