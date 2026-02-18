"use client"

/**
 * @file page.tsx
 * @description 签到页面组件 - 使用全局 AuthContext
 * @author InkWords Team
 * @date 2026-02-14
 * @version 3.1.0 - 修复无限循环问题
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, Clock, Calendar, BookText, Library, User, TrendingUp, ChevronLeft, Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/contexts/language-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { BottomNavBar } from "@/components/library/bottom-nav-bar"

type TabType = "home" | "practice" | "library" | "profile" | "study" | "checkin"

export default function CheckInPage() {
  const router = useRouter()
  const { learningMode } = useLanguage()
  const { user: authUser, isLoading: authLoading } = useAuth()
  const t = TRANSLATIONS[learningMode]
  const [activeTab, setActiveTab] = useState<TabType>("checkin")
  
  // 用户数据状态
  const [userName, setUserName] = useState<string>("")
  const [checked, setChecked] = useState(false)
  const [streak, setStreak] = useState(0)
  const [weekStatus, setWeekStatus] = useState<boolean[]>([false, false, false, false, false, false, false])
  const [studyTime, setStudyTime] = useState(0)
  const [studyGoal] = useState(60)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 使用 ref 存储稳定的值，避免依赖项变化
  const authUserRef = useRef(authUser)
  const authLoadingRef = useRef(authLoading)
  const defaultUserName = useRef(t.common.user)
  
  useEffect(() => {
    authUserRef.current = authUser
    authLoadingRef.current = authLoading
    defaultUserName.current = t.common.user
  }, [authUser, authLoading, t.common.user])

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
   * 【关键】获取用户数据和签到状态 - 使用全局 Auth
   * 修复：使用 ref 获取最新值，避免依赖项变化导致函数重建
   */
  const fetchData = useCallback(async (showLoading = true) => {
    const currentAuthUser = authUserRef.current
    const currentAuthLoading = authLoadingRef.current
    const currentDefaultUserName = defaultUserName.current

    // 【关键】如果认证还在加载中，等待
    if (currentAuthLoading) {
      console.log('[CheckIn] 认证加载中，等待...')
      return
    }

    // 【关键】只有加载完成且真的没有用户，才设置为未登录状态
    if (!currentAuthUser) {
      console.log('[CheckIn] 用户未登录')
      setUserName(currentDefaultUserName)
      setStreak(0)
      setStudyTime(0)
      setChecked(false)
      setWeekStatus([false, false, false, false, false, false, false])
      setIsLoading(false)
      setIsRefreshing(false)
      return
    }

    try {
      if (showLoading) setIsLoading(true)
      setIsRefreshing(true)
      setError(null)

      console.log('[CheckIn] 开始获取数据，用户:', currentAuthUser.id)

      // 【关键】并行获取用户信息和签到状态，传入 userId
      const timestamp = Date.now()
      const [userResponse, checkInResponse] = await Promise.all([
        fetch(`/api/user/me?_t=${timestamp}&userId=${currentAuthUser.id}`, {
          headers: { 'Cache-Control': 'no-cache' },
          cache: 'no-store'
        }),
        fetch(`/api/checkin?_t=${timestamp}&userId=${currentAuthUser.id}`, {
          headers: { 'Cache-Control': 'no-cache' },
          cache: 'no-store'
        })
      ])

      console.log('[CheckIn] API 响应状态:', { 
        user: userResponse.status, 
        checkin: checkInResponse.status 
      })

      // 处理用户数据
      if (userResponse.ok) {
        const userData = await userResponse.json()
        console.log('[CheckIn] 用户数据:', userData.user)
        setUserName(userData.user.name || currentDefaultUserName)
        setStreak(userData.user.streak || 0)
        setStudyTime(userData.todayStats?.studyTime || 0)
      } else if (userResponse.status === 401) {
        console.log('[CheckIn] 未授权，用户可能已登出')
        setUserName(currentDefaultUserName)
        setStreak(0)
        setStudyTime(0)
        setChecked(false)
        setWeekStatus([false, false, false, false, false, false, false])
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      // 处理签到状态
      if (checkInResponse.ok) {
        const checkInData = await checkInResponse.json()
        console.log('[CheckIn] 签到数据:', checkInData)
        setChecked(checkInData.checked)
        setWeekStatus(checkInData.weekStatus || [false, false, false, false, false, false, false])
        // 【关键】确保 streak 与 users 表一致
        if (checkInData.streak !== undefined) {
          setStreak(checkInData.streak)
        }
      }

    } catch (err: any) {
      console.error('[CheckIn] 获取数据失败:', err)
      setError(err.message || '加载失败')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, []) // 空依赖数组，使用 ref 获取最新值

  /**
   * 【关键】组件挂载时获取数据
   * 修复：依赖 authUser?.id 和 authLoading，避免无限循环
   */
  useEffect(() => {
    fetchData()
  }, [authUser?.id, authLoading, fetchData])

  /**
   * 【新增】监听页面可见性变化，切换回页面时刷新数据
   * 修复：使用 ref 避免依赖 fetchData
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[CheckIn] 页面可见，刷新数据')
        fetchData(false) // 不显示 loading 状态
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchData])

  /**
   * 【新增】监听窗口聚焦事件，切换回窗口时刷新数据
   * 修复：使用 ref 避免依赖 fetchData
   */
  useEffect(() => {
    const handleFocus = () => {
      console.log('[CheckIn] 窗口聚焦，刷新数据')
      fetchData(false)
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchData])

  /**
   * 处理签到操作
   */
  const handleCheckIn = async () => {
    if (checked || isCheckingIn) return

    // 【关键】如果认证还在加载中，直接返回
    if (authLoading) {
      console.log('[CheckIn] 认证加载中，跳过签到')
      return
    }

    // 【关键】只有加载完成且真的没有用户，才显示登录提示
    if (!authUser) {
      setError('请先登录')
      return
    }

    try {
      setIsCheckingIn(true)
      setError(null)

      console.log('[CheckIn] 开始签到')
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: authUser.id })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '签到失败')
      }

      const data = await response.json()
      console.log('[CheckIn] 签到成功:', data)
      
      // 更新本地状态
      setChecked(true)
      setStreak(data.streak)
      
      // 更新本周签到状态
      const today = new Date().getDay()
      const newWeekStatus = [...weekStatus]
      newWeekStatus[today] = true
      setWeekStatus(newWeekStatus)

      // 【关键】签到成功后立即刷新数据，确保同步
      setTimeout(() => {
        fetchData(false)
      }, 500)

    } catch (err: any) {
      console.error('[CheckIn] 签到失败:', err)
      setError(err.message || '签到失败')
    } finally {
      setIsCheckingIn(false)
    }
  }

  /**
   * 【新增】手动刷新数据
   */
  const handleRefresh = () => {
    fetchData(false)
  }

  const studyProgress = Math.min(Math.round((studyTime / studyGoal) * 100), 100)
  const weeklyCheckInCount = weekStatus.filter(Boolean).length

  // 【关键】如果认证还在加载中，显示全局加载
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-[#7A9078]" />
          <span className="text-sm text-[#787878] font-serif">加载中...</span>
        </div>
      </div>
    )
  }

  // 【关键】如果页面数据还在加载中，显示加载
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
        {/* 返回按钮和刷新按钮 */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push("/study")}
            className="flex items-center gap-2 text-[#787878] hover:text-[#2B2B2B] transition-colors"
          >
            <ChevronLeft size={16} />
            <span className="text-xs font-serif">{t.common.back}</span>
          </motion.button>
          
          {/* 【新增】手动刷新按钮 */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 text-[#787878] hover:text-[#2B2B2B] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="text-xs font-serif">刷新</span>
          </motion.button>
        </div>

        {/* 【关键】错误提示 - 只有在明确没有加载且没有用户时才显示请先登录 */}
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

        {/* 【关键】只有在明确没有加载且没有用户时才显示请先登录警告 */}
        {!authLoading && !authUser && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#C23E32] text-white px-4 py-3 mb-6 text-sm font-serif text-center"
          >
            请先登录
          </motion.div>
        )}

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
                disabled={isCheckingIn || authLoading}
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
