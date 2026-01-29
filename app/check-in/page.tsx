"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, Droplets, Clock, Calendar, BookText, Library, User, TrendingUp, ChevronLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { BottomNavBar } from "@/components/library/bottom-nav-bar"

type TabType = "home" | "practice" | "library" | "profile" | "study" | "check-in"

/**
 * 签到页面组件
 * 
 * 文件说明：
 * 用户每日签到页面，展示签到状态、学习进度和快捷入口
 * 
 * 功能：
 * - 显示用户欢迎信息（真实用户名）
 * - 提供签到功能（连接后端API）
 * - 显示今日真实学习进度
 * - 展示本周真实签到状态
 * - 提供快捷功能入口
 * 
 * 设计风格：
 * - 新中式极简主义
 * - 卡片式布局
 * - 优雅的视觉层次
 * - 全直角设计 (rounded-none)
 */
export default function CheckInPage() {
  const router = useRouter()
  const { learningMode } = useLanguage()
  const t = TRANSLATIONS[learningMode]
  const [activeTab, setActiveTab] = useState<TabType>("check-in")
  
  // 用户数据状态
  const [userName, setUserName] = useState<string>("")
  const [checked, setChecked] = useState(false)
  const [streak, setStreak] = useState(0)
  const [weekStatus, setWeekStatus] = useState<boolean[]>([false, false, false, false, false, false, false])
  const [studyTime, setStudyTime] = useState(0)
  const [studyGoal] = useState(60) // 每日目标学习时长（分钟）
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 获取问候语
   */
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t.dashboard.greeting.morning
    if (hour < 18) return t.dashboard.greeting.afternoon
    return t.dashboard.greeting.evening
  }

  /**
   * 获取本周日期标签
   */
  const getWeekDays = () => {
    return learningMode === 'LEARN_ENGLISH'
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      : ["日", "一", "二", "三", "四", "五", "六"]
  }

  /**
   * 从 localStorage 获取用户邮箱
   */
  const getUserEmail = () => {
    // 首先尝试从 inkwords_user 获取
    const userStr = localStorage.getItem('inkwords_user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        return user.email || null
      } catch {
        return null
      }
    }
    // 兼容旧版本，尝试 userEmail
    return localStorage.getItem('userEmail')
  }

  /**
   * 清除登录状态
   */
  const clearAuth = () => {
    localStorage.removeItem('inkwords_user')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userId')
  }

  /**
   * 获取用户数据和签到状态
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 检查用户是否已登录
        const userEmail = getUserEmail()
        if (!userEmail) {
          // 未登录状态，使用默认值
          setUserName(t.common.user)
          setStreak(0)
          setStudyTime(0)
          setChecked(false)
          setWeekStatus([false, false, false, false, false, false, false])
          setIsLoading(false)
          return
        }

        // 获取用户基本信息和学习统计
        const userResponse = await fetch('/api/user/me', {
          headers: {
            'x-user-email': userEmail
          }
        })

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            // 未授权，清除登录状态
            clearAuth()
            setUserName(t.common.user)
            setStreak(0)
            setStudyTime(0)
            setChecked(false)
            setWeekStatus([false, false, false, false, false, false, false])
            setIsLoading(false)
            return
          }
          const errorData = await userResponse.json()
          throw new Error(errorData.error || '获取用户信息失败')
        }

        const userData = await userResponse.json()
        setUserName(userData.user.name || t.common.user)
        setStreak(userData.user.streak || 0)
        setStudyTime(userData.todayStats?.studyTime || 0)

        // 获取签到状态
        const checkInResponse = await fetch('/api/checkin', {
          headers: {
            'x-user-email': userEmail
          }
        })

        if (!checkInResponse.ok) {
          throw new Error('获取签到状态失败')
        }

        const checkInData = await checkInResponse.json()
        setChecked(checkInData.checked)
        setWeekStatus(checkInData.weekStatus || [false, false, false, false, false, false, false])

      } catch (err: any) {
        console.error('获取数据失败:', err)
        setError(err.message || '加载失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [t.common.user])

  /**
   * 处理签到操作
   */
  const handleCheckIn = async () => {
    if (checked || isCheckingIn) return

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
        headers: {
          'x-user-email': userEmail
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '签到失败')
      }

      const data = await response.json()
      
      // 更新本地状态
      setChecked(true)
      setStreak(data.streak)
      
      // 更新本周签到状态（今天标记为已签到）
      const today = new Date().getDay()
      const newWeekStatus = [...weekStatus]
      newWeekStatus[today] = true
      setWeekStatus(newWeekStatus)

    } catch (err: any) {
      console.error('签到失败:', err)
      setError(err.message || '签到失败')
    } finally {
      setIsCheckingIn(false)
    }
  }

  /**
   * 计算学习进度百分比
   */
  const studyProgress = Math.min(Math.round((studyTime / studyGoal) * 100), 100)

  /**
   * 计算本周签到天数
   */
  const weeklyCheckInCount = weekStatus.filter(Boolean).length

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

      <div className="relative z-10 max-w-md mx-auto px-4 py-8 pb-24">
        {/* 返回按钮 */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/study")}
          className="flex items-center gap-2 text-[#787878] hover:text-[#2B2B2B] transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          <span className="text-xs font-serif">{t.common.back}</span>
        </motion.button>

        {/* 错误提示 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#C23E32] text-white px-4 py-3 mb-6 text-sm font-serif"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 欢迎语 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-serif font-bold text-[#2B2B2B] mb-2">
            {getGreeting()}，{userName}
          </h1>
          <p className="text-sm text-[#787878] font-serif">
            {t.welcome.slogan}
          </p>
        </motion.div>

        {/* 签到卡片 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 mb-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#2B2B2B] mb-1">{t.dashboard.checkIn.title}</h2>
              <p className="text-xs text-[#787878]">{t.dashboard.checkIn.streak} {streak} {t.dashboard.checkIn.days}</p>
            </div>
            <div className="flex items-center gap-1 text-[#C23E32]">
              <Flame size={20} />
              <span className="text-2xl font-serif font-bold">{streak}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            {!checked ? (
              <button
                onClick={handleCheckIn}
                disabled={isCheckingIn}
                className="w-full h-32 border-2 border-[#E8E4DC] flex flex-col items-center justify-center hover:bg-[#2B2B2B] hover:text-white hover:border-[#2B2B2B] transition-all group rounded-none relative disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingIn ? (
                  <Loader2 size={36} className="animate-spin mb-2" />
                ) : (
                  <Calendar size={36} className="mb-2 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-2xl font-serif font-bold tracking-widest">
                  {isCheckingIn ? t.common.processing : t.dashboard.checkIn.button}
                </span>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#C23E32] text-white flex items-center justify-center text-xs font-black rounded-none">
                  +10
                </div>
              </button>
            ) : (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full h-32 bg-[#2B2B2B] text-white flex flex-col items-center justify-center rounded-none"
              >
                <Flame size={36} className="mb-2 text-[#C23E32]" />
                <span className="text-2xl font-serif font-bold tracking-widest text-[#C23E32]">{t.dashboard.checkIn.checked}</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* 今日学习进度 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 mb-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-[#7A9078]" />
              <span className="text-sm font-serif font-bold text-[#2B2B2B]">{t.dashboard.stats.title}</span>
            </div>
            <span className="text-xs text-[#787878]">{t.dashboard.stats.minutes} {studyGoal}</span>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#787878] mb-2">
              <span>{t.dashboard.stats.timeSpent} {studyTime} {t.dashboard.stats.minutes}</span>
              <span>{studyProgress}%</span>
            </div>
            <div className="w-full h-2 bg-[#F5F2EC] rounded-none overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${studyProgress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-[#7A9078]"
              />
            </div>
          </div>
          <button
            onClick={() => router.push('/study')}
            className="w-full py-3 border-2 border-[#2B2B2B] text-sm font-serif hover:bg-[#2B2B2B] hover:text-white transition-all rounded-none"
          >
            {studyTime > 0 ? t.dashboard.quickActions.continuePractice : t.dashboard.quickActions.startPractice}
          </button>
        </motion.div>

        {/* 快捷功能 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <button
            onClick={() => router.push('/study')}
            className="bg-white p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all rounded-none hover:bg-[#F5F2EC]"
          >
            <BookText size={24} className="text-[#C23E32]" />
            <span className="text-xs font-serif text-[#2B2B2B]">{t.nav.practice}</span>
          </button>
          <button
            onClick={() => router.push('/library')}
            className="bg-white p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all rounded-none hover:bg-[#F5F2EC]"
          >
            <Library size={24} className="text-[#7A9078]" />
            <span className="text-xs font-serif text-[#2B2B2B]">{t.nav.library}</span>
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="bg-white p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all rounded-none hover:bg-[#F5F2EC]"
          >
            <User size={24} className="text-[#787878]" />
            <span className="text-xs font-serif text-[#2B2B2B]">{t.nav.profile}</span>
          </button>
        </motion.div>

        {/* 本周签到状态 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-[#787878]" />
              <span className="text-sm font-serif font-bold text-[#2B2B2B]">{t.dashboard.checkIn.title}</span>
            </div>
            <div className="flex items-center gap-1 text-[#C23E32]">
              <TrendingUp size={16} />
              <span className="text-xs font-bold">{weeklyCheckInCount}/7</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {getWeekDays().map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-2">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className={`w-full aspect-square border flex items-center justify-center text-sm font-bold transition-all rounded-none ${
                    weekStatus[i]
                      ? 'bg-[#2B2B2B] border-[#2B2B2B] text-white'
                      : 'bg-[#F5F2EC] border-[#E8E4DC] text-[#787878]'
                  }`}
                >
                  {weekStatus[i] ? '✓' : ''}
                </motion.div>
                <span className="text-[10px] text-[#787878]">{day}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
