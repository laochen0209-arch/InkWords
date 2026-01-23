"use client"

import { useState, useEffect } from "react"
import { LibraryHeader } from "@/components/library/library-header"
import { LibraryList } from "@/components/library/library-list"
import { BottomNavBar } from "@/components/library/bottom-nav-bar"
import { FilterSheet } from "@/components/library/filter-sheet"
import { getLanguageSettings, NativeLang, TargetLang } from "@/lib/language-utils"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

export default function LibraryPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"home" | "practice" | "library" | "profile">("library")
  const [nativeLang, setNativeLang] = useState<NativeLang>("zh")
  const [targetLang, setTargetLang] = useState<TargetLang>("en")
  const { learningMode } = useLanguage()
  const t = TRANSLATIONS[learningMode]

  useEffect(() => {
    const settings = getLanguageSettings()
    setNativeLang(settings.nativeLang)
    setTargetLang(settings.targetLang)
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      const settings = getLanguageSettings()
      setNativeLang(settings.nativeLang)
      setTargetLang(settings.targetLang)
    }

    window.addEventListener("storage", handleStorageChange)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])
  
  return (
    <>
      {/* Layer 1: 固定背景层 - 水墨山水 */}
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />

      {/* Layer 2: 可滚动内容区 */}
      <main className="relative z-10 min-h-screen overflow-y-auto">
        {/* 顶部导航栏 */}
        <LibraryHeader onFilterClick={() => setIsFilterOpen(true)} />

        {/* 文章列表 - pt-20 避开顶部栏，pb-24 避开底部导航 */}
        <div className="pt-20 pb-24">
          <LibraryList nativeLang={nativeLang} targetLang={targetLang} />
        </div>
      </main>

      {/* Layer 3: 固定底部导航栏 */}
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 筛选弹窗 */}
      <FilterSheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </>
  )
}
