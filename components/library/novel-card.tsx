"use client"

import { motion } from "framer-motion"
import { BookOpen, BookmarkPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ink-toast/toast-context"
import { NativeLang, TargetLang } from "@/lib/language-utils"

interface NovelCardProps {
  id: string
  title: string
  titleZh?: string
  author: string
  progress: string
  progressZh?: string
  tags: string[]
  tagsZh?: string[]
  nativeLang?: NativeLang
  targetLang?: TargetLang
}

const UI_TEXT = {
  zh: {
    addToShelf: "已加入书架",
    read: "阅读",
  },
  en: {
    addToShelf: "Added to Shelf",
    read: "Read",
  }
}

export function NovelCard({ id, title, titleZh, author, progress, progressZh, tags, tagsZh, nativeLang = "zh", targetLang = "en" }: NovelCardProps) {
  const router = useRouter()
  const toast = useToast()

  const t = UI_TEXT[nativeLang]

  /**
   * 根据目标语言决定显示内容
   * targetLang = "zh" 时，显示中文（学习中文）
   * targetLang = "en" 时，显示英文（学习英文）
   */
  const displayTitle = targetLang === "zh" ? (titleZh || title) : title
  const displayProgress = targetLang === "zh" ? (progressZh || progress) : progress
  const displayTags = targetLang === "zh" ? (tagsZh || tags) : tags

  const handleRead = () => {
    router.push(`/library/novels/${id}`)
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
        {/* 左侧：书名和作者 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-medium text-ink-black mb-1 truncate">
            {displayTitle}
          </h3>
          <p className="text-sm text-ink-gray mb-3">
            {author}
          </p>
          
          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mb-3">
            {displayTags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-ink-paper/50 text-xs text-ink-gray rounded-full truncate max-w-[100px]"
              >
                {tag}
              </span>
            ))}
            {displayTags.length > 3 && (
              <span className="px-2 py-0.5 bg-ink-paper/50 text-xs text-ink-gray rounded-full">
                +{displayTags.length - 3}
              </span>
            )}
          </div>
          
          {/* 进度条 */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-ink-gray/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-ink-vermilion rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "12%" }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
            <span className="text-xs text-ink-gray whitespace-nowrap">
              {displayProgress}
            </span>
          </div>
        </div>
        
        {/* 右侧：按钮 */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-ink-vermilion text-white text-sm font-medium rounded-xl hover:bg-ink-vermilion/90 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              handleRead()
            }}
          >
            {t.read}
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
