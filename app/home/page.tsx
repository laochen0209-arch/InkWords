"use client"

/**
 * @file page.tsx
 * @description 首页/仪表盘页面 - 优化版（减少重复请求）
 * @author InkWords Team
 * @date 2026-02-18
 * @version 4.0.0 - 优化数据获取逻辑
 */

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, BookOpen, FileText, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/contexts/language-context"
import { useToast } from "@/components/ink-toast/toast-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { useDataCache } from "@/lib/hooks/use-data-cache"
import { logger } from "@/lib/logger"

export default function DashboardPage() {
  const { learningMode } = useLanguage()
  const toast = useToast()
  const { user: authUser, isLoading: authLoading, refreshSession } = useAuth()
  const [greeting, setGreeting] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)

  const t = TRANSLATIONS[learningMode]

  // 设置问候语
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

  // 使用数据缓存获取签到状态
  const {
    data: checkInData,
    loading: isLoading,
    refresh: refreshCheckIn
  } = useDataCache<{ checked: boolean; streak: number }>({
    key: 'checkin-status',
    fetcher: async () => {
      const response = await fetch('/api/checkin')
      if (response.ok) {
        const data = await response.json()
        return {
          checked: data.checked,
          streak: data.streak || 0
        }
      }
      return { checked: false, streak: 0 }
    },
    expiresIn: 2 * 60 * 1000, // 2 分钟缓存
    enabled: !!authUser && !authLoading, // 只在登录后启用
  })

  const isCheckedIn = checkInData?.checked || false
  const streakDays = checkInData?.streak || 0

  // 执行签到
  const handleCheckIn = useCallback(async () => {
    if (isCheckedIn || isCheckingIn) return

    if (authLoading) {
      return
    }

    if (!authUser) {
      toast.error('请先登录')
      return
    }

    try {
      setIsCheckingIn(true)

      const response = await fetch('/api/checkin', {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '签到失败')
      }

      const data = await response.json()

      // 刷新签到状态
      await refreshCheckIn()
      setShowConfetti(true)

      setTimeout(() => setShowConfetti(false), 3000)
      toast.success(t.dashboard.checkIn.success)

      // 刷新会话以更新用户积分
      await refreshSession()

    } catch (error: any) {
      logger.error('签到失败:', error)
      toast.error(error.message || '签到失败，请重试')
    } finally {
      setIsCheckingIn(false)
    }
  }, [isCheckedIn, isCheckingIn, authLoading, authUser, toast, t, refreshSession, refreshCheckIn])

  const stats = {
    timeSpent: authUser?.points || 0,
    wordsLearned: authUser?.points || 0,
    sentencesMastered: 0
  }

  return (
    <main className="min-h-screen">
      <div
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />

      {/* 签到成功动画 */}
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

          {/* 欢迎语 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="font-serif text-4xl md:text-5xl text-ink-black font-semibold mb-3">
              {greeting}{authUser?.name ? `，${authUser.name}` : ''}
            </h1>
            <p className="font-serif text-lg md:text-xl text-ink-gray/70">
              {learningMode === "LEARN_CHINESE" ? "今天也要继续加油哦！" : "Keep up the great work today!"}
            </p>
          </motion.div>

          {/* 签到卡片 */}
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
                  {isLoading ? '-' : streakDays}
                </span>
                <span className="font-serif text-sm text-ink-gray/60">
                  {t.dashboard.checkIn.days}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={isCheckedIn || isCheckingIn || isLoading || authLoading}
              className={cn(
                "w-full mt-4 py-4 rounded-xl font-serif text-lg transition-all duration-300 flex items-center justify-center gap-2",
                isCheckedIn || authLoading
                  ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#C23E32] to-[#A8352B] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : isCheckingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.common.processing}
                </>
              ) : isCheckedIn ? (
                <>
                  <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
                  {t.dashboard.checkIn.checked}
                </>
              ) : (
                t.dashboard.checkIn.button
              )}
            </button>
          </motion.div>

          {/* 统计卡片 */}
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
                  {isLoading ? '-' : stats.timeSpent}
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
                  {isLoading ? '-' : stats.wordsLearned}
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
                  {isLoading ? '-' : stats.sentencesMastered}
                </div>
                <div className="font-serif text-sm text-ink-gray/60">
                  {t.dashboard.stats.sentencesMastered}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* 开始练习按钮 */}
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
