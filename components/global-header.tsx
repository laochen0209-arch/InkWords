"use client"

import Link from "next/link"
import { UserGlobalNav } from "./global-user-nav"

/**
 * 全局顶部导航栏
 * 显示在网站所有页面的顶部
 */
export function GlobalHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* 左侧：Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif text-xl font-semibold text-[#1a1a1a] tracking-wide">
                墨语
              </h1>
              {/* 朱砂红抽象水墨点 */}
              <span 
                className="w-2 h-2 bg-[#C23E32]"
                style={{ 
                  borderRadius: '60% 40% 50% 45% / 50% 60% 40% 55%',
                  transform: 'rotate(-15deg)',
                }}
                aria-hidden="true"
              />
            </div>
          </Link>

          {/* 中间：导航链接 */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/practice" 
              className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
            >
              练习
            </Link>
            <Link 
              href="/library" 
              className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
            >
              文库
            </Link>
            <Link 
              href="/profile" 
              className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
            >
              我的
            </Link>
          </nav>

          {/* 右侧：用户信息 */}
          <div className="flex items-center">
            <UserGlobalNav />
          </div>
        </div>
      </div>
    </header>
  )
}
