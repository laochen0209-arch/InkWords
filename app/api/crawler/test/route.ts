import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { crawlNews } from '@/lib/crawler/news-crawler'
import { crawlArticles } from '@/lib/crawler/article-crawler'
import { filterInappropriateContent } from '@/lib/crawler/content-filter'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    console.log('[CRAWLER TEST] 测试爬取开始')
    
    const newsResult = await crawlNews()
    const articleResult = await crawlArticles()
    
    const filteredNews = filterInappropriateContent(newsResult.items)
    const filteredArticles = filterInappropriateContent(articleResult.items)
    
    console.log(`[CRAWLER TEST] 过滤后：新闻 ${filteredNews.length}/${newsResult.count}，文章 ${filteredArticles.length}/${articleResult.count}`)
    
    let newsSaved = 0
    let articlesSaved = 0
    
    if (filteredNews.length > 0) {
      const newsData = filteredNews.map(item => ({
        title: item.title,
        content: item.content,
        source: item.source,
        category: item.category,
        imageUrl: item.imageUrl,
        url: item.url,
        publishedAt: new Date()
      }))
      
      await prisma.news.createMany({
        data: newsData
      })
      
      newsSaved = newsData.length
    }
    
    if (filteredArticles.length > 0) {
      const articleData = filteredArticles.map(item => ({
        titleEn: item.titleEn,
        titleZh: item.titleZh,
        contentEn: item.contentEn,
        contentZh: item.contentZh,
        category: item.category
      }))
      
      await prisma.article.createMany({
        data: articleData
      })
      
      articlesSaved = articleData.length
    }
    
    await prisma.crawlerLog.create({
      data: {
        source: 'test',
        status: 'success',
        articleCount: newsSaved + articlesSaved,
        startedAt: new Date(),
        completedAt: new Date()
      }
    })
    
    console.log(`[CRAWLER TEST] 保存完成：新闻 ${newsSaved}，文章 ${articlesSaved}`)
    
    return NextResponse.json({ 
      success: true,
      message: '爬取测试成功',
      newsCount: newsSaved,
      articleCount: articlesSaved,
      filtered: newsResult.count + articleResult.count - (newsSaved + articlesSaved),
      details: {
        newsSources: ['BBC Learning English', 'China Daily'],
        articleSources: ['TED Talks', 'Medium - Education'],
        totalCrawled: newsResult.count + articleResult.count,
        totalSaved: newsSaved + articlesSaved,
        totalFiltered: newsResult.count + articleResult.count - (newsSaved + articlesSaved)
      }
    })
  } catch (error: any) {
    console.error('[CRAWLER TEST] 测试爬取失败:', error)
    
    await prisma.crawlerLog.create({
      data: {
        source: 'test',
        status: 'failed',
        error: error.message,
        startedAt: new Date(),
        completedAt: new Date()
      }
    })
    
    return NextResponse.json({ 
      error: error.message,
      message: '爬取测试失败',
      details: {
        error: error.message,
        stack: error.stack
      }
    }, { status: 500 })
  }
}
