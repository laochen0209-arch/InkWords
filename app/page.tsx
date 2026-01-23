"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getLanguageSettings, NativeLang } from "@/lib/language-utils"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

export default function LandingPage() {
  const router = useRouter()
  const [nativeLang, setNativeLang] = useState<NativeLang>("zh")
  const { switchMode } = useLanguage()

  useEffect(() => {
    const settings = getLanguageSettings()
    setNativeLang(settings.nativeLang)
  }, [])

  const t = TRANSLATIONS[nativeLang === "zh" ? "LEARN_CHINESE" : "LEARN_ENGLISH"]

  const handleSelectLanguage = (lang: NativeLang) => {
    setNativeLang(lang)
    localStorage.setItem("inkwords_native_lang", lang)
    
    if (lang === "zh") {
      localStorage.setItem("inkwords_target_lang", "en")
      localStorage.setItem("inkwords_learning_mode", "LEARN_ENGLISH")
    } else {
      localStorage.setItem("inkwords_target_lang", "zh")
      localStorage.setItem("inkwords_learning_mode", "LEARN_CHINESE")
    }
    
    switchMode(lang === "zh" ? "LEARN_ENGLISH" : "LEARN_CHINESE")
    
    router.push("/login")
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-paper">
      {/* 背景层 - 水墨山水 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <div 
          className="w-full h-full ink-landscape-bg"
          style={{
            backgroundImage: "url('/bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
          }}
        />
      </motion.div>

      {/* 雾气遮罩层 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        className="absolute inset-0 z-10 bg-white/30 backdrop-blur-sm"
      />

      {/* 主内容区 */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl mx-auto space-y-8">
          
          {/* Logo - 墨字印章 */}
          <motion.div
            initial={{ 
              scale: 0,
              rotate: -180,
              opacity: 0
            }}
            animate={{ 
              scale: 1,
              rotate: 0,
              opacity: 1
            }}
            transition={{ 
              duration: 1.2,
              delay: 0.6,
              ease: [0.34, 1.56, 0.64, 1]
            }}
            className="mb-12 text-center"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#C23E32] flex items-center justify-center shadow-2xl"
                style={{
                  boxShadow: "0 8px 32px rgba(194, 62, 50, 0.4)"
                }}
              >
                <span className="font-serif text-4xl md:text-5xl text-white font-bold">
                  墨
                </span>
              </motion.div>
              {/* 印章边框装饰 */}
              <div className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#C23E32]/20" />
            </div>
          </motion.div>

          {/* 标题 - 墨语 InkWords */}
          <motion.div
            initial={{ 
              y: 30,
              opacity: 0
            }}
            animate={{ 
              y: 0,
              opacity: 1
            }}
            transition={{ 
              duration: 1,
              delay: 0.8,
              ease: "easeOut"
            }}
            className="text-center mb-8"
          >
            <h1 className="font-serif text-4xl md:text-5xl text-ink-black tracking-widest mb-2">
              墨语
            </h1>
            <p className="font-serif text-xl md:text-2xl text-ink-gray tracking-wider">
              InkWords
            </p>
          </motion.div>

          {/* Slogan */}
          <motion.div
            initial={{ 
              y: 20,
              opacity: 0
            }}
            animate={{ 
              y: 0,
              opacity: 1
            }}
            transition={{ 
              duration: 1,
              delay: 1,
              ease: "easeOut"
            }}
            className="text-center mb-12"
          >
            <p className="font-serif text-xl md:text-2xl text-ink-gray/80 tracking-wide leading-relaxed">
              {t.welcome.slogan}
            </p>
          </motion.div>

          {/* 语言选择卡片 */}
          <motion.div
            initial={{ 
              y: 20,
              opacity: 0
            }}
            animate={{ 
              y: 0,
              opacity: 1
            }}
            transition={{ 
              duration: 1,
              delay: 1.2,
              ease: "easeOut"
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {/* 学英语卡片 */}
            <motion.button
              type="button"
              onClick={() => handleSelectLanguage("zh")}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#C23E32]/20 to-[#A8352B] flex items-center justify-center">
                  <span className="font-serif text-3xl md:text-4xl text-white font-bold">
                    英
                  </span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl text-ink-black font-semibold mb-3">
                  学习英语
                </h2>
                <p className="font-serif text-base md:text-lg text-ink-gray/70 leading-relaxed">
                  Learn English
                </p>
                <div className="pt-4">
                  <span className="inline-block px-6 py-3 bg-[#C23E32] text-white font-serif text-base rounded-full shadow-md group-hover:shadow-lg transition-all">
                    {t.welcome.learnEnglish}
                  </span>
                </div>
              </div>
            </motion.button>

            {/* 学中文卡片 */}
            <motion.button
              type="button"
              onClick={() => handleSelectLanguage("en")}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#C23E32]/20 to-[#A8352B] flex items-center justify-center">
                  <span className="font-serif text-3xl md:text-4xl text-white font-bold">
                    中
                  </span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl text-ink-black font-semibold mb-3">
                  学习中文
                </h2>
                <p className="font-serif text-base md:text-lg text-ink-gray/70 leading-relaxed">
                  Learn Chinese
                </p>
                <div className="pt-4">
                  <span className="inline-block px-6 py-3 bg-[#C23E32] text-white font-serif text-base rounded-full shadow-md group-hover:shadow-lg transition-all">
                    {t.welcome.learnChinese}
                  </span>
                </div>
              </div>
            </motion.button>
          </motion.div>

          {/* 底部装饰元素 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 1.5,
              delay: 1.8,
              ease: "easeOut"
            }}
            className="absolute bottom-8 left-0 right-0 text-center"
          >
            <div className="inline-block px-6 py-2 bg-white/40 backdrop-blur-sm rounded-full">
              <p className="font-serif text-sm text-ink-gray/70">
                {t.welcome.footerText}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
