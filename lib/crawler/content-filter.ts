const BLOCKED_KEYWORDS = ['广告', '推广', '付费', 'VIP', '会员', '购买', '订阅']

export function isAppropriate(content: string): boolean {
  if (!content) return false
  
  const lowerContent = content.toLowerCase()
  return !BLOCKED_KEYWORDS.some(keyword => 
    lowerContent.includes(keyword)
  )
}

export function filterInappropriateContent(items: any[]): any[] {
  return items.filter(item => {
    const content = typeof item === 'string' ? item : JSON.stringify(item)
    return isAppropriate(content)
  })
}
