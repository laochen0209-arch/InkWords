"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { getLanguageSettings, NativeLang } from "@/lib/language-utils"

interface AboutPageProps {
  nativeLang?: NativeLang
}

const UI_TEXT = {
  zh: {
    pageTitle: "关于墨语",
    appName: "墨语",
    appSubName: "InkWords",
    version: "版本 v1.0.0",
    appDesc: "极简东方美学，沉浸式语言修行",
    appSubDesc: "让学习成为一种生活方式",
    userAgreement: "用户协议",
    privacyPolicy: "隐私政策",
    copyright: "© 2025 墨语 InkWords. All rights reserved.",
  },
  en: {
    pageTitle: "About InkWords",
    appName: "InkWords",
    appSubName: "InkWords",
    version: "Version v1.0.0",
    appDesc: "Minimalist Oriental aesthetics, immersive language practice",
    appSubDesc: "Make learning a lifestyle",
    userAgreement: "User Agreement",
    privacyPolicy: "Privacy Policy",
    copyright: "© 2025 InkWords. All rights reserved.",
  }
}

export default function AboutPage({ nativeLang: propNativeLang }: AboutPageProps) {
  const router = useRouter()
  const [currentLang, setCurrentLang] = useState<NativeLang>(propNativeLang || "zh")

  /**
   * 初始化语言设置
   */
  useEffect(() => {
    const settings = getLanguageSettings()
    setCurrentLang(settings.nativeLang)
  }, [])

  /**
   * 监听语言设置变化
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "inkwords_native_lang") {
        const newLang = (e.newValue as NativeLang) || "zh"
        setCurrentLang(newLang)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const t = UI_TEXT[currentLang as keyof typeof UI_TEXT]

  const handleBack = () => {
    router.push("/profile")
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />

      <main className="relative z-10 min-h-screen overflow-y-auto">
        <div className="pb-8">
          <div className="w-full max-w-2xl mx-auto">
            {/* 顶部导航栏 */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-4 px-4 py-4 bg-[#FDFBF7]/80 backdrop-blur-sm sticky top-0 z-20"
            >
              <button
                type="button"
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-black/5 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-ink-black" strokeWidth={1.5} />
              </button>
              <h1 className="text-xl font-serif font-semibold text-ink-black">
                {t.pageTitle}
              </h1>
            </motion.div>

            {/* 内容区域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="px-4 py-12"
            >
              <div className="flex flex-col items-center justify-center space-y-8">
                {/* Logo区域 */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative"
                >
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#C23E32] to-[#A8352B] flex items-center justify-center shadow-[0_8px_32px_rgba(194,62,50,0.3)]">
                    <span className="text-6xl font-serif text-white font-bold">
                      墨
                    </span>
                  </div>
                  {/* 装饰圆点 */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#C23E32]"
                  />
                </motion.div>

                {/* 应用名称 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-center"
                >
                  <h2 className="text-3xl font-serif font-bold text-ink-black mb-2">
                    {t.appName}
                  </h2>
                  <p className="text-base text-ink-gray/70 font-serif break-words w-full">
                    {t.appSubName}
                  </p>
                </motion.div>

                {/* 版本号 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="px-6 py-3 bg-white/80 rounded-full border border-stone-200/50"
                >
                  <p className="text-sm font-sans text-ink-gray/70 break-words w-full">
                    {t.version}
                  </p>
                </motion.div>

                {/* 应用描述 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="max-w-md text-center px-4"
                >
                  <p className="text-base font-serif text-ink-gray/80 leading-relaxed break-words w-full">
                    {t.appDesc}
                  </p>
                  <p className="text-sm text-ink-gray/60 font-sans mt-2 break-words w-full">
                    {t.appSubDesc}
                  </p>
                </motion.div>

                {/* 分隔线 */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="w-full max-w-xs h-px bg-stone-200/50"
                />

                {/* 用户协议链接 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="space-y-4 w-full max-w-xs"
                >
                  <button
                    type="button"
                    className="w-full px-6 py-3 bg-white/80 rounded-xl border border-stone-200/50 hover:border-[#C23E32]/30 hover:bg-[#C23E32]/5 transition-all duration-300"
                  >
                    <span className="text-sm font-serif text-ink-black break-words w-full">
                      {t.userAgreement}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="w-full px-6 py-3 bg-white/80 rounded-xl border border-stone-200/50 hover:border-[#C23E32]/30 hover:bg-[#C23E32]/5 transition-all duration-300"
                  >
                    <span className="text-sm font-serif text-ink-black break-words w-full">
                      {t.privacyPolicy}
                    </span>
                  </button>
                </motion.div>

                {/* 版权信息 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="text-center pt-4"
                >
                  <p className="text-xs text-ink-gray/50 font-sans break-words w-full">
                    {t.copyright}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  )
}
