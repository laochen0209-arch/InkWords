"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TopNavProps {
  points?: number
  userName?: string
  userAvatar?: string
}

// 获取农历日期（简化版，实际可使用专门的库）
function getLunarDate(): string {
  const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
  const lunarDays = [
    '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
  ]
  
  // 简化：使用当前日期模拟农历
  const now = new Date()
  const month = now.getMonth()
  const day = now.getDate() - 1
  
  return `${lunarMonths[month]}月${lunarDays[Math.min(day, 29)]}`
}

export function TopNav({ points = 320, userName = "墨客", userAvatar }: TopNavProps) {
  const lunarDate = getLunarDate()
  
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between px-5 py-3">
        {/* 左侧：Logo + 日期 */}
        <div className="flex items-center gap-3">
          {/* 品牌标识 - 墨语 + 朱砂水墨点 */}
          <div className="flex items-center gap-1.5">
            <h1 className="font-serif text-xl font-semibold text-[#1a1a1a] tracking-wide">
              墨语
            </h1>
            {/* 朱砂红抽象水墨点 */}
            <span 
              className="w-2 h-2 bg-ink-vermilion"
              style={{ 
                borderRadius: '60% 40% 50% 45% / 50% 60% 40% 55%',
                transform: 'rotate(-15deg)',
              }}
              aria-hidden="true"
            />
          </div>
          
          {/* 分隔线 */}
          <div className="w-[1px] h-4 bg-ink-gray/30" />
          
          {/* 农历日期 */}
          <span className="text-sm text-ink-gray font-serif">{lunarDate}</span>
        </div>
        
        {/* 右侧：积分 + 头像 */}
        <div className="flex items-center gap-3">
          {/* 积分胶囊 */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-ink-paper border border-border rounded-full">
            <span 
              className="w-1.5 h-1.5 bg-ink-vermilion rounded-full"
              aria-hidden="true"
            />
            <span className="text-sm text-ink-black font-medium">{points}</span>
            <span className="text-xs text-ink-gray">墨点</span>
          </div>
          
          {/* 用户头像 */}
          <Avatar className="w-8 h-8 border border-border">
            <AvatarImage src={userAvatar || "/placeholder.svg"} alt={userName} />
            <AvatarFallback className="bg-ink-paper text-ink-black font-serif text-sm">
              {userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
