"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ChevronDown, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getLanguageSettings, NativeLang } from "@/lib/language-utils"

interface FAQItem {
  id: string
  question: string
  answer: string
}

interface HelpPageProps {
  nativeLang?: NativeLang
}

const UI_TEXT = {
  zh: {
    pageTitle: "帮助与反馈",
    faqSection: "常见问题",
    contactSupport: "联系客服",
    contactSupportDesc: "客服功能开发中，敬请期待！",
    workTime: "工作时间：周一至周日 9:00-21:00",
    faqItems: [
      {
        id: "1",
        question: "如何修改学习语言？",
        answer: "进入「个人中心」→「学习语言」，可以设置您的母语和学习目标语言。系统会根据您的设置推荐适合的学习内容。",
      },
      {
        id: "2",
        question: "如何调整字体大小？",
        answer: "进入「个人中心」→「外观设置」，在「字体大小」选项中选择适合您的字号。我们提供小、中、大、特大四种选项。",
      },
      {
        id: "3",
        question: "学习进度会丢失吗？",
        answer: "不会。您的学习进度会自动保存到云端，即使更换设备或重新登录，进度也会同步。请确保网络连接正常以便数据同步。",
      },
      {
        id: "4",
        question: "如何联系客服？",
        answer: "点击页面底部的「联系客服」按钮，可以通过在线客服、邮件或电话联系我们。我们的客服团队会在24小时内回复您的问题。",
      },
    ]
  },
  en: {
    pageTitle: "Help & Feedback",
    faqSection: "FAQ",
    contactSupport: "Contact Support",
    contactSupportDesc: "Customer service feature is under development, stay tuned!",
    workTime: "Working hours: Monday to Sunday 9:00-21:00",
    faqItems: [
      {
        id: "1",
        question: "How to change learning language?",
        answer: "Go to 'Profile' → 'Language Settings' to set your native language and target language. The system will recommend suitable learning content based on your settings.",
      },
      {
        id: "2",
        question: "How to adjust font size?",
        answer: "Go to 'Profile' → 'Appearance Settings', and select the font size that suits you in the 'Font Size' option. We provide four options: small, medium, large, and extra large.",
      },
      {
        id: "3",
        question: "Will learning progress be lost?",
        answer: "No. Your learning progress will be automatically saved to the cloud. Even if you switch devices or log in again, your progress will be synchronized. Please ensure network connection is normal for data synchronization.",
      },
      {
        id: "4",
        question: "How to contact customer service?",
        answer: "Click the 'Contact Support' button at the bottom of the page to contact us through online customer service, email, or phone. Our customer service team will reply to your questions within 24 hours.",
      },
    ]
  }
}

export default function HelpPage({ nativeLang: propNativeLang }: HelpPageProps) {
  const router = useRouter()
  const [currentLang, setCurrentLang] = useState<NativeLang>(propNativeLang || "zh")
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

  const t = UI_TEXT[currentLang]
  const faqItems = t.faqItems

  const handleBack = () => {
    router.push("/profile")
  }

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleContactSupport = () => {
    alert(t.contactSupportDesc)
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
              {/* 常见问题区块 */}
              <section>
                <h2 className="text-lg font-serif font-semibold text-ink-black mb-4">
                  {t.faqSection}
                </h2>
                <div className="space-y-3">
                  {faqItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                      className="bg-white/80 rounded-xl border border-stone-200/50 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggle(item.id)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left"
                      >
                        <span className="text-base font-serif text-ink-black break-words w-full pr-4">
                          {item.question}
                        </span>
                        <motion.div
                          animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0"
                        >
                          <ChevronDown className="w-5 h-5 text-ink-gray/60" strokeWidth={1.5} />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {expandedId === item.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-4 pt-0">
                              <div className="pt-3 border-t border-stone-200/50">
                                <p className="text-sm text-ink-gray/70 font-sans leading-relaxed break-words w-full">
                                  {item.answer}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* 联系客服区块 */}
              <section className="pt-4">
                <motion.button
                  type="button"
                  onClick={handleContactSupport}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className={cn(
                    "w-full px-6 py-4 bg-[#C23E32] rounded-xl",
                    "flex items-center justify-center gap-3",
                    "hover:bg-[#A8352B] transition-colors duration-300",
                    "shadow-[0_4px_20px_rgba(194,62,50,0.3)]"
                  )}
                >
                  <MessageCircle className="w-5 h-5 text-white" strokeWidth={1.5} />
                  <span className="text-base font-serif text-white font-medium break-words w-full">
                    {t.contactSupport}
                  </span>
                </motion.button>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="text-center text-sm text-ink-gray/60 font-sans mt-4 break-words w-full"
                >
                  {t.workTime}
                </motion.p>
              </section>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  )
}
