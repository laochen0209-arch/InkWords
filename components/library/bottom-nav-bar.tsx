"use client"

import Link from "next/link"
import { BookOpen, User, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

type TabType = "home" | "practice" | "library" | "profile"

interface BottomNavBarProps {
  activeTab: TabType
  onTabChange?: (tab: TabType) => void
}

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
      <path d="M12 11a3 3 0 1 0 0 6 3 3 0 0 6z" />
    </svg>
  )
}

const navItems = (t: any): Array<{ id: TabType; label: string; icon: any; href: string }> => [
  { id: "home", label: t.nav.home, icon: Home, href: "/home" },
  { id: "practice", label: t.nav.practice, icon: PracticeIcon, href: "/study" },
  { id: "library", label: t.nav.library, icon: BookOpen, href: "/library" },
  { id: "profile", label: t.nav.profile, icon: User, href: "/profile" },
]

export function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const { learningMode } = useLanguage()
  
  const t = TRANSLATIONS[learningMode]
  const items = navItems(t)
  
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-around bg-[#FDFBF7]/80 backdrop-blur-sm border-t border-ink-gray/10"
      role="navigation"
      aria-label="底部导航"
    >
      {items.map((item) => {
        const isActive = activeTab === item.id
        const Icon = item.icon
        
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => onTabChange?.(item.id)}
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
          </Link>
        )
      })}
    </nav>
  )
}
