"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

const fontSizeOptions = [
  { id: "small", label: "Small", value: "14px" },
  { id: "medium", label: "Medium", value: "16px" },
  { id: "large", label: "Large", value: "18px" },
  { id: "xlarge", label: "Extra Large", value: "20px" },
]

// localStorage keys
const STORAGE_KEYS = {
  FONT_SIZE: 'inkwords_font_size',
  DARK_MODE: 'inkwords_dark_mode',
}

const UI_TEXT = {
  zh: {
    pageTitle: "外观设置",
    fontSize: "字体大小",
    darkMode: "深色模式",
    darkModeEnabled: "已开启深色模式",
    darkModeDisabled: "已关闭深色模式",
    darkModeDesc: "开启深色模式可减少眼部疲劳，适合夜间使用",
  },
  en: {
    pageTitle: "Appearance",
    fontSize: "Font Size",
    darkMode: "Dark Mode",
    darkModeEnabled: "Dark mode enabled",
    darkModeDisabled: "Dark mode disabled",
    darkModeDesc: "Enable dark mode to reduce eye strain, suitable for night use",
  }
}

export default function AppearancePage() {
  const router = useRouter()
  const [fontSize, setFontSize] = useState("medium")
  const [darkMode, setDarkMode] = useState(false)
  const [currentLang, setCurrentLang] = useState<"zh" | "en">("zh")
  const [isLoaded, setIsLoaded] = useState(false)

  /**
   * 从 localStorage 加载保存的设置
   */
  useEffect(() => {
    // 加载字体大小设置
    const savedFontSize = localStorage.getItem(STORAGE_KEYS.FONT_SIZE)
    if (savedFontSize && fontSizeOptions.some(opt => opt.id === savedFontSize)) {
      setFontSize(savedFontSize)
    }

    // 加载深色模式设置
    const savedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE)
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true')
    }

    // 加载语言设置
    const savedNative = localStorage.getItem("inkwords_native_lang") as "zh" | "en" | null
    if (savedNative) {
      setCurrentLang(savedNative)
    }

    setIsLoaded(true)
  }, [])

  /**
   * 监听语言设置变化
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "inkwords_native_lang") {
        const newLang = (e.newValue as "zh" | "en") || "zh"
        setCurrentLang(newLang)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const t = UI_TEXT[currentLang]

  const handleBack = () => {
    router.push("/profile")
  }

  /**
   * 处理字体大小变化
   */
  const handleFontSizeChange = (sizeId: string) => {
    setFontSize(sizeId)
    // 保存到 localStorage
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, sizeId)
    // 应用到全局（可选）
    document.documentElement.style.fontSize = fontSizeOptions.find(opt => opt.id === sizeId)?.value || '16px'
  }

  /**
   * 处理深色模式切换
   */
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    // 保存到 localStorage
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(newDarkMode))
    // 应用到全局
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 加载完成前显示加载状态，避免闪烁
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-ink-paper flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-vermilion border-t-transparent rounded-full animate-spin" />
      </div>
    )
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
              className="px-4 py-6 space-y-6"
            >
              {/* 字体大小设置 */}
              <section className="bg-white/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(43,43,43,0.08)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-stone-100/80 flex items-center justify-center">
                    <span className="text-lg font-serif text-ink-black">A</span>
                  </div>
                  <h2 className="text-lg font-serif font-semibold text-ink-black">
                    {t.fontSize}
                  </h2>
                </div>

                <div className="space-y-3">
                  {fontSizeOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      type="button"
                      onClick={() => handleFontSizeChange(option.id)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + fontSizeOptions.indexOf(option) * 0.05 }}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 transition-all duration-300",
                        "flex items-center justify-between",
                        fontSize === option.id
                          ? "border-[#C23E32] bg-[#C23E32]/5"
                          : "border-stone-200/50 hover:border-stone-300/80"
                      )}
                    >
                      <span
                        className="text-base font-serif text-ink-black break-words w-full"
                        style={{ fontSize: option.value }}
                      >
                        {option.label}
                      </span>
                      {fontSize === option.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="w-6 h-6 rounded-full bg-[#C23E32] flex items-center justify-center flex-shrink-0 ml-2"
                        >
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* 深色模式设置 */}
              <section className="bg-white/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(43,43,43,0.08)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-stone-100/80 flex items-center justify-center">
                    {darkMode ? (
                      <Moon className="w-5 h-5 text-ink-black" strokeWidth={1.5} />
                    ) : (
                      <Sun className="w-5 h-5 text-ink-black" strokeWidth={1.5} />
                    )}
                  </div>
                  <h2 className="text-lg font-serif font-semibold text-ink-black">
                    {t.darkMode}
                  </h2>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-stone-200/50">
                  <div className="flex items-center gap-3">
                    {darkMode ? (
                      <Moon className="w-6 h-6 text-ink-black" strokeWidth={1.5} />
                    ) : (
                      <Sun className="w-6 h-6 text-ink-black" strokeWidth={1.5} />
                    )}
                    <span className="text-base font-serif text-ink-black break-words w-full">
                      {darkMode ? t.darkModeEnabled : t.darkModeDisabled}
                    </span>
                  </div>
                  <motion.button
                    type="button"
                    onClick={handleDarkModeToggle}
                    className={cn(
                      "w-14 h-8 rounded-full transition-colors duration-300 relative",
                      darkMode ? "bg-[#C23E32]" : "bg-stone-300/60"
                    )}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm"
                      animate={{
                        x: darkMode ? 24 : 4,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                </div>
                <p className="text-sm text-ink-gray/60 font-sans mt-4 px-2 break-words w-full">
                  {t.darkModeDesc}
                </p>
              </section>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  )
}
