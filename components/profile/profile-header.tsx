"use client"

import { useLanguage } from "@/lib/contexts/language-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { NativeLang } from "@/lib/language-utils"

interface StatItem {
  label: string
  value: number | string
  unit?: string
}

interface ProfileHeaderProps {
  nativeLang?: NativeLang
}

export function ProfileHeader({ nativeLang = "zh" }: ProfileHeaderProps) {
  const { user } = useAuth()
  const { learningMode } = useLanguage()

  const t = TRANSLATIONS[learningMode]
  const stats: StatItem[] = [
    { label: t.profile?.stats?.wordsLearned || "Words Learned", value: 128 },
    { label: t.profile?.stats?.studyDays || "Study Days", value: 15 },
    { label: t.profile?.stats?.accuracy || "Accuracy", value: "92%", unit: "" }
  ]

  return (
    <header className="pt-12 pb-6 px-4">
      <div className="flex flex-col items-center">
        {/* 头像 */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-[#FDFBF7] border-2 border-ink-vermilion/60 shadow-lg overflow-hidden">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={t.profile?.avatarAlt || "User Avatar"} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F5F2EC] to-[#E8E4DC]">
                <span className="text-3xl font-serif text-ink-black">墨</span>
              </div>
            )}
          </div>
          {/* 头像边缘装饰 - 微妙的金色光晕 */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: '0 0 0 1px rgba(212, 175, 55, 0.3), 0 0 12px rgba(212, 175, 55, 0.15)'
            }}
            aria-hidden="true"
          />
        </div>
        
        {/* 用户名/ID */}
        <h1 className="mt-4 text-xl font-serif font-medium text-ink-black">
          {user?.name || t.profile?.defaultNickname || "InkWords User"}
        </h1>
        <p className="mt-1 text-sm text-ink-gray font-sans">
          {t.profile?.idLabel || "ID"}: {user?.id || "INK20240001"}
        </p>
        
        {/* 数据概览 */}
        <div className="mt-6 w-full max-w-xs">
          <div className="flex items-center justify-between">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="flex flex-col items-center"
              >
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-serif font-semibold text-ink-black">
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span className="text-sm text-ink-gray font-serif">
                      {stat.unit}
                    </span>
                  )}
                </div>
                <span className="mt-1 text-xs text-ink-gray font-serif">
                  {stat.label}
                </span>
                
                {/* 分隔符 - 最后一项不显示 */}
                {index < stats.length - 1 && (
                  <div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-ink-gray/20"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
