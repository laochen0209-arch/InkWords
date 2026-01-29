"use client"

import { useState, useEffect } from "react"
import { LibraryHeader } from "@/components/library/library-header"
import { LibraryList } from "@/components/library/library-list"
import { BottomNavBar } from "@/components/library/bottom-nav-bar"
import { FilterSheet } from "@/components/library/filter-sheet"
import { getLanguageSettings, NativeLang, TargetLang } from "@/lib/language-utils"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

// 定义数据库文章的严谨类型
type Article = {
  id: string
  titleEn: string
  titleZh: string
  category: string
  createdAt: string
}

type ApiResponse = {
  articles: Article[]
  totalCount: number
  hasMore: boolean
  error?: string
}

export default function LibraryPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"home" | "practice" | "library" | "profile" | "study" | "check-in">("library")
  const [nativeLang, setNativeLang] = useState<NativeLang>("zh")
  const [targetLang, setTargetLang] = useState<TargetLang>("en")
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { learningMode } = useLanguage()
  const t = TRANSLATIONS[learningMode]

  // 核心逻辑：从数据库拉货
  useEffect(() => {
    const fetchArticlesFromDB = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/articles')
        
        if (!response.ok) {
          throw new Error('获取文章列表失败')
        }

        const data: ApiResponse = await response.json()
        
        console.log('API 返回数据:', { 
          articlesCount: data.articles?.length, 
          totalCount: data.totalCount,
          categories: data.articles?.map(a => a.category)
        })
        
        if (data.error) {
          throw new Error(data.error)
        }

        setArticles(data.articles || [])
      } catch (err) {
        console.error("获取文章失败:", err)
        setError(err instanceof Error ? err.message : "未知错误")
      } finally {
        setLoading(false)
      }
    }
    fetchArticlesFromDB()
    
    // 初始化语言设置
    const settings = getLanguageSettings()
    setNativeLang(settings.nativeLang)
    setTargetLang(settings.targetLang)
  }, [])

  return (
    <>
      {/* Layer 1: 可滚动内容区 */}
      <main className="relative z-10 min-h-screen overflow-y-auto">
        <LibraryHeader onFilterClick={() => setIsFilterOpen(true)} />

        <div className="pt-20 pb-24 px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#C23E32] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-ink-gray">
                  {learningMode === "LEARN_CHINESE" ? "Loading..." : "加载中..."}
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-ink-vermilion mb-2">
                  {learningMode === "LEARN_CHINESE" ? "Failed to load" : "加载失败"}
                </p>
                <p className="text-ink-gray text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <LibraryList 
              articles={articles} 
              nativeLang={nativeLang} 
              targetLang={targetLang} 
            />
          )}
        </div>
      </main>

      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
      <FilterSheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </>
  )
}