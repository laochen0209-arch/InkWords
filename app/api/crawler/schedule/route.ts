import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { crawlNews } from '@/lib/crawler/news-crawler'
import { crawlArticles } from '@/lib/crawler/article-crawler'
import { checkRobotsTxt } from '@/lib/crawler/robots-checker'
import { filterInappropriateContent } from '@/lib/crawler/content-filter'

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
    
    const filteredNews = filterInappropriateContent(newsResult.items)
    const filteredArticles = filterInappropriateContent(articleResult.items)
    
    console.log(`[CRAWLER] 过滤后：新闻 ${filteredNews.length}/${newsResult.count}，文章 ${filteredArticles.length}/${articleResult.count}`)
    
    if (filteredNews.length > 0) {
      await prisma.news.createMany({
        data: filteredNews.map(item => ({
          title: item.title,
          content: item.content,
          source: item.source,
          category: item.category,
          imageUrl: item.imageUrl,
          url: item.url,
          publishedAt: new Date()
        }))
      })
    }
    
    if (filteredArticles.length > 0) {
      await prisma.article.createMany({
        data: filteredArticles.map(item => ({
          titleEn: item.titleEn,
          titleZh: item.titleZh,
          contentEn: item.contentEn,
          contentZh: item.contentZh,
          category: item.category
        }))
      })
    }
    
    await prisma.crawlerLog.create({
      data: {
        source: 'scheduled',
        status: 'success',
        articleCount: filteredNews.length + filteredArticles.length,
        startedAt: new Date(),
        completedAt: new Date()
      }
    })
    
    return NextResponse.json({ 
      success: true,
      newsCount: filteredNews.length,
      articleCount: filteredArticles.length,
      filtered: newsResult.count + articleResult.count - (filteredNews.length + filteredArticles.length)
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
