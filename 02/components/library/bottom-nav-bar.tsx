"use client"

import { BookOpen, User } from "lucide-react"
import { cn } from "@/lib/utils"

type TabType = "practice" | "library" | "profile"

interface BottomNavBarProps {
  activeTab: TabType
}

// 修习图标 - 自定义莲花/禅修图标
function PracticeIcon({ className, strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22c-4-3-8-6-8-11a8 8 0 0 1 16 0c0 5-4 8-8 11z" />
      <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    </svg>
  )
}

const navItems: { id: TabType; label: string; icon: typeof BookOpen | typeof PracticeIcon }[] = [
  { id: "practice", label: "修习", icon: PracticeIcon },
  { id: "library", label: "文库", icon: BookOpen },
  { id: "profile", label: "我的", icon: User },
]

export function BottomNavBar({ activeTab }: BottomNavBarProps) {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-around bg-[#FDFBF7]/80 backdrop-blur-md border-t border-ink-gray/10"
      role="navigation"
      aria-label="底部导航"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id
        const Icon = item.icon
        
        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-20 h-full",
              "transition-colors duration-200",
              isActive ? "text-ink-vermilion" : "text-ink-gray hover:text-ink-black"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
            <span className={cn(
              "text-xs font-serif",
              isActive && "font-medium"
            )}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
