import axios from 'axios'
import * as cheerio from 'cheerio'

interface NewsItem {
  title: string
  content: string
  source: string
  category: string
  imageUrl?: string
  url: string
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
