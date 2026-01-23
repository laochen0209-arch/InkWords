"use client"

import { motion } from "framer-motion"
import { ExternalLink, BookmarkPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ink-toast/toast-context"
import { NativeLang, TargetLang } from "@/lib/language-utils"

interface NewsCardProps {
  id: string
  title: string
  titleZh?: string
  source: string
  time: string
  excerpt: string
  excerptZh?: string
  category: string
  categoryEn?: string
  nativeLang?: NativeLang
  targetLang?: TargetLang
}

const UI_TEXT = {
  zh: {
    addToShelf: "已加入书架",
  },
  en: {
    addToShelf: "Added to Shelf",
  }
}

export function NewsCard({ id, title, titleZh, source, time, excerpt, excerptZh, category, categoryEn, nativeLang = "zh", targetLang = "en" }: NewsCardProps) {
  const router = useRouter()
  const toast = useToast()

  const t = UI_TEXT[nativeLang]

  /**
   * 根据目标语言决定显示内容
   * targetLang = "zh" 时，显示中文（学习中文）
   * targetLang = "en" 时，显示英文（学习英文）
   */
  const displayTitle = targetLang === "zh" ? (titleZh || title) : title
  const displayExcerpt = targetLang === "zh" ? (excerptZh || excerpt) : excerpt
  const displayCategory = targetLang === "zh" ? (categoryEn || category) : category

  const handleRead = () => {
    router.push(`/library/news/${id}`)
  }

  const handleAddToShelf = () => {
    toast.success(t.addToShelf)
  }

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleRead}
    >
      <div className="flex items-start justify-between gap-4">
        {/* 左侧：内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-ink-vermilion/10 text-ink-vermilion text-xs rounded-full font-medium">
              {displayCategory}
            </span>
            <span className="text-xs text-ink-gray">
              {source}
            </span>
            <span className="text-xs text-ink-gray/60">
              {time}
            </span>
          </div>
          
          <h3 className="font-serif text-base font-medium text-ink-black mb-2 line-clamp-2">
            {displayTitle}
          </h3>
          
          <p className="text-sm text-ink-gray line-clamp-2">
            {displayExcerpt}
          </p>
        </div>
        
        {/* 右侧：按钮 */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="p-2 border border-ink-gray/30 text-ink-gray rounded-xl hover:bg-ink-paper/50 hover:border-ink-vermilion hover:text-ink-vermilion transition-all"
            onClick={(e) => {
              e.stopPropagation()
              handleRead()
            }}
          >
            <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="p-2 border border-ink-gray/30 text-ink-gray rounded-xl hover:bg-ink-paper/50 hover:border-ink-vermilion hover:text-ink-vermilion transition-all"
            onClick={(e) => {
              e.stopPropagation()
              handleAddToShelf()
            }}
          >
            <BookmarkPlus className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
