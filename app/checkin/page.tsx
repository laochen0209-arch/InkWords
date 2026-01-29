"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, Droplets, Clock, Calendar, ChevronLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

/**
 * 极简修行看板组件
 * 
 * 文件说明：
 * 用户签到页面，与 /check-in 页面共享后端签到数据
 * 
 * 功能：
 * - 显示连续签到天数（连绵）- 从后端获取真实数据
 * - 提供大的签到触发按钮（落墨）- 调用后端API
 * - 显示今日学习时长和总墨滴积分（精进）- 从后端获取真实数据
 * 
 * 设计风格：
 * - 新中式极简主义
 * - 全直角设计 (rounded-none)
 * - 使用 ink-landscape-bg 样式
 * - 背景保持极简留白
 */
export default function MinimalCheckIn() {
  const router = useRouter()
  const { learningMode } = useLanguage()
  const t = TRANSLATIONS[learningMode]
  
  // 用户数据状态
  const [done, setDone] = useState(false)
  const [streak, setStreak] = useState(0)
  const [studyTime, setStudyTime] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 从 localStorage 获取用户邮箱
   */
  const getUserEmail = () => {
    const userStr = localStorage.getItem('inkwords_user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        return user.email || null
      } catch {
        return null
      }
    }
    return localStorage.getItem('userEmail')
  }

  /**
   * 获取用户数据和签到状态
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const userEmail = getUserEmail()
        if (!userEmail) {
          // 未登录状态，使用默认值
          setDone(false)
          setStreak(0)
          setStudyTime(0)
          setTotalPoints(0)
          setIsLoading(false)
          return
        }

        // 获取用户基本信息和学习统计
        const userResponse = await fetch('/api/user/me', {
          headers: { 'x-user-email': userEmail }
        })

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            setDone(false)
            setStreak(0)
            setStudyTime(0)
            setTotalPoints(0)
            setIsLoading(false)
            return
          }
          throw new Error('获取用户信息失败')
        }

        const userData = await userResponse.json()
        setStreak(userData.user.streak || 0)
        setTotalPoints(userData.user.points || 0)
        setStudyTime(userData.todayStats?.studyTime || 0)

        // 获取签到状态
        const checkInResponse = await fetch('/api/checkin', {
          headers: { 'x-user-email': userEmail }
        })

        if (!checkInResponse.ok) {
          throw new Error('获取签到状态失败')
        }

        const checkInData = await checkInResponse.json()
        setDone(checkInData.checked)

      } catch (err: any) {
        console.error('获取数据失败:', err)
        setError(err.message || '加载失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  /**
   * 处理签到操作
   */
  const handleCheckIn = async () => {
    if (done || isCheckingIn) return

    const userEmail = getUserEmail()
    if (!userEmail) {
      setError('请先登录')
      return
    }

    try {
      setIsCheckingIn(true)
      setError(null)

      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'x-user-email': userEmail }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '签到失败')
      }

      const data = await response.json()
      
      // 更新本地状态
      setDone(true)
      setStreak(data.streak)
      setTotalPoints(data.totalPoints)

      // 延迟跳转到 check-in 页面
      setTimeout(() => {
        router.push('/check-in')
      }, 1500)

    } catch (err: any) {
      console.error('签到失败:', err)
      setError(err.message || '签到失败')
    } finally {
      setIsCheckingIn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-[#7A9078]" />
          <span className="text-sm text-[#787878] font-serif">{t.common.loading}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* 背景图片 */}
      <div 
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: "url('/去文字.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* 返回按钮 */}
        <button
          onClick={() => router.push('/practice')}
          className="absolute top-6 left-6 flex items-center gap-2 text-[#2B2B2B] hover:text-[#C23E32] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-serif text-sm">{t.common.back}</span>
        </button>

        {/* 错误提示 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 bg-[#C23E32] text-white px-6 py-3 text-sm font-serif z-50"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <main className="w-full max-w-5xl">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-[#2B2B2B] mb-2">{t.dashboard.checkIn.title}</h1>
            <p className="text-sm text-[#787878] font-serif">持之以恒，积少成多</p>
          </div>

          {/* 三列布局 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 1. 连绵 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 flex flex-col items-center justify-center shadow-lg"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#787878] mb-4">连绵 Streak</div>
              <div className="flex items-end gap-2 text-[#C23E32] mb-4">
                <span className="text-6xl font-serif font-bold">{streak}</span>
                <span className="text-sm font-serif mb-3 italic">Days</span>
              </div>
              <Flame size={32} className="text-[#C23E32]" />
            </motion.div>

            {/* 2. 落墨 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 flex flex-col items-center justify-center shadow-lg"
            >
              {!done ? (
                <button
                  onClick={handleCheckIn}
                  disabled={isCheckingIn}
                  className="w-full aspect-square border-2 border-[#E8E4DC] flex flex-col items-center justify-center hover:bg-[#2B2B2B] hover:text-white hover:border-[#2B2B2B] transition-all group rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingIn ? (
                    <Loader2 size={56} className="animate-spin mb-4" />
                  ) : (
                    <Calendar size={56} className="mb-4 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-4xl font-serif font-bold tracking-[0.5em]">
                    {isCheckingIn ? '...' : '落墨'}
                  </span>
                  <span className="text-[10px] uppercase mt-4 tracking-widest opacity-40">
                    {isCheckingIn ? 'Processing...' : 'Brush Your Mark'}
                  </span>
                </button>
              ) : (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full aspect-square bg-[#2B2B2B] text-white flex flex-col items-center justify-center rounded-full"
                >
                  <Flame size={56} className="mb-4 text-[#C23E32]" />
                  <span className="text-4xl font-serif font-bold tracking-[0.5em] text-[#C23E32]">功成</span>
                  <span className="text-[10px] uppercase mt-4 tracking-widest text-[#C23E32] opacity-80">Mission Accomplished</span>
                </motion.div>
              )}
            </motion.div>

            {/* 3. 精进 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-8 flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#787878]">精进 Duration</div>
                  <Clock size={20} className="text-[#787878]" />
                </div>
                <div className="text-5xl font-serif font-bold text-[#2B2B2B] flex items-baseline gap-2">
                  {studyTime}<span className="text-sm font-sans text-[#787878] uppercase">min</span>
                </div>
              </div>
              <div className="w-full pt-6 border-t-2 border-[#E8E4DC] flex justify-between items-center">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#787878]">积墨 Total</div>
                <div className="flex items-center gap-1 font-bold">
                  <Droplets size={14} className="text-[#C23E32]"/> 
                  {totalPoints.toLocaleString()}
                </div>
              </div>
            </motion.div>
          </div>

          {/* 底部按钮 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <button
              onClick={() => router.push('/practice')}
              className="px-8 py-3 border-2 border-[#2B2B2B] text-sm font-serif hover:bg-[#2B2B2B] hover:text-white transition-all rounded-none"
            >
              进入备考指挥部 Proceed to Command Center →
            </button>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
