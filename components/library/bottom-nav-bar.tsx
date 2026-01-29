"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Dumbbell, User, PenTool } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

type TabType = "home" | "practice" | "library" | "profile" | "study" | "check-in"

interface BottomNavBarProps {
  activeTab?: TabType
  onTabChange?: (tab: TabType) => void
}

export function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const pathname = usePathname()
  const { learningMode } = useLanguage()
  const t = TRANSLATIONS[learningMode]
  
  const internalActiveTab = activeTab || (pathname === "/" ? "home" : pathname.startsWith("/library") ? "library" : pathname.startsWith("/practice") ? "practice" : pathname.startsWith("/study") ? "study" : pathname.startsWith("/check-in") ? "check-in" : "profile")
  
  const items = [
    { label: t.nav.home, icon: Home, href: "/check-in", active: pathname.startsWith("/check-in"), tab: "check-in" as TabType },
    { label: t.nav.library, icon: BookOpen, href: "/library", active: pathname.startsWith("/library"), tab: "library" as TabType },
    { label: t.nav.practice, icon: Dumbbell, href: "/practice", active: pathname.startsWith("/practice"), tab: "practice" as TabType },
    { label: t.nav.study, icon: PenTool, href: "/study", active: pathname.startsWith("/study"), tab: "study" as TabType },
    { label: t.nav.profile, icon: User, href: "/profile", active: pathname === "/profile", tab: "profile" as TabType }
  ]

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-around bg-[#FDFBF7]/80 backdrop-blur-sm border-t border-ink-gray/10"
      role="navigation"
      aria-label="底部导航"
    >
      {items.map((item) => {
        const isActive = internalActiveTab === item.tab
        const Icon = item.icon
        
        return (
          <Link
            key={item.label}
            href={item.href}
            prefetch={true}
            onClick={() => onTabChange?.(item.tab)}
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
