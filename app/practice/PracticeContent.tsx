"use client";

/**
 * @file PracticeContent.tsx
 * @description 练习中心内容组件 - 包含所有客户端逻辑
 * @author InkWords Team
 * @date 2026-01-29
 */

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { PenTool, Lock, History, ChevronDown, Check, ChevronRight, BookOpen, Target, Flame, TrendingUp, Award, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BottomNavBar } from "@/components/library/bottom-nav-bar"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

const STORAGE_KEYS = {
  CHECKED: "inkwords_practice_checked",
  STREAK: "inkwords_practice_streak",
  INK_DROPS: "inkwords_ink_drops",
  USER_STATS: "inkwords_user_stats"
} as const

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

// 所有支持的考试类型
const ALL_EXAM_TYPES = ["IELTS", "TOEFL", "CET-4", "CET-6", "HSK", "BCT", "TOCFL"]

// 考试类型到语言轨道的映射
const EXAM_TO_TRACK: Record<string, "en" | "zh"> = {
  IELTS: "en",
  TOEFL: "en",
  "CET-4": "en",
  "CET-6": "en",
  HSK: "zh",
  BCT: "zh",
  TOCFL: "zh"
}

// 默认能力数据（新用户）
const DEFAULT_SKILLS = {
  en: [50, 50, 50, 50, 50],
  zh: [50, 50, 50, 50, 50]
}

// 雷达图组件
const InkRadar = ({ d, track }: { d: number[], track: "en" | "zh" }) => {
  const s = 280
  const ctr = 140
  const r = 90
  const ang = [0, 72, 144, 216, 288].map(a => (a - 90) * (Math.PI / 180))
  
  const getP = (vs: number[]) => {
    return vs.map((v, i) => {
      return `${ctr + (v / 100) * r * Math.cos(ang[i])},${ctr + (v / 100) * r * Math.sin(ang[i])}`
    }).join(" ")
  }

  const labels = track === "en" 
    ? ["Listening", "Speaking", "Reading", "Writing", "Vocabulary"]
    : ["听力", "口语", "阅读", "写作", "词汇"]

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="w-full max-w-[280px] mx-auto">
      {/* 背景网格 */}
      {[20, 40, 60, 80, 100].map((level, i) => (
        <polygon
          key={i}
          points={getP([level, level, level, level, level])}
          fill="none"
          stroke="#E5E5E5"
          strokeWidth="1"
        />
      ))}
      {/* 轴线 */}
      {ang.map((angle, i) => (
        <line
          key={i}
          x1={ctr}
          y1={ctr}
          x2={ctr + r * Math.cos(angle)}
          y2={ctr + r * Math.sin(angle)}
          stroke="#E5E5E5"
          strokeWidth="1"
        />
      ))}
      {/* 数据区域 */}
      <polygon
        points={getP(d)}
        fill="#C23E32"
        fillOpacity="0.15"
        stroke="#C23E32"
        strokeWidth="2"
      />
      {/* 数据点 */}
      {d.map((value, i) => {
        const x = ctr + (value / 100) * r * Math.cos(ang[i])
        const y = ctr + (value / 100) * r * Math.sin(ang[i])
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="4"
            fill="#C23E32"
          />
        )
      })}
      {/* 标签 */}
      {labels.map((label, i) => {
        const labelRadius = r + 20
        const x = ctr + labelRadius * Math.cos(ang[i])
        const y = ctr + labelRadius * Math.sin(ang[i])
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] fill-gray-600 font-medium"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

// 考试类型选择器 - 支持所有考试类型
const ExamTypeSelector = ({ 
  currentType, 
  onTypeChange 
}: { 
  currentType: string
  onTypeChange: (type: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false)
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
      >
        <Target className="w-4 h-4 text-[#C23E32]" />
        <span className="font-bold text-gray-800">{currentType}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="py-1">
            {ALL_EXAM_TYPES.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onTypeChange(opt)
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">{opt}</span>
                {currentType === opt && <Check className="w-4 h-4 text-[#C23E32]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 功能卡片组件
const FeatureCard = ({ 
  href, 
  icon: Icon, 
  title, 
  subtitle, 
  description,
  locked = false,
  variant = "default",
  progress
}: { 
  href: string
  icon: React.ElementType
  title: string
  subtitle: string
  description: string
  locked?: boolean
  variant?: "default" | "primary" | "secondary"
  progress?: { current: number; required: number }
}) => {
  const baseStyles = "group block p-6 rounded-xl transition-all duration-300 backdrop-blur"
  const variantStyles = {
    default: "bg-white/90 border-2 border-gray-200 hover:border-[#C23E32] hover:shadow-lg",
    primary: "bg-[#2B2B2B]/95 text-white hover:bg-[#1a1a1a] hover:shadow-xl",
    secondary: "bg-white/90 border-2 border-gray-200 hover:border-green-600 hover:shadow-lg"
  }

  return (
    <Link href={locked ? "#" : href} className={`${baseStyles} ${variantStyles[variant]} ${locked ? 'opacity-75' : ''}`}>
      <motion.div
        whileHover={locked ? {} : { scale: 1.02 }}
        whileTap={locked ? {} : { scale: 0.98 }}
        className="h-full flex flex-col"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${variant === "primary" ? "bg-[#C23E32]/20" : "bg-gray-100"}`}>
            <Icon className={`w-6 h-6 ${variant === "primary" ? "text-[#C23E32]" : "text-gray-600"}`} />
          </div>
          {locked && <Lock className="w-4 h-4 text-[#C23E32]" />}
        </div>
        <h3 className={`text-xl font-bold mb-1 ${variant === "primary" ? "text-white" : "text-gray-800"}`}>
          {title}
        </h3>
        <p className={`text-xs uppercase tracking-wider mb-2 ${variant === "primary" ? "text-[#C23E32]" : "text-gray-400"}`}>
          {subtitle}
        </p>
        <p className={`text-sm ${variant === "primary" ? "text-gray-300" : "text-gray-500"}`}>
          {description}
        </p>
        
        {/* 进度条（如果提供） */}
        {progress && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">
                {progress.current >= progress.required 
                  ? (typeof window !== 'undefined' && localStorage.getItem('inkwords_ui_language') === 'zh' ? '已解锁' : 'Unlocked')
                  : (typeof window !== 'undefined' && localStorage.getItem('inkwords_ui_language') === 'zh' ? '解锁进度' : 'Unlock Progress')
                }
              </span>
              <span className="text-[#C23E32]">{progress.current}/{progress.required}</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#C23E32] rounded-full transition-all"
                style={{ width: `${Math.min((progress.current / progress.required) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="mt-auto pt-4 flex items-center text-sm font-medium">
          <span className={variant === "primary" ? "text-[#C23E32]" : "text-gray-600"}>
            {locked 
              ? (typeof window !== 'undefined' && localStorage.getItem('inkwords_ui_language') === 'zh' ? '已锁定' : 'Locked')
              : (typeof window !== 'undefined' && localStorage.getItem('inkwords_ui_language') === 'zh' ? '开始练习' : 'Start Practice')
            }
          </span>
          <ChevronRight className={`w-4 h-4 ml-1 transition-transform group-hover:translate-x-1 ${variant === "primary" ? "text-[#C23E32]" : "text-gray-400"}`} />
        </div>
      </motion.div>
    </Link>
  )
}

// 统计卡片组件
const StatCard = ({ icon: Icon, value, label, color = "blue" }: { 
  icon: React.ElementType
  value: string | number
  label: string
  color?: "blue" | "orange" | "green" | "purple"
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600"
  }

  return (
    <div className="bg-white/90 backdrop-blur rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

// 用户能力数据接口
interface UserStats {
  skills: number[]
  currentScore: string
  targetScore: string
  streak: number
  totalQuestions: number
  correctRate: number
  inkDrops: number
}

/**
 * 练习中心内容组件
 * @returns JSX.Element
 */
export default function PracticeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { learningMode, uiLanguage, switchMode } = useLanguage()
  const t = TRANSLATIONS[learningMode]
  
  // 从 URL 获取当前考试类型
  const currentType = searchParams.get("type") || "IELTS"
  const currentTrack = EXAM_TO_TRACK[currentType] || "en"
  
  const [activeTab, setActiveTab] = useState<"home" | "practice" | "library" | "profile" | "study" | "check-in">("practice")
  const [isLoading, setIsLoading] = useState(true)
  
  // 用户统计数据
  const [userStats, setUserStats] = useState<UserStats>({
    skills: DEFAULT_SKILLS[currentTrack],
    currentScore: currentTrack === "en" ? "0.0" : "0",
    targetScore: currentTrack === "en" ? "7.5" : "240",
    streak: 0,
    totalQuestions: 0,
    correctRate: 0,
    inkDrops: 0
  })

  // 从 Supabase 获取用户真实数据
  const fetchUserStats = useCallback(async () => {
    setIsLoading(true)
    console.log('[Practice] Fetching user stats for exam type:', currentType)
    
    try {
      // 获取当前用户会话
      let user = null
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          user = session.user
        }
      } catch (sessionError) {
        console.log('[Practice] No active session:', sessionError)
      }
      
      if (!user) {
        console.log('[Practice] No user logged in, using default data')
        // 未登录用户使用默认数据
        setUserStats({
          skills: DEFAULT_SKILLS[currentTrack],
          currentScore: currentTrack === "en" ? "0.0" : "0",
          targetScore: currentTrack === "en" ? "7.5" : "240",
          streak: 0,
          totalQuestions: 0,
          correctRate: 0,
          inkDrops: 0
        })
        setIsLoading(false)
        return
      }

      console.log('[Practice] User logged in:', user.id)

      // 获取用户的练习记录 - 使用 mock_exams 表作为备选
      let practiceRecords: any[] = []
      let recordsError: any = null

      // 首先尝试从 practice_records 表获取
      const { data: records, error: prError } = await supabase
        .from('practice_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('exam_type', currentType)
        .order('created_at', { ascending: false })

      if (prError) {
        console.warn('[Practice] practice_records table error:', prError)
        recordsError = prError
      } else {
        practiceRecords = records || []
        console.log('[Practice] Found', practiceRecords.length, 'practice records')
      }

      // 如果没有 practice_records，尝试从 user_progress 表获取
      if (practiceRecords.length === 0) {
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('exam_type', currentType)
          .single()

        if (!progressError && progressData) {
          console.log('[Practice] Found user_progress data:', progressData)
          // 使用 user_progress 数据构建模拟记录
          practiceRecords = [{
            is_correct: true,
            question_type: 'reading',
            created_at: new Date().toISOString()
          }]
        }
      }

      // 计算统计数据
      const totalQuestions = practiceRecords?.length || 0
      const correctAnswers = practiceRecords?.filter((r: any) => r.is_correct).length || 0
      const correctRate = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

      console.log('[Practice] Stats calculated:', { totalQuestions, correctAnswers, correctRate })

      // 计算各项能力得分（基于最近20道题的表现）
      const recentRecords = practiceRecords?.slice(0, 20) || []
      const skillScores = calculateSkillScores(recentRecords, currentTrack)

      // 计算当前分数（基于正确率）
      const currentScore = calculateCurrentScore(correctRate, currentTrack)

      // 获取用户数据（ink_drops, streak_days）
      let userData: any = null
      try {
        const { data: uData, error: userError } = await supabase
          .from('users')
          .select('ink_drops, streak_days')
          .eq('id', user.id)
          .single()

        if (userError) {
          console.warn('[Practice] users table error:', userError)
        } else {
          userData = uData
          console.log('[Practice] User data:', userData)
        }
      } catch (e) {
        console.warn('[Practice] Error fetching user data:', e)
      }

      const newStats = {
        skills: skillScores,
        currentScore,
        targetScore: currentTrack === "en" ? "7.5" : "240",
        streak: userData?.streak_days || loadFromStorage(STORAGE_KEYS.STREAK, 0),
        totalQuestions,
        correctRate,
        inkDrops: userData?.ink_drops || loadFromStorage(STORAGE_KEYS.INK_DROPS, 0)
      }

      console.log('[Practice] Setting user stats:', newStats)
      setUserStats(newStats)

      // 保存到本地存储
      localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify({
        skills: skillScores,
        currentScore,
        totalQuestions,
        correctRate
      }))

    } catch (err) {
      console.error('[Practice] Error fetching user stats:', err)
      // 使用默认数据
      setUserStats({
        skills: DEFAULT_SKILLS[currentTrack],
        currentScore: currentTrack === "en" ? "0.0" : "0",
        targetScore: currentTrack === "en" ? "7.5" : "240",
        streak: 0,
        totalQuestions: 0,
        correctRate: 0,
        inkDrops: 0
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentType, currentTrack])

  // 计算各项能力得分
  const calculateSkillScores = (records: any[], track: "en" | "zh") => {
    // 默认各能力基础分50
    const scores = [50, 50, 50, 50, 50]
    
    if (records.length === 0) return scores

    // 根据题目类型分类统计
    const skillCategories = track === "en" 
      ? ['listening', 'speaking', 'reading', 'writing', 'vocabulary']
      : ['listening', 'speaking', 'reading', 'writing', 'vocabulary']

    skillCategories.forEach((category, index) => {
      const categoryRecords = records.filter(r => 
        r.question_type?.toLowerCase().includes(category) ||
        r.skill_type?.toLowerCase().includes(category)
      )
      
      if (categoryRecords.length > 0) {
        const correct = categoryRecords.filter(r => r.is_correct).length
        const rate = correct / categoryRecords.length
        // 基础分50 + 表现分（最高50）
        scores[index] = Math.min(50 + Math.round(rate * 50), 100)
      }
    })

    return scores
  }

  // 计算当前分数
  const calculateCurrentScore = (correctRate: number, track: "en" | "zh") => {
    if (track === "en") {
      // IELTS 分数范围 0-9
      return (correctRate / 100 * 9).toFixed(1)
    } else {
      // HSK 分数范围 0-300
      return Math.round(correctRate / 100 * 300).toString()
    }
  }

  // 初始加载和考试类型变化时获取数据
  useEffect(() => {
    fetchUserStats()
  }, [fetchUserStats])

  // 定期刷新数据（每30秒）
  useEffect(() => {
    const interval = setInterval(fetchUserStats, 30000)
    return () => clearInterval(interval)
  }, [fetchUserStats])

  // 监听 localStorage 变化（Ink Drops 更新）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.INK_DROPS) {
        const newDrops = parseInt(e.newValue || '0')
        setUserStats(prev => ({ ...prev, inkDrops: newDrops }))
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 处理考试类型切换
  const handleTypeChange = (newType: string) => {
    // 根据考试类型切换语言模式
    // HSK、BCT、TOCFL 是中文考试 -> LEARN_CHINESE
    // IELTS、TOEFL、CET-4、CET-6 是英文考试 -> LEARN_ENGLISH
    const isChineseExam = ['HSK', 'BCT', 'TOCFL'].includes(newType)
    const newMode = isChineseExam ? 'LEARN_CHINESE' : 'LEARN_ENGLISH'
    
    // 切换语言模式
    switchMode(newMode)
    
    // 更新 URL
    const params = new URLSearchParams(searchParams.toString())
    params.set("type", newType)
    router.push(`/practice?${params.toString()}`)
  }

  // 生成功能卡片的链接（带 type 参数）
  const getLinkWithType = (path: string) => {
    const params = new URLSearchParams(searchParams.toString())
    return `${path}?${params.toString()}`
  }

  // 判断是否解锁模考（完成50道题）
  const isMockUnlocked = userStats.totalQuestions >= 50

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat"
      style={{ backgroundImage: "url('/bg3.png')" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* 左侧：标题和选择器 */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {uiLanguage === 'zh' ? '备考中心' : 'Practice Center'}
              </h1>
              <p className="text-sm text-gray-500">
                {uiLanguage === 'zh' ? 'Practice Center' : '备考中心'}
              </p>
            </div>
            <div className="h-8 w-px bg-gray-300" />
            <ExamTypeSelector 
              currentType={currentType} 
              onTypeChange={handleTypeChange}
            />
          </div>
          
          {/* 右侧：分数显示 */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {uiLanguage === 'zh' ? '当前 / 目标' : 'Current / Target'}
              </p>
              <p className="text-2xl font-bold text-[#C23E32]">
                {isLoading ? '-' : userStats.currentScore} <span className="text-sm text-gray-600 font-normal">/ {userStats.targetScore}</span>
              </p>
            </div>
            <div className="hidden sm:block h-10 w-px bg-gray-300" />
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Ink Drops</p>
              <p className="text-2xl font-bold text-[#C23E32]">{userStats.inkDrops}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* 统计卡片行 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard 
              icon={Flame} 
              value={isLoading ? '-' : userStats.streak} 
              label={uiLanguage === 'zh' ? '连续天数' : 'Streak'}
              color="orange"
            />
            <StatCard 
              icon={TrendingUp} 
              value={isLoading ? '-' : userStats.totalQuestions} 
              label={uiLanguage === 'zh' ? '完成题目' : 'Questions'}
              color="blue"
            />
            <StatCard 
              icon={Award} 
              value={isLoading ? '-' : `${userStats.correctRate}%`} 
              label={uiLanguage === 'zh' ? '正确率' : 'Accuracy'}
              color="green"
            />
            <StatCard 
              icon={Target} 
              value={isLoading ? '-' : userStats.inkDrops} 
              label="Ink Drops"
              color="purple"
            />
          </div>
          
          {/* 数据加载提示 */}
          {isLoading && (
            <div className="text-center py-2 text-sm text-gray-500">
              {uiLanguage === 'zh' ? '正在加载您的学习数据...' : 'Loading your learning data...'}
            </div>
          )}
          
          {/* 无数据提示 */}
          {!isLoading && userStats.totalQuestions === 0 && (
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-gray-200 text-center">
              <p className="text-gray-600 mb-2">
                {uiLanguage === 'zh' ? '💡 提示：登录以保存学习进度' : '💡 Tip: Sign in to save your progress'}
              </p>
              <Link 
                href="/auth/login"
                className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                {uiLanguage === 'zh' ? '登录' : 'Sign In'}
              </Link>
            </div>
          )}

          {!isLoading && userStats.totalQuestions === 0 && (
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-gray-200 text-center">
              <p className="text-gray-600 mb-2">{uiLanguage === 'zh' ? '欢迎使用备考中心！' : 'Welcome to Practice Center!'}</p>
              <p className="text-sm text-gray-500">{uiLanguage === 'zh' ? '开始练习以查看您的能力评估数据' : 'Start practicing to see your skill analysis'}</p>
              <Link 
                href={getLinkWithType("/practice/drill")}
                className="inline-block mt-3 px-4 py-2 bg-[#C23E32] text-white rounded-lg text-sm font-medium hover:bg-[#a83228] transition-colors"
              >
                {uiLanguage === 'zh' ? '开始首次练习' : 'Start First Practice'}
              </Link>
            </div>
          )}

          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* 左侧：能力雷达图 */}
            <div className="lg:col-span-5">
              <div className="bg-white/90 backdrop-blur rounded-2xl border border-gray-200 p-6 shadow-sm h-full">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {uiLanguage === 'zh' ? '能力评估' : 'Skill Analysis'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {uiLanguage === 'zh' ? 'Skill Analysis' : '能力评估'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#C23E32] uppercase tracking-wider">
                      {uiLanguage === 'zh' ? '目标' : 'Target'}
                    </p>
                    <p className="text-xl font-bold text-gray-800">{currentType}</p>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="h-[280px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C23E32]" />
                  </div>
                ) : (
                  <>
                    <InkRadar d={userStats.skills} track={currentTrack} />
                    <div className="mt-6 grid grid-cols-5 gap-2 text-center">
                      {userStats.skills.map((score, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-2">
                          <p className="text-lg font-bold text-[#C23E32]">{score}</p>
                          <p className="text-[10px] text-gray-400">
                            {currentTrack === "en" 
                              ? ["L", "S", "R", "W", "V"][i]
                              : ["听", "说", "读", "写", "词"][i]
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 右侧：功能入口 */}
            <div className="lg:col-span-7 space-y-6">
              {/* 主要功能：智能刷题 */}
              <FeatureCard
                href={getLinkWithType("/practice/drill")}
                icon={BookOpen}
                title={uiLanguage === 'zh' ? '智能刷题' : 'Smart Drill'}
                subtitle={uiLanguage === 'zh' ? 'Daily Practice' : 'Daily Practice'}
                description={uiLanguage === 'zh' 
                  ? '专项突破，自动循环，攻克薄弱环节'
                  : 'Adaptive practice with automatic difficulty adjustment'
                }
                variant="primary"
              />
              
              {/* 次要功能网格 */}
              <div className="grid sm:grid-cols-2 gap-4">
                <FeatureCard
                  href={getLinkWithType("/practice/mock")}
                  icon={PenTool}
                  title={uiLanguage === 'zh' ? '全真模考' : 'Mock Exam'}
                  subtitle={uiLanguage === 'zh' ? 'Simulation' : 'Simulation'}
                  description={uiLanguage === 'zh'
                    ? '模拟真实考试环境，检验备考成果'
                    : 'Full-length practice tests under exam conditions'
                  }
                  locked={!isMockUnlocked}
                  progress={!isMockUnlocked ? { current: userStats.totalQuestions, required: 50 } : undefined}
                />
                <FeatureCard
                  href="#"
                  icon={History}
                  title={uiLanguage === 'zh' ? '错题本' : 'Mistake Bank'}
                  subtitle={uiLanguage === 'zh' ? 'Review' : 'Review'}
                  description={uiLanguage === 'zh'
                    ? '回顾错题，针对性强化训练'
                    : 'Review and learn from your mistakes'
                  }
                  variant="secondary"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
