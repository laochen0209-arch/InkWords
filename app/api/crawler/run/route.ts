import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { crawlNews } from '@/lib/crawler/news-crawler'
import { crawlArticles } from '@/lib/crawler/article-crawler'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    console.log('[CRAWLER] 手动触发爬取')
    
    const newsResult = await crawlNews()
    const articleResult = await crawlArticles()
    
    await prisma.crawlerLog.create({
      data: {
        source: 'manual',
        status: 'success',
        articleCount: newsResult.count + articleResult.count,
        startedAt: new Date(),
        completedAt: new Date()
      }
    })
    
    return NextResponse.json({ 
      success: true,
      newsCount: newsResult.count,
      articleCount: articleResult.count
    })
  } catch (error: any) {
    console.error('[CRAWLER] 手动触发失败:', error)
    
    await prisma.crawlerLog.create({
      data: {
        source: 'manual',
        status: 'failed',
        error: error.message,
        startedAt: new Date(),
        completedAt: new Date()
      }
    })
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
