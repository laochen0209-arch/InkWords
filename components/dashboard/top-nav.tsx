"use client"

import { useAuth } from "@/lib/contexts/auth-context"

interface TopNavProps {
  points?: number
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

export function TopNav({ points = 320 }: TopNavProps) {
  const lunarDate = getLunarDate()
  const { user, isLoading } = useAuth()

  // 真实的 VIP 判断逻辑
  const isVip = user && ['yearly', 'monthly', 'active'].includes(user.subscription_status || '')

  // 获取真实显示名称
  const displayName = user?.name || user?.email?.split('@')[0] || '墨语学习者'

  // 获取真实头像
  const displayAvatar = user?.avatar 
    || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.id || 'guest'}`

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
        
        {/* 右侧：积分 + 用户信息 */}
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
          
          {/* 【修改此处】使用真实数据的用户栏 */}
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              {/* 用户名称和VIP标识 */}
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="font-bold text-sm text-ink-black flex items-center gap-1">
                  {displayName}
                  {isVip && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {user.subscription_status === 'yearly' ? '👑 VIP' : '⭐ PRO'}
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-ink-gray">ID: {user.id.slice(0, 6)}</span>
              </div>
              
              {/* 用户头像 */}
              <div className="relative w-9 h-9">
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover border-2 border-white shadow-md"
                />
                {/* 在线状态绿点 */}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          ) : (
            <span className="text-sm text-ink-gray">未登录</span>
          )}
        </div>
      </div>
    </header>
  )
}
