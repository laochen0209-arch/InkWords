import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { crawlNews } from '@/lib/crawler/news-crawler'
import { crawlArticles } from '@/lib/crawler/article-crawler'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('[CRAWLER] 定时任务触发')
    
    const newsResult = await crawlNews()
    const articleResult = await crawlArticles()
    
    await prisma.crawlerLog.create({
      data: {
        source: 'scheduled',
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
    console.error('[CRAWLER] 定时任务失败:', error)
    
    await prisma.crawlerLog.create({
      data: {
        source: 'scheduled',
        status: 'failed',
        error: error.message,
        startedAt: new Date(),
        completedAt: new Date()
      }
    })
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
