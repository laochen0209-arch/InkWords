"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BookOpen, Clock, User } from "lucide-react"
import { getLanguageSettings, NativeLang, TargetLang } from "@/lib/language-utils"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

interface LibraryListProps {
  nativeLang?: NativeLang
  targetLang?: TargetLang
}

type TabType = "classics" | "news" | "novels"

interface Tab {
  id: TabType
  label: string
}

const TABS: Tab[] = [
  { id: "classics", label: "经典" },
  { id: "news", label: "新闻" },
  { id: "novels", label: "小说" }
]

export function LibraryList({ nativeLang, targetLang }: LibraryListProps) {
  const [activeTab, setActiveTab] = useState<"classics" | "news" | "novels">("classics")
  const [isLoading, setIsLoading] = useState(true)
  const [classicsData, setClassicsData] = useState<any[]>([])
  const [newsData, setNewsData] = useState<any[]>([])
  const [novelsData, setNovelsData] = useState<any[]>([])
  const { learningMode } = useLanguage()
  const t = TRANSLATIONS[learningMode]

  useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        const response = await fetch('/api/study/data', {
          method: 'GET',
          headers: {
            'x-user-id': localStorage.getItem('inkwords_user') || '',
          },
        })

        if (response.ok) {
          const data = await response.json()
          setClassicsData(data.words || [])
          setNewsData(data.sentences || [])
          setNovelsData(data.practiceLogs || [])
        } else {
          console.error('Failed to fetch library data')
        }
      } catch (error) {
        console.error('Error fetching library data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLibraryData()
  }, [])

  const getDisplayTitle = (item: any) => {
    if (learningMode === "LEARN_CHINESE") {
      return item.zh || item.title_zh
    } else {
      return item.en || item.title_en
    }
  }

  const getDisplayDesc = (item: any) => {
    if (learningMode === "LEARN_CHINESE") {
      return item.desc_en || item.desc_zh
    } else {
      return item.desc_zh || item.desc_en
    }
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-6 bg-white/60 backdrop-blur-sm rounded-2xl p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
              ${activeTab === tab.id
                ? "bg-[#C23E32] text-white shadow-sm"
                : "text-ink-gray hover:text-ink-black hover:bg-ink-paper/50"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-ink-gray">
            加载中...
          </div>
        ) : activeTab === "classics" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {classicsData.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur-md border border-white/40 rounded-xl p-5 mb-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-[#C23E32] pl-4"
              >
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2 truncate">
                  {getDisplayTitle(item)}
                </h3>
                <div className="text-sm text-gray-600 mt-1 mb-2">
                  {item.type} · {item.author}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                  {getDisplayDesc(item)}
                </p>
                <div className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {t.library.read}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-ink-gray">
            加载中...
          </div>
        ) : activeTab === "news" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {newsData.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur-md border border-white/40 rounded-xl p-5 mb-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-[#C23E32] pl-4"
              >
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2 truncate">
                  {getDisplayTitle(item)}
                </h3>
                <div className="text-xs text-gray-400 mt-1 mb-2 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {item.date} · {item.source}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                  {getDisplayDesc(item)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-ink-gray">
            加载中...
          </div>
        ) : activeTab === "novels" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {novelsData.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur-md border border-white/40 rounded-xl p-5 mb-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-[#C23E32] pl-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-serif font-bold text-gray-900 truncate pr-2">
                    {getDisplayTitle(item)}
                  </h3>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 whitespace-nowrap">
                    <User className="w-3 h-3" />
                    {item.author}
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-2">
                  {getDisplayDesc(item)}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {t.library.read}
                  </div>
                  <div className="text-sm font-medium text-[#C23E32]">
                    {item.progress}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
