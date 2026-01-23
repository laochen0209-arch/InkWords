"use client"

import { useState, useEffect } from "react"
import { Crown, Check, X, Home } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { getLanguageSettings, type NativeLang } from "@/lib/language-utils"

/**
 * 订阅页面组件
 * 支持中英文双语显示
 */
export default function SubscriptionPage() {
  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)
  const [nativeLang, setNativeLang] = useState<NativeLang>("zh")

  /**
   * UI文本字典
   * 根据母语显示不同的UI文本
   */
  const UI_TEXT = {
    zh: {
      title: "开通墨语会员",
      subtitle: "限时特惠，永久享受",
      badge: "限时特惠",
      priceLabel: "永久会员",
      priceSub: "一次开通，终身受益",
      features: {
        unlimited: "无限修习",
        fullLibrary: "词书全库",
        offline: "离线缓存",
        support: "专属客服",
        priority: "优先支持"
      },
      subscribeBtn: "立即开通",
      successTitle: "恭喜您，开通成功！",
      successMessage: "您已解锁所有会员权益",
      backHome: "返回首页"
    },
    en: {
      title: "Unlock InkWords Premium",
      subtitle: "Limited Time Offer, Lifetime Access",
      badge: "Limited Time",
      priceLabel: "Lifetime Premium",
      priceSub: "One-time payment, lifetime benefits",
      features: {
        unlimited: "Unlimited Learning",
        fullLibrary: "Full Vocabulary Library",
        offline: "Offline Access",
        support: "Dedicated Support",
        priority: "Priority Support"
      },
      subscribeBtn: "Subscribe Now",
      successTitle: "Congratulations!",
      successMessage: "You have unlocked all premium features",
      backHome: "Back to Home"
    }
  }

  const t = UI_TEXT[nativeLang]

  /**
   * 初始化语言设置
   */
  useEffect(() => {
    const settings = getLanguageSettings()
    setNativeLang(settings.nativeLang)
  }, [])

  /**
   * 监听语言设置变化
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "inkwords_native_lang") {
        const newLang = (e.newValue as NativeLang) || "zh"
        setNativeLang(newLang)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleSubscribe = () => {
    setShowSuccess(true)
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    router.push("/")
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      
      <main className="relative z-10 min-h-screen overflow-y-auto scrollbar-hide">
        <div className="w-full min-h-screen bg-[#FDFBF7]/70 pt-14 pb-8 md:bg-transparent md:min-h-0 md:max-w-2xl md:mx-auto md:my-8 md:rounded-xl md:shadow-[0_4px_20px_rgba(43,43,43,0.08)]">
          <div className="px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="font-serif text-3xl md:text-4xl text-ink-black mb-2 leading-tight">
                  {t.title}
                </h1>
                <p className="text-sm md:text-base text-ink-gray/70 font-serif">
                  {t.subtitle}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative bg-[#FDFBF7] border-2 border-stone-200/30 rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(43,43,43,0.08)]"
              >
                <div className="absolute -top-4 -right-4 bg-[#D4AF37] text-white text-xs md:text-sm font-sans px-3 py-1 rounded-full whitespace-nowrap">
                  {t.badge}
                </div>

                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#C23E32]/20 to-[#A33428] flex items-center justify-center shadow-lg shadow-red-900/20">
                    <Crown className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={1.5} />
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h2 className="font-serif text-4xl md:text-5xl text-ink-black font-bold mb-3">
                    ¥9.8
                  </h2>
                  <p className="text-lg md:text-xl text-ink-gray/70 font-serif mb-1">
                    {t.priceLabel}
                  </p>
                  <p className="text-sm md:text-base text-ink-gray/60 font-serif leading-relaxed">
                    {t.priceSub}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-[#D4AF37]" strokeWidth={2} />
                    </div>
                    <span className="text-base md:text-lg text-ink-black font-serif">
                      {t.features.unlimited}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-[#D4AF37]" strokeWidth={2} />
                    </div>
                    <span className="text-base md:text-lg text-ink-black font-serif">
                      {t.features.fullLibrary}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-[#D4AF37]" strokeWidth={2} />
                    </div>
                    <span className="text-base md:text-lg text-ink-black font-serif">
                      {t.features.offline}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-[#D4AF37]" strokeWidth={2} />
                    </div>
                    <span className="text-base md:text-lg text-ink-black font-serif">
                      {t.features.support}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-[#D4AF37]" strokeWidth={2} />
                    </div>
                    <span className="text-base md:text-lg text-ink-black font-serif">
                      {t.features.priority}
                    </span>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubscribe}
                    className="px-10 md:px-12 py-3 md:py-4 bg-[#C23E32] text-white rounded-full font-serif text-base md:text-lg tracking-wider shadow-lg hover:shadow-xl hover:bg-[#A33428] transition-all duration-300 whitespace-nowrap"
                  >
                    {t.subscribeBtn}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl max-w-md mx-4 w-full"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#D4AF37] flex items-center justify-center">
                  <Check className="w-10 h-10 text-white" strokeWidth={2} />
                </div>
                
                <h2 className="font-serif text-xl md:text-2xl text-ink-black font-bold mb-3 leading-tight">
                  {t.successTitle}
                </h2>
                
                <p className="text-base md:text-lg text-ink-gray/70 font-serif mb-6 leading-relaxed">
                  {t.successMessage}
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCloseSuccess}
                  className="px-8 py-3 bg-[#C23E32] text-white rounded-full font-serif text-base md:text-lg tracking-wider shadow-lg hover:bg-[#A33428] transition-all duration-300 whitespace-nowrap"
                >
                  {t.backHome}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
