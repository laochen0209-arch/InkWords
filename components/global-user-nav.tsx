"use client"

import { useAuth } from "@/lib/contexts/auth-context"
import Link from "next/link"

/**
 * 全局用户导航组件
 * 显示在页面右上角，展示用户头像、名称和会员状态
 */
export function UserGlobalNav() {
  const { user, isLoading } = useAuth()

  // 扩大 VIP 判定范围，防止漏判
  const isVip = user && ['yearly', 'monthly', 'active', 'pro'].includes(
    (user.subscription_status || '').toLowerCase()
  )

  // 核心显示逻辑 - 严格按照优先级读取数据
  const userAvatar = user?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.id || 'guest'}`
  const userName = user?.name || user?.email?.split('@')[0] || '墨语学习者'

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <Link 
        href="/login"
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        登录
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {/* 用户名称和VIP标识 */}
      <div className="flex flex-col items-end hidden sm:flex">
        <span className="font-bold text-sm text-gray-800 flex items-center gap-1">
          {userName}
          {isVip && (
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">
              {user.subscription_status?.toLowerCase() === 'yearly' ? '👑 VIP' : '⭐ PRO'}
            </span>
          )}
        </span>
        <span className="text-[10px] text-gray-400">ID: {user.id.slice(0, 6)}</span>
      </div>

      {/* 头像必须加 key 以强制刷新 */}
      <div className="relative w-10 h-10">
        <img
          key={userAvatar}
          src={userAvatar}
          alt={userName}
          className="w-full h-full rounded-full border-2 border-white shadow-md object-cover bg-gray-100"
          referrerPolicy="no-referrer"
        />
        {/* 在线状态绿点 */}
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
      </div>
    </div>
  )
}
