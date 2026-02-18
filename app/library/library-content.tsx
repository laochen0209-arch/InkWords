"use client"

/**
 * @file library-content.tsx
 * @description Library 页面内容组件 - 包含 useSearchParams 的客户端逻辑
 * @author InkWords Team
 * @date 2026-02-19
 */

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { LibraryHeader } from "@/components/library/library-header"
import { LibraryList } from "@/components/library/library-list"
import { BottomNavBar } from "@/components/library/bottom-nav-bar"
import { FilterSheet } from "@/components/library/filter-sheet"
import { getLanguageSettings, NativeLang, TargetLang } from "@/lib/language-utils"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { UpgradeModal } from "@/components/upgrade/upgrade-modal"
import { logger } from "@/lib/logger"

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
  code?: string
}

export default function LibraryContent() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"home" | "practice" | "library" | "profile" | "study" | "checkin">("library")
  const [nativeLang, setNativeLang] = useState<NativeLang>("zh")
  const [targetLang, setTargetLang] = useState<TargetLang>("en")
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // 【修复】从 URL 读取筛选参数
  const searchParams = useSearchParams()
  const [category, setCategory] = useState<string>(searchParams.get('category') || 'all')
  const [readStatus, setReadStatus] = useState<string>(searchParams.get('readStatus') || 'all')

  // 文章数据状态
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { learningMode } = useLanguage()
  const t = TRANSLATIONS[learningMode]

  // 获取用户ID
  const getUserId = () => {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('inkwords_user')
    return userStr ? JSON.parse(userStr).id : null
  }

  // 【修复】获取文章数据，支持筛选参数
  const fetchArticles = useCallback(async (categoryFilter: string = 'all') => {
    setLoading(true)
    setError(null)

    try {
      const userId = getUserId()
      const params = new URLSearchParams()

      // 添加分类筛选参数
      if (categoryFilter && categoryFilter !== 'all') {
        params.set('category', categoryFilter)
      }

      const url = `/api/articles${params.toString() ? `?${params.toString()}` : ''}`

      const headers: Record<string, string> = {}
      if (userId) {
        headers['x-user-id'] = userId
      }

      const response = await fetch(url, { headers })
      const data: ApiResponse = await response.json()

      logger.log('API 返回数据:', {
        articlesCount: data.articles?.length,
        totalCount: data.totalCount,
        code: data.code,
        error: data.error
      })

      // 检查是否达到限额
      if (response.status === 403 && data.code === 'LIMIT_REACHED') {
        setShowUpgradeModal(true)
        setArticles([])
        return
      }

      if (!response.ok) {
        throw new Error(data.error || '获取文章列表失败')
      }

      if (data.error) {
        throw new Error(data.error)
      }

      setArticles(data.articles || [])
    } catch (err: any) {
      console.error('获取文章失败:', err)
      setError(err.message || '获取文章列表失败')
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始加载和筛选参数变化时重新获取数据
  useEffect(() => {
    fetchArticles(category)
  }, [category, fetchArticles])

  // 监听 URL 参数变化
  useEffect(() => {
    const newCategory = searchParams.get('category') || 'all'
    const newReadStatus = searchParams.get('readStatus') || 'all'
    setCategory(newCategory)
    setReadStatus(newReadStatus)
  }, [searchParams])

  // 初始化语言设置
  useEffect(() => {
    const settings = getLanguageSettings()
    setNativeLang(settings.nativeLang)
    setTargetLang(settings.targetLang)
  }, [])

  // 【修复】处理筛选变化
  const handleFilterChange = useCallback((filters: { readStatus: string, category: string }) => {
    setCategory(filters.category)
    setReadStatus(filters.readStatus)
    // URL 更新由 FilterSheet 组件处理
  }, [])

  return (
    <div className="min-h-screen bg-ink-paper ink-landscape-bg">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <LibraryHeader
          onFilterClick={() => setIsFilterOpen(true)}
          nativeLang={nativeLang}
        />

        {/* 【修复】添加 pt-16 为固定 header 留出空间 */}
        <main className="flex-1 overflow-y-auto pt-16">
          <LibraryList
            articles={articles}
            loading={loading}
            error={error}
            onRetry={() => fetchArticles(category)}
            nativeLang={nativeLang}
            targetLang={targetLang}
            category={category}
            readStatus={readStatus}
          />
        </main>

        <BottomNavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        nativeLang={nativeLang}
        onFilterChange={handleFilterChange}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  )
}
