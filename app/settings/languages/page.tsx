"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ink-toast/toast-context"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

interface LanguageOption {
  id: string
  name: string
  nativeName: string
}

const nativeLanguages: LanguageOption[] = [
  { id: "zh", name: "中文", nativeName: "中文" },
  { id: "en", name: "English", nativeName: "English" },
]

const targetLanguages: LanguageOption[] = [
  { id: "zh", name: "中文", nativeName: "中文" },
  { id: "en", name: "English", nativeName: "English" },
]

export default function LanguagesPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const { learningMode, nativeLang, targetLang, switchMode } = useLanguage()
  const [currentLang, setCurrentLang] = useState<"zh" | "en">("zh")

  const t = TRANSLATIONS[learningMode]

  useEffect(() => {
    setCurrentLang(nativeLang)
  }, [nativeLang])

  const handleSetNative = (lang: "zh" | "en") => {
    const newMode = lang === "zh" ? "LEARN_ENGLISH" : "LEARN_CHINESE"
    switchMode(newMode)
    success(t.settings.saved)
  }

  const handleSetTarget = (lang: "zh" | "en") => {
    const newMode = lang === "en" ? "LEARN_ENGLISH" : "LEARN_CHINESE"
    switchMode(newMode)
    success(t.settings.saved)
  }

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
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="px-4 py-6"
            >
              <div className="flex items-center gap-4 px-4 py-4 bg-[#FDFBF7]/80 backdrop-blur-sm sticky top-0 z-20">
                <button
                  type="button"
                  onClick={handleBack}
                  className="p-2 rounded-full hover:bg-black/5 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-ink-black" strokeWidth={1.5} />
                </button>
                <h1 className="text-xl font-serif font-semibold text-ink-black">
                  {t.settings.languages}
                </h1>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="px-4 space-y-8"
            >
              <section>
                <h2 className="text-lg font-serif font-semibold text-ink-black mb-4">
                  {t.settings.nativeLanguage}
                </h2>
                <div className="space-y-3">
                  {nativeLanguages.map((lang) => (
                    <motion.button
                      key={lang.id}
                      type="button"
                      onClick={() => handleSetNative(lang.id as "zh" | "en")}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 transition-all duration-300",
                        "flex items-center justify-between",
                        nativeLang === lang.id
                          ? "border-[#C23E32] bg-[#C23E32]/5 shadow-md"
                          : "border-stone-200/50 bg-white hover:border-stone-300/80 hover:shadow-md"
                      )}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-base font-serif text-ink-black break-words w-full">
                          {lang.name}
                        </span>
                        <span className="text-sm text-ink-gray/70 font-sans mt-1 break-words w-full">
                          {lang.nativeName}
                        </span>
                      </div>
                      {nativeLang === lang.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="w-6 h-6 rounded-full bg-[#C23E32] flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" strokeWidth={2} />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-lg font-serif font-semibold text-ink-black mb-4">
                  {t.settings.targetLanguage}
                </h2>
                <div className="space-y-3">
                  {targetLanguages.map((lang) => (
                    <motion.button
                      key={lang.id}
                      type="button"
                      onClick={() => handleSetTarget(lang.id as "zh" | "en")}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 transition-all duration-300",
                        "flex items-center justify-between",
                        targetLang === lang.id
                          ? "border-[#C23E32] bg-[#C23E32]/5 shadow-md"
                          : "border-stone-200/50 bg-white hover:border-stone-300/80 hover:shadow-md"
                      )}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-base font-serif text-ink-black break-words w-full">
                          {lang.name}
                        </span>
                        <span className="text-sm text-ink-gray/70 font-sans mt-1 break-words w-full">
                          {lang.nativeName}
                        </span>
                      </div>
                      {targetLang === lang.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="w-6 h-6 rounded-full bg-[#C23E32] flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" strokeWidth={2} />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </section>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  )
}
