"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, BookOpen, FileText, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/contexts/language-context"
import { useToast } from "@/components/ink-toast/toast-context"
import { TRANSLATIONS } from "@/lib/i18n"

export default function DashboardPage() {
  const { learningMode } = useLanguage()
  const toast = useToast()
  const [user, setUser] = useState<any>(null)
  const [greeting, setGreeting] = useState("")
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [streakDays, setStreakDays] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [stats, setStats] = useState({
    timeSpent: 0,
    wordsLearned: 0,
    sentencesMastered: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const t = TRANSLATIONS[learningMode]

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting(t.dashboard.greeting.morning)
    } else if (hour < 18) {
      setGreeting(t.dashboard.greeting.afternoon)
    } else {
      setGreeting(t.dashboard.greeting.evening)
    }
  }, [t])

  useEffect(() => {
    const checkedIn = localStorage.getItem("inkwords_checked_in_today")
    if (checkedIn) {
      setIsCheckedIn(true)
    }
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userStr = localStorage.getItem("inkwords_user")
        const userData = userStr ? JSON.parse(userStr) : null

        if (!userData?.email) {
          console.error('用户邮箱不存在')
          setIsLoading(false)
          return
        }

        const response = await fetch('/api/user/me', {
          headers: {
            'x-user-email': userData.email
          }
        })
        
        const data = await response.json()
        
        if (response.ok && data.user) {
          setUser(data.user)
          setStreakDays(data.user.streak || 0)
          setStats({
            timeSpent: data.user.points || 0,
            wordsLearned: data.user.points || 0,
            sentencesMastered: 0
          })
        }
      } catch (error) {
        console.error('获取用户数据失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (isLoggedIn) {
      fetchUserData()
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleCheckIn = () => {
    if (isCheckedIn) return
    setIsCheckedIn(true)
    setStreakDays(streakDays + 1)
    localStorage.setItem("inkwords_checked_in_today", "true")
    localStorage.setItem("inkwords_streak_days", String(streakDays + 1))
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
    toast.success(t.dashboard.checkIn.success)
  }

  return (
    <main className="min-h-screen">
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-[#C23E32]/10 rounded-full blur-3xl" />
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-[#C23E32] to-[#A8352B] flex items-center justify-center"
              >
                <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={2} />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="font-serif text-4xl md:text-5xl text-ink-black font-semibold mb-3">
              {greeting}
            </h1>
            <p className="font-serif text-lg md:text-xl text-ink-gray/70">
              {learningMode === "LEARN_CHINESE" ? "今天也要继续加油哦！" : "Keep up the great work today!"}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-[#C23E32]" strokeWidth={1.5} />
                <div>
                  <h2 className="font-serif text-xl text-ink-black font-semibold">
                    {t.dashboard.checkIn.title}
                  </h2>
                  <p className="font-serif text-sm text-ink-gray/60">
                    {t.dashboard.checkIn.streak}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold text-[#C23E32]">
                  {streakDays}
                </span>
                <span className="font-serif text-sm text-ink-gray/60">
                  {t.dashboard.checkIn.days}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={isCheckedIn}
              className={cn(
                "w-full mt-4 py-4 rounded-xl font-serif text-lg transition-all duration-300",
                isCheckedIn
                  ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#C23E32] to-[#A8352B] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isCheckedIn ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
                  {t.dashboard.checkIn.checked}
                </div>
              ) : (
                t.dashboard.checkIn.button
              )}
            </button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="font-serif text-lg text-ink-black font-semibold mb-4">
              {t.dashboard.stats.title}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <Clock className="w-8 h-8 text-[#C23E32] mx-auto mb-3" strokeWidth={1.5} />
                <div className="font-serif text-3xl font-bold text-ink-black mb-1">
                  {stats.timeSpent}
                </div>
                <div className="font-serif text-sm text-ink-gray/60">
                  {t.dashboard.stats.timeSpent}
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <BookOpen className="w-8 h-8 text-[#C23E32] mx-auto mb-3" strokeWidth={1.5} />
                <div className="font-serif text-3xl font-bold text-ink-black mb-1">
                  {stats.wordsLearned}
                </div>
                <div className="font-serif text-sm text-ink-gray/60">
                  {t.dashboard.stats.wordsLearned}
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <FileText className="w-8 h-8 text-[#C23E32] mx-auto mb-3" strokeWidth={1.5} />
                <div className="font-serif text-3xl font-bold text-ink-black mb-1">
                  {stats.sentencesMastered}
                </div>
                <div className="font-serif text-sm text-ink-gray/60">
                  {t.dashboard.stats.sentencesMastered}
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="text-center"
          >
            <Link href="/study" className="block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-5 bg-gradient-to-r from-[#C23E32] to-[#A8352B] text-white rounded-full font-serif text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                {t.dashboard.quickActions.continuePractice}
                <ArrowRight className="w-6 h-6" strokeWidth={2} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
