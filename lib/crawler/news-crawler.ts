import axios from 'axios'
import * as cheerio from 'cheerio'

const MAX_NEWS_PER_DAY = 20
const MAX_ARTICLES_PER_DAY = 10

interface NewsItem {
  title: string
  content: string
  source: string
  category: string
  imageUrl?: string
  url: string
}

interface ArticleItem {
  titleEn: string
  titleZh: string
  contentEn: string
  contentZh: string
  category: string
}

export async function crawlNews(): Promise<{ count: number; items: NewsItem[] }> {
  console.log('[CRAWLER] 开始爬取新闻')
  
  const newsSources = [
    {
      name: 'BBC Learning English',
      url: 'https://www.bbc.co.uk/learningenglish/',
      category: 'news',
      selector: '.media-list__item'
    },
    {
      name: 'China Daily',
      url: 'https://www.chinadaily.com/',
      category: 'news',
      selector: '.news-item'
    }
  ]

  const allNews: NewsItem[] = []

  for (const source of newsSources) {
    try {
      console.log(`[CRAWLER] 爬取 ${source.name}`)
      
      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.0.0 Safari/537.36'
        }
      })
      
      const $ = cheerio.load(response.data)
      
      if (source.name === 'BBC Learning English') {
        $(source.selector).each((i, el) => {
          const title = $(el).find('.media-list__item__headline').text().trim()
          const link = $(el).find('a').attr('href')
          const content = $(el).find('.media-list__item__summary').text().trim()
          const imageUrl = $(el).find('img').attr('src')
          
          if (title && link) {
            allNews.push({
              title,
              content,
              source: source.name,
              category: source.category,
              imageUrl,
              url: `https://www.bbc.co.uk${link}`
            })
          }
        })
      } else if (source.name === 'China Daily') {
        $(source.selector).each((i, el) => {
          const title = $(el).find('h3').text().trim()
          const link = $(el).find('a').attr('href')
          const content = $(el).find('p').text().trim()
          
          if (title && link) {
            allNews.push({
              title,
              content,
              source: source.name,
              category: source.category,
              url: link.startsWith('http') ? link : `https://www.chinadaily.com${link}`
            })
          }
        })
      }
      
      console.log(`[CRAWLER] ${source.name} 完成，获取 ${allNews.length} 条新闻`)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error: any) {
      console.error(`[CRAWLER] ${source.name} 失败:`, error.message)
    }
  }

  console.log(`[CRAWLER] 爬取完成，共 ${allNews.length} 条新闻`)
  
  return {
    count: allNews.length,
    items: allNews
  }
}

export async function crawlArticles(): Promise<{ count: number; items: ArticleItem[] }> {
  console.log('[CRAWLER] 开始爬取文章')
  
  const articleSources = [
    {
      name: 'TED Talks',
      url: 'https://www.ted.com/talks',
      category: 'classics',
      selector: '.talk-link'
    },
    {
      name: 'Medium - Education',
      url: 'https://medium.com/tag/education',
      category: 'news',
      selector: 'article'
    }
  ]

  const allArticles: ArticleItem[] = []

  for (const source of articleSources) {
    try {
      console.log(`[CRAWLER] 爬取 ${source.name}`)
      
      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.0.0 Safari/537.36'
        }
      })
      
      const $ = cheerio.load(response.data)
      
      if (source.name === 'TED Talks') {
        $(source.selector).each((i, el) => {
          const titleEn = $(el).find('h3').text().trim()
          const titleZh = titleEn
          const link = $(el).find('a').attr('href')
          const contentEn = $(el).find('.talk-meta__description').text().trim()
          const contentZh = contentEn
          
          if (titleEn && link) {
            allArticles.push({
              titleEn,
              titleZh,
              contentEn,
              contentZh,
              category: source.category
            })
          }
        })
      } else if (source.name === 'Medium - Education') {
        $('article').slice(0, 5).each((i, el) => {
          const titleEn = $(el).find('h2').text().trim()
          const titleZh = titleEn
          const link = $(el).find('a').attr('href')
          const contentEn = $(el).find('p').text().trim()
          const contentZh = contentEn
          
          if (titleEn && link) {
            allArticles.push({
              titleEn,
              titleZh,
              contentEn,
              contentZh,
              category: source.category
            })
          }
        })
      }
      
      console.log(`[CRAWLER] ${source.name} 完成，获取 ${allArticles.length} 条文章`)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error: any) {
      console.error(`[CRAWLER] ${source.name} 失败:`, error.message)
    }
  }

  console.log(`[CRAWLER] 爬取完成，共 ${allArticles.length} 条文章`)
  
  return {
    count: allArticles.length,
    items: allArticles
  }
}
