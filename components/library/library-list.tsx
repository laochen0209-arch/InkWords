"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Tag } from "lucide-react"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"
import Link from "next/link"

interface Article {
  id: string
  titleEn: string
  titleZh: string
  category: string
  imageUrl?: string
  createdAt: string
}

interface LibraryListProps {
  articles: Article[]
  nativeLang: string
  targetLang: string
}

export function LibraryList({ articles }: LibraryListProps) {
  const [activeTab, setActiveTab] = useState<string>("all")
  const { learningMode } = useLanguage()
  const t = TRANSLATIONS[learningMode]
  
  const tabs = [
    { id: "all", label: "全部" },
    { id: "news", label: t.library.news },
    { id: "classics", label: t.library.classics }
  ]
  
  const filteredArticles = articles.filter(article => {
    const match = activeTab === "all" || 
      article.category.toLowerCase() === activeTab.toLowerCase() ||
      (activeTab === "classics" && ['classics', 'Classics', 'culture', 'history'].includes(article.category))
    return match
  })
  
  console.log('过滤结果:', { 
    activeTab, 
    totalArticles: articles.length, 
    filteredCount: filteredArticles.length,
    filteredCategories: filteredArticles.map(a => a.category)
  })

  const getArticlePath = (article: Article) => {
    const category = article.category.toLowerCase()
    switch (category) {
      case "news":
        return `/library/news/${article.id}`
      case "classic":
      case "classics":
        return `/library/classics/${article.id}`
      default:
        return `/library/${article.id}`
    }
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-6 bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 shadow-inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
              ${activeTab === tab.id
                ? "bg-[#C23E32] text-white shadow-lg scale-105"
                : "text-gray-500 hover:text-gray-800 hover:bg-white/40"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <Link key={article.id} href={getArticlePath(article)}>
              <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                  {/* 封面图区域 */}
                  <div className="h-32 bg-gradient-to-br from-[#C23E32]/10 to-[#A8352B]/20 flex items-center justify-center">
                    {article.imageUrl ? (
                      <img 
                        src={article.imageUrl} 
                        alt={learningMode === "LEARN_ENGLISH" ? article.titleEn : article.titleZh}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span className="text-4xl">📖</span>
                    )}
                  </div>

                  {/* 内容区域 */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-[#C23E32] transition-colors">
                      {article.titleZh || article.titleEn}
                    </h3>
                    <p className="text-sm text-gray-500 italic mb-2 line-clamp-1">
                      {article.titleEn}
                    </p>
                    
                    {/* 底部标签和按钮 */}
                    <div className="mt-auto flex justify-between items-center pt-3">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                        {article.category}
                      </span>
                      <span className="text-[#C23E32] text-sm font-medium">
                        Read Now →
                      </span>
                    </div>
                  </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-400 italic">
            该分类下暂无内容，厨师正在加急准备中...
          </div>
        )}
      </div>
    </div>
  )
}
