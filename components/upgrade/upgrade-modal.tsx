/**
 * UpgradeModal 组件
 *
 * 文件说明：
 * 当用户达到免费使用限额时显示的升级会员弹窗
 *
 * 功能：
 * - 显示升级提示信息
 * - 提供跳转到订阅页面的入口
 * - 支持中英文双语
 */

"use client"

import { useState } from "react"
import { X, Crown, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  type?: "study" | "library" | "practice"
  nativeLang?: "zh" | "en"
}

export function UpgradeModal({
  isOpen,
  onClose,
  type = "study",
  nativeLang = "zh",
}: UpgradeModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const content = {
    zh: {
      title: "升级会员",
      subtitle: {
        study: "今日学习次数已达上限",
        library: "今日阅读次数已达上限",
        practice: "练习券已用完",
      },
      description: "升级会员享受无限学习、无限阅读和无限练习",
      benefits: ["无限学习", "无限阅读", "无限练习", "全功能解锁"],
      upgradeBtn: "立即升级",
      cancelBtn: "稍后再说",
    },
    en: {
      title: "Upgrade to Premium",
      subtitle: {
        study: "Daily study limit reached",
        library: "Daily reading limit reached",
        practice: "Practice tickets exhausted",
      },
      description: "Upgrade for unlimited learning, reading, and practice",
      benefits: ["Unlimited Study", "Unlimited Reading", "Unlimited Practice", "All Features"],
      upgradeBtn: "Upgrade Now",
      cancelBtn: "Maybe Later",
    },
  }[nativeLang]

  const handleUpgrade = () => {
    setIsLoading(true)
    router.push("/subscription")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* 图标 */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C23E32] to-[#A33428] flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* 标题 */}
            <h2 className="text-2xl font-serif font-bold text-center text-ink-black mb-2">
              {content.title}
            </h2>
            <p className="text-center text-ink-gray mb-4">
              {content.subtitle[type]}
            </p>
            <p className="text-center text-sm text-ink-gray/70 mb-6">
              {content.description}
            </p>

            {/* 权益列表 */}
            <div className="bg-stone-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                {content.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-ink-black">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full py-3 bg-[#C23E32] text-white rounded-full font-medium hover:bg-[#A33428] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "..." : content.upgradeBtn}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 bg-transparent text-ink-gray rounded-full font-medium hover:bg-gray-100 transition-colors"
              >
                {content.cancelBtn}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
