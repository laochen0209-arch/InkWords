import axios from 'axios'

export async function checkRobotsTxt(url: string): Promise<boolean> {
  try {
    const robotsUrl = new URL(url).origin + '/robots.txt'
    const response = await axios.get(robotsUrl, {
      timeout: 5000
    })
    const isAllowed = response.status === 200
    
    if (isAllowed) {
      console.log(`[ROBOTS] ${url} 允许爬取`)
    } else {
      console.warn(`[ROBOTS] ${url} 没有 robots.txt 或不允许爬取`)
    }
    
    return isAllowed
  } catch (error: any) {
    console.error(`[ROBOTS] 检查 ${url} 失败:`, error.message)
    return false
  }
}
