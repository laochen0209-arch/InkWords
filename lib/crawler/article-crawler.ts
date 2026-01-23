import axios from 'axios'
import * as cheerio from 'cheerio'

interface ArticleItem {
  titleEn: string
  titleZh: string
  contentEn: string
  contentZh: string
  category: string
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
