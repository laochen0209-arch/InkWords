"use client"

import { useRouter } from "next/navigation"
import { BookOpen, Globe, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const langs = [
  { id: "en", label: "中文", sub: "MANDARIN", icon: BookOpen },
  { id: "zh", label: "英文", sub: "ENGLISH", icon: Globe }
]

export default function OnboardingPage() {
  const router = useRouter()

  const handleSelect = (langId: string) => {
    localStorage.setItem('pref_lang', langId)
    router.push("/auth")
  }

  return (
    <main className="min-h-screen bg-ink-paper ink-landscape-bg">
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="relative inline-block mb-6">
            <h1 className="font-serif text-6xl md:text-7xl text-ink-black tracking-widest">
              墨语
            </h1>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-ink-vermilion" />
          </div>
          <p className="font-serif text-lg text-ink-gray tracking-[0.3em] mt-6">
            InkWords
          </p>
          <p className="font-serif text-sm text-ink-gray/70 mt-3 tracking-wide">
            每日修行 · 文化传承
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 flex flex-col items-center gap-8 max-w-4xl w-full"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-center text-base text-ink-gray/60 font-serif tracking-wider">
              点击选择学习语言
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center w-full">
            {langs.map((l, index) => {
              const Icon = l.icon
              return (
                <motion.button
                  key={l.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  onClick={() => handleSelect(l.id)}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-left p-10 border-2 transition-all duration-300 font-serif group relative bg-ink-paper border-border hover:border-ink-vermilion hover:shadow-2xl"
                >
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-28 h-28 flex items-center justify-center transition-colors bg-ink-vermilion/10 group-hover:bg-ink-vermilion/20 rounded-full">
                      <Icon className="w-16 h-16 text-ink-vermilion" strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="text-4xl font-bold block mb-2 text-ink-black">{l.label}</span>
                      <span className="text-base opacity-60 uppercase tracking-wider text-ink-gray">{l.sub}</span>
                    </div>
                  </div>
                  <div className="absolute top-6 right-6 w-10 h-10 bg-ink-vermilion/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-5 h-5 text-ink-vermilion" strokeWidth={1.5} />
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
