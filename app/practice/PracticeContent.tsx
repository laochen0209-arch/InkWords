"use client";

/**
 * @file PracticeContent.tsx
 * @description 练习中心内容组件 - 包含所有客户端逻辑
 * @author InkWords Team
 * @date 2026-01-29
 * @version 2.2.0 - 添加水墨风格空状态组件
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { PenTool, Lock, History, ChevronDown, Check, ChevronRight, BookOpen, Target, Flame, TrendingUp, Award, Loader2, RefreshCw, Sparkles, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BottomNavBar } from "@/components/library/bottom-nav-bar"
import { useLanguage } from "@/lib/contexts/language-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

// 水墨风格空状态组件
interface EmptyStateProps {
  type: 'no-data' | 'loading-error'
  examType?: string
  onRefresh?: () => void
  onSwitchType?: () => void
  uiLanguage: 'zh' | 'en'
}

const EmptyState = ({ type, examType, onRefresh, onSwitchType, uiLanguage }: EmptyStateProps) => {
  const isZh = uiLanguage === 'zh'

  // 水墨动画效果
  const inkDropVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: [0, 1.2, 1],
      opacity: [0, 0.6, 0.3],
      transition: {
        duration: 2,
        ease: "easeOut" as const,
        repeat: Infinity,
        repeatDelay: 3
      }
    }
  }

  const floatVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 4,
        ease: "easeInOut" as const,
        repeat: Infinity
      }
    }
  }

  if (type === 'no-data') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#faf8f5] to-[#f5f0e8] rounded-2xl border border-[#e8e0d5] p-8 text-center relative overflow-hidden"
      >
        {/* 水墨背景装饰 */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="inkGradient1" cx="30%" cy="30%" r="50%">
                <stop offset="0%" stopColor="#2c2c2c" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#2c2c2c" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="inkGradient2" cx="70%" cy="60%" r="40%">
                <stop offset="0%" stopColor="#2c2c2c" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#2c2c2c" stopOpacity="0" />
              </radialGradient>
            </defs>
            <motion.ellipse
              cx="100"
              cy="80"
              rx="60"
              ry="40"
              fill="url(#inkGradient1)"
              variants={inkDropVariants}
              initial="initial"
              animate="animate"
            />
            <motion.ellipse
              cx="280"
              cy="180"
              rx="40"
              ry="30"
              fill="url(#inkGradient2)"
              variants={inkDropVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: '1s' }}
            />
          </svg>
        </div>

        {/* 主内容 */}
        <div className="relative z-10">
          {/* 图标区域 */}
          <motion.div
            variants={floatVariants}
            initial="initial"
            animate="animate"
            className="mb-6"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#C23E32]/10 to-[#C23E32]/5 rounded-full flex items-center justify-center border border-[#C23E32]/20">
              <Sparkles className="w-10 h-10 text-[#C23E32]/60" />
            </div>
          </motion.div>

          {/* 标题 */}
          <h3 className="text-xl font-bold text-[#2c2c2c] mb-3 font-serif">
            {isZh ? '墨香未至，试卷筹备中' : 'Preparing Your Practice'}
          </h3>

          {/* 描述 */}
          <p className="text-[#666] mb-2 max-w-md mx-auto leading-relaxed">
            {isZh
              ? `当前「${examType || '该考试'}」分类暂无试卷，AI 正在努力出题中...`
              : `No practice papers available for ${examType || 'this exam'} yet. Our AI is working hard to create them...`
            }
          </p>

          <p className="text-sm text-[#999] mb-6">
            {isZh ? '预计很快就会有新试卷上线，请稍后再来' : 'New papers will be available soon. Please check back later.'}
          </p>

          {/* 行动按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRefresh && (
              <Button
                onClick={onRefresh}
                variant="outline"
                className="border-[#C23E32]/30 text-[#C23E32] hover:bg-[#C23E32]/5 px-6"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {isZh ? '刷新试试' : 'Refresh'}
              </Button>
            )}
            {onSwitchType && (
              <Button
                onClick={onSwitchType}
                className="bg-[#C23E32] hover:bg-[#a83228] text-white px-6"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {isZh ? '切换其他分类' : 'Try Other Categories'}
              </Button>
            )}
          </div>

          {/* 底部装饰文字 */}
          <div className="mt-8 pt-6 border-t border-[#e8e0d5]">
            <p className="text-xs text-[#999] italic font-serif">
              {isZh ? '"学而不思则罔，思而不学则殆"' : '"Practice makes perfect"'}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  // 加载错误状态
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#fef5f5] to-[#faf0f0] rounded-2xl border border-[#f0d5d5] p-8 text-center"
    >
      <div className="w-20 h-20 mx-auto bg-[#C23E32]/10 rounded-full flex items-center justify-center mb-4">
        <RefreshCw className="w-8 h-8 text-[#C23E32]" />
      </div>
      <h3 className="text-lg font-bold text-[#2c2c2c] mb-2">
        {isZh ? '数据加载失败' : 'Failed to Load Data'}
      </h3>
      <p className="text-[#666] mb-4">
        {isZh ? '请检查网络连接后重试' : 'Please check your connection and try again'}
      </p>
      {onRefresh && (
        <Button
          onClick={onRefresh}
          className="bg-[#C23E32] hover:bg-[#a83228] text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {isZh ? '重新加载' : 'Reload'}
        </Button>
      )}
    </motion.div>
  )
}

const STORAGE_KEYS = {
  CHECKED: "inkwords_practice_checked",
  STREAK: "inkwords_practice_streak",
  INK_DROPS: "inkwords_ink_drops",
  USER_STATS: "inkwords_user_stats",
  LAST_EXAM_TYPE: "inkwords_last_exam_type"
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

// 【新增】考试类型中文映射
const EXAM_TYPE_LABELS: Record<string, string> = {
  IELTS: "雅思",
  TOEFL: "托福",
  "CET-4": "大学英语四级",
  "CET-6": "大学英语六级",
  HSK: "汉语水平考试",
  BCT: "商务汉语考试",
  TOCFL: "华语文能力测试"
}

// 【新增】试卷标题翻译函数
const translateExamTitle = (title: string, isZh: boolean): string => {
  if (!isZh) return title
  
  // 常见的英文标题模式翻译
  const translations: Record<string, string> = {
    "Practice Test": "模拟测试",
    "Mock Exam": "模拟考试",
    "Sample Test": "样题测试",
    "Full Test": "全真测试",
    "Section Test": "专项测试",
    "Listening": "听力",
    "Reading": "阅读",
    "Writing": "写作",
    "Speaking": "口语",
    "Vocabulary": "词汇",
    "Grammar": "语法"
  }
  
  let translated = title
  Object.entries(translations).forEach(([en, zh]) => {
    translated = translated.replace(new RegExp(en, 'gi'), zh)
  })
  
  return translated
}

// 【新增】试卷描述翻译函数
const translateExamDescription = (desc: string | null, isZh: boolean): string => {
  if (!isZh) return desc || 'No description'
  if (!desc) return '暂无描述'
  
  // 常见的英文描述模式翻译
  const translations: Record<string, string> = {
    "This is a": "这是一套",
    "practice test": "模拟测试",
    "mock exam": "模拟考试",
    "designed to": "旨在",
    "help you": "帮助你",
    "prepare for": "备考",
    "improve your": "提升你的",
    "test your": "测试你的",
    "skills": "技能",
    "abilities": "能力",
    "knowledge": "知识",
    "level": "水平",
    "difficulty": "难度",
    "questions": "题目",
    "minutes": "分钟",
    "covering": "涵盖",
    "including": "包括",
    "various": "各种",
    "topics": "主题",
    "areas": "领域"
  }
  
  let translated = desc
  Object.entries(translations).forEach(([en, zh]) => {
    translated = translated.replace(new RegExp(`\\b${en}\\b`, 'gi'), zh)
  })
  
  return translated
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
    <div className="relative" onClick={(e) => e.stopPropagation()} data-exam-type-selector>
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
  const { uiLanguage } = useLanguage()
  const isZh = uiLanguage === 'zh'
  
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
                  ? (isZh ? '已解锁' : 'Unlocked')
                  : (isZh ? '解锁进度' : 'Unlock Progress')
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
              ? (isZh ? '已锁定' : 'Locked')
              : (isZh ? '开始练习' : 'Start Practice')
            }
          </span>
          <ChevronRight className={`w-4 h-4 ml-1 transition-transform group-hover:translate-x-1 ${variant === "primary" ? "text-[#C23E32]" : "text-gray-400"}`} />
        </div>
      </motion.div>
    </Link>
  )
}

// 会员徽章组件
const MembershipBadge = ({ status }: { status: string | null }) => {
  const isVip = status === 'yearly' || status === 'monthly' || status === 'active';
  if (!isVip) return <span className="px-2 py-1 text-xs bg-gray-200 rounded-full">Free</span>;

  return (
    <span className="px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-sm">
      {status === 'yearly' ? '👑 Yearly VIP' : '⭐ PRO Member'}
    </span>
  );
};

// 用户头像徽章组件
const UserProfileBadge = ({ user }: { user: { email: string; avatar_url: string | null; subscription_status: string | null } | null }) => {
  if (!user) return null;

  // 判定会员逻辑 (Yearly/Monthly/Active 都是 VIP)
  const isVip = ['yearly', 'monthly', 'active'].includes(user.subscription_status || '');

  return (
    <div className="flex items-center gap-2">
      {/* 会员徽章 */}
      {isVip && (
        <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-sm">
          {user.subscription_status === 'yearly' ? '👑 Yearly VIP' : '⭐ PRO'}
        </span>
      )}

      {/* 头像区 */}
      <div className="relative w-9 h-9">
        <img
          src={user.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`}
          alt="Avatar"
          className="w-full h-full rounded-full object-cover border-2 border-white shadow-md"
        />
        {/* 在头像右下角加一个小绿点表示在线 */}
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
      </div>
    </div>
  );
};

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
  practiceTickets: number
  isPro: boolean
  subscriptionStatus: string | null
  email: string
  avatarUrl: string | null
  membershipEndDate: string | null
  studyDailyCount: number
  libraryDailyCount: number
}

/**
 * 练习中心内容组件
 * @returns JSX.Element
 */
export default function PracticeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { learningMode, uiLanguage, switchMode } = useLanguage()
  const { user: authUser, isLoading: authLoading } = useAuth()
  const t = TRANSLATIONS[learningMode]

  // 从 localStorage 获取上次选择的考试类型
  const getLastExamType = useCallback(() => {
    return loadFromStorage(STORAGE_KEYS.LAST_EXAM_TYPE, "IELTS")
  }, [])

  // 从 URL 获取当前考试类型，如果没有则从 localStorage 获取，最后使用默认值
  const urlType = searchParams.get("type")
  const currentType = urlType || getLastExamType()
  const currentTrack = EXAM_TO_TRACK[currentType] || "en"

  const [activeTab, setActiveTab] = useState<"home" | "practice" | "library" | "profile" | "study" | "checkin">("practice")
  const [isLoading, setIsLoading] = useState(true)
  const [hasExamData, setHasExamData] = useState(false)

  // 【新增】试卷列表状态
  const [exams, setExams] = useState<any[]>([])
  const [examsLoading, setExamsLoading] = useState(true)

  // 用户统计数据
  const [userStats, setUserStats] = useState<UserStats>({
    skills: DEFAULT_SKILLS[currentTrack],
    currentScore: currentTrack === "en" ? "0.0" : "0",
    targetScore: currentTrack === "en" ? "7.5" : "240",
    streak: 0,
    totalQuestions: 0,
    correctRate: 0,
    inkDrops: 0,
    practiceTickets: 5,
    isPro: false,
    subscriptionStatus: null,
    email: '',
    avatarUrl: null,
    membershipEndDate: null,
    studyDailyCount: 0,
    libraryDailyCount: 0
  })

  // 【修复】数据获取锁和防抖机制
  const isFetchingRef = useRef(false)
  const lastFetchTimeRef = useRef(0)
  const FETCH_DEBOUNCE_MS = 1000 // 1秒内禁止重复请求

  // 【修复】从 mock_exams 表获取试卷列表 - 使用 ref 避免循环依赖
  const fetchExams = useCallback(async (type: string) => {
    setExamsLoading(true)
    console.log('[Dashboard] 开始获取试卷列表，当前分类:', type)
    
    try {
      const { data, error } = await supabase
        .from('mock_exams')
        .select('*')
        .eq('exam_type', type)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[Dashboard] 获取试卷列表失败:', error)
        setExams([])
      } else {
        console.log('[Dashboard] 获取到试卷:', data?.length || 0, '条')
        // 【修复】转换 mock_exams 数据格式以匹配 exams 表格式
        const formattedExams = (data || []).map((exam: any) => ({
          id: exam.id,
          title: `${exam.exam_type} 模拟试卷`,
          description: `包含 ${exam.sections?.length || 0} 个部分的模拟试卷`,
          category: exam.exam_type,
          difficulty: 'medium',
          is_active: true,
          created_at: exam.created_at,
          updated_at: exam.updated_at,
          // 保留原始数据供详情页使用
          sections: exam.sections,
          questions: exam.questions
        }))
        setExams(formattedExams)
        // 如果有试卷数据，设置 hasExamData 为 true
        if (data && data.length > 0) {
          setHasExamData(true)
        }
      }
    } catch (err) {
      console.error('[Dashboard] 获取试卷列表异常:', err)
      setExams([])
    } finally {
      setExamsLoading(false)
    }
  }, []) // 【修复】移除 currentType 依赖，通过参数传入

  // 【修复】组件挂载时获取试卷列表 - 只执行一次
  useEffect(() => {
    let mounted = true
    
    if (mounted) {
      fetchExams(currentType)
    }
    
    return () => {
      mounted = false
    }
  }, []) // 【修复】空依赖数组，只在挂载时执行

  // ============================================
  // 【严格重构】使用 useRef 持久化存储 currentType
  // ============================================
  const currentTypeRef = useRef<string>(currentType);
  
  // 同步 ref 与 state
  useEffect(() => {
    currentTypeRef.current = currentType;
  }, [currentType]);
  
  // ============================================
  // 【修复】fetchUserStats - 依赖注入式数据获取
  // ============================================
  const fetchUserStats = useCallback(async (injectedUser?: any) => {
    // 【关键修复】防抖检查 - 防止短时间内重复请求
    const now = Date.now()
    if (isFetchingRef.current) {
      console.log('[Dashboard] 数据获取进行中，跳过重复请求')
      return
    }
    
    let user = injectedUser;
    
    // 【修复】如果没有传入 user，才查询 Session
    if (!user) {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        console.log('[Dashboard] Session 未就绪，跳过数据拉取');
        return;
      }
      user = session.user;
    }
    
    // 【关键修复】有用户且请求不频繁时才记录时间和执行
    if (now - lastFetchTimeRef.current < FETCH_DEBOUNCE_MS) {
      console.log('[Dashboard] 请求过于频繁，跳过')
      return
    }
    
    isFetchingRef.current = true
    lastFetchTimeRef.current = now
    setIsLoading(true);
    
    const type = currentTypeRef.current || 'IELTS';
    console.log('[Dashboard] ========== 开始拉取数据 ==========');
    console.log('[Dashboard] 当前考试类型:', type);
    
    console.log('[Dashboard] 当前用户:', user?.id);
    
    console.log('[Dashboard] 当前用户:', user?.id);
    
    try {

      // 并行获取：本地存储数据 + 检查试卷数据
      const [localStreak, localInkDrops, examDataResult] = await Promise.all([
        Promise.resolve(loadFromStorage(STORAGE_KEYS.STREAK, 0)),
        Promise.resolve(loadFromStorage(STORAGE_KEYS.INK_DROPS, 0)),
        // 检查是否有试卷数据（支持 questions 或 sections 字段）
        supabase
          .from('mock_exams')
          .select('*')
          .eq('exam_type', type) // 【修复】使用局部变量 type
          .order('created_at', { ascending: false })
      ])
      
      // 判断是否有有效试卷数据（支持 questions 或 sections 字段）
      const isValidExam = (exam: any) => {
        const hasQuestions = exam.questions && exam.questions.length > 0
        const hasSections = exam.sections && 
          (typeof exam.sections === 'string' ? exam.sections.length > 2 : exam.sections.length > 0)
        return hasQuestions || hasSections
      }
      const validExams = (examDataResult.data || []).filter(isValidExam)
      setHasExamData(validExams.length > 0)
      console.log('[Dashboard] 试卷数据检查:', { total: examDataResult.data?.length || 0, valid: validExams.length })

      // 【关键】并行拉取所有数据（强制请求）
      console.log('[Dashboard] 开始并行拉取数据...')
      const [resultsReq, attemptsReq, profileReq] = await Promise.all([
        // exam_results 表（历史数据）
        supabase
          .from('exam_results')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false }),
        // exam_attempts 表（可选 - 新数据存储，如果表不存在则忽略）
        supabase
          .from('exam_attempts')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false }),
        // users 表（用户基础数据）
        supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
      ])

      console.log('[Dashboard] 数据拉取结果:', {
        examResults: { count: resultsReq.data?.length, error: resultsReq.error?.message },
        examAttempts: { count: attemptsReq.data?.length, error: attemptsReq.error?.message },
        profile: { data: profileReq.data ? '有数据' : '无数据', error: profileReq.error?.message }
      })

      if (resultsReq.error) {
        console.error('[Dashboard] exam_results 查询失败:', resultsReq.error.message || resultsReq.error)
      }
      // 【修复】静默处理 exam_attempts 表不存在的错误（PGRST205）
      if (attemptsReq.error && attemptsReq.error.code !== 'PGRST205') {
        console.error('[Dashboard] exam_attempts 查询失败:', attemptsReq.error.message || attemptsReq.error)
      }
      if (profileReq.error) {
        console.error('[Dashboard] users 查询失败:', profileReq.error.message || profileReq.error)
      }

      // 处理 exam_results 数据（历史数据）
      const examResults = resultsReq.data || []
      console.log('[Dashboard] exam_results 数量:', examResults.length)
      
      // 处理 exam_attempts 数据（新数据）
      const examAttempts = attemptsReq.data || []
      console.log('[Dashboard] exam_attempts 数量:', examAttempts.length)
      
      // 计算总题数和正确数（合并 exam_results 和 exam_attempts）
      const totalQuestionsFromExams = examResults.reduce((sum: number, r: any) => sum + (r.total_questions || 0), 0)
      const totalQuestionsFromAttempts = examAttempts.reduce((sum: number, a: any) => sum + (a.p_total_questions || 0), 0)
      const totalCorrectFromExams = examResults.reduce((sum: number, r: any) => sum + (r.correct_count || 0), 0)
      const totalCorrectFromAttempts = examAttempts.reduce((sum: number, a: any) => sum + (a.p_correct_count || 0), 0)
      
      const totalQuestions = totalQuestionsFromExams + totalQuestionsFromAttempts
      const correctAnswers = totalCorrectFromExams + totalCorrectFromAttempts
      const correctRate = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

      console.log('[Dashboard] 统计数据:', { 
        totalQuestionsFromExams, 
        totalQuestionsFromAttempts, 
        totalQuestions, 
        correctAnswers, 
        correctRate 
      })

      // 合并所有完成记录用于计算连续打卡
      const allCompletedDates = [
        ...examResults.map((r: any) => r.completed_at),
        ...examAttempts.map((a: any) => a.completed_at)
      ].filter(Boolean)

      // 【关键】计算连续打卡天数（基于 exam_results 的 completed_at）
      const calculateStreak = (completedDates: string[]): number => {
        if (!completedDates.length) return 0
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        // 获取唯一的日期列表（去重）
        const uniqueDates = [...new Set(completedDates.map(d => {
          const date = new Date(d)
          date.setHours(0, 0, 0, 0)
          return date.getTime()
        }))].sort((a, b) => b - a)
        
        if (uniqueDates.length === 0) return 0
        
        // 检查今天或昨天是否有记录
        const todayTime = today.getTime()
        const yesterdayTime = todayTime - 24 * 60 * 60 * 1000
        
        const hasToday = uniqueDates.includes(todayTime)
        const hasYesterday = uniqueDates.includes(yesterdayTime)
        
        if (!hasToday && !hasYesterday) return 0
        
        // 计算连续天数
        let streak = 1
        let currentDate = hasToday ? todayTime : yesterdayTime
        
        for (let i = 1; i < uniqueDates.length; i++) {
          const expectedDate = currentDate - 24 * 60 * 60 * 1000
          if (uniqueDates.includes(expectedDate)) {
            streak++
            currentDate = expectedDate
          } else {
            break
          }
        }
        
        return streak
      }
      
      const completedDates = allCompletedDates
      const examStreak = calculateStreak(completedDates)
      console.log('[Dashboard] 连续打卡天数:', examStreak)

      // 处理用户数据
      const userData = profileReq.data
      const track = EXAM_TO_TRACK[type] || "en" // 【修复】使用局部变量计算 track
      
      // 【修复】优先使用 users 表的 streak 字段，与个人中心保持一致
      const newStats = {
        skills: DEFAULT_SKILLS[track],
        currentScore: correctRate > 0 ? String(correctRate) : (track === "en" ? "0.0" : "0"),
        targetScore: track === "en" ? "7.5" : "240",
        // 【关键修复】直接使用 users.streak，与个人中心保持一致
        streak: userData?.streak ?? localStreak,
        totalQuestions,
        correctRate,
        inkDrops: userData?.points ?? localInkDrops,
        practiceTickets: userData?.practice_tickets ?? 0,
        isPro: userData?.is_pro ?? false,
        subscriptionStatus: userData?.subscription_type ?? null,
        email: userData?.email || user?.email || '',
        avatarUrl: userData?.avatar || null,
        membershipEndDate: userData?.current_period_end || null,
        // 【新增】今日学习和阅读数据
        studyDailyCount: userData?.study_daily_count ?? 0,
        libraryDailyCount: userData?.library_daily_count ?? 0
      }

      console.log('[Dashboard] 设置用户统计数据:', newStats)
      setUserStats(newStats)

      // 保存到本地存储（异步，不阻塞）
      Promise.resolve().then(() => {
        localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify({
          skills: newStats.skills,
          currentScore: newStats.currentScore,
          totalQuestions,
          correctRate
        }))
      })

    } catch (err) {
      console.error('[Dashboard] 拉取数据失败:', err)
      // 使用默认数据
      const fallbackType = currentTypeRef.current || 'IELTS'
      const fallbackTrack = EXAM_TO_TRACK[fallbackType] || "en"
      setUserStats({
        skills: DEFAULT_SKILLS[fallbackTrack],
        currentScore: fallbackTrack === "en" ? "0.0" : "0",
        targetScore: fallbackTrack === "en" ? "7.5" : "240",
        streak: 0,
        totalQuestions: 0,
        correctRate: 0,
        inkDrops: 0,
        practiceTickets: 0,
        isPro: false,
        subscriptionStatus: null,
        email: '',
        avatarUrl: null,
        membershipEndDate: null,
        studyDailyCount: 0,
        libraryDailyCount: 0
      })
    } finally {
      setIsLoading(false)
      // 【关键修复】释放获取锁
      isFetchingRef.current = false
    }
  }, []) // 【修复】依赖数组为空，使用 ref 获取最新值

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

  // ============================================
  // 【关键修复】使用 ref 存储 fetchUserStats 避免依赖问题
  // ============================================
  const fetchUserStatsRef = useRef(fetchUserStats)
  fetchUserStatsRef.current = fetchUserStats

  // ============================================
  // 【严格重构】Auth 监听 Effect - 空依赖数组避免重复执行
  // ============================================
  useEffect(() => {
    let mounted = true;
    // 【关键修复】使用 ref 获取最新函数，避免依赖变化导致重复执行
    const currentFetchUserStats = fetchUserStatsRef.current

    // 【修复】初始化检查 - 立即获取当前 Session
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        console.log('[Dashboard] 初始化检测到用户，触发数据拉取:', session.user.id);
        // 【关键】显式传递 User 实体
        currentFetchUserStats(session.user);
      }
    };
    initAuth();

    // 【修复】监听状态变化 - 显式传递 session.user
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // 【修复】只在 SIGNED_IN 或 INITIAL_SESSION 且 session 存在时执行
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        if (mounted) {
          console.log('[Dashboard] Auth 就绪，触发数据拉取:', event, 'User:', session.user.id);
          // 【关键】显式传递 User 实体，确保使用最新确认的身份
          currentFetchUserStats(session.user);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // 【关键修复】空依赖数组，只在组件挂载时执行一次

  // ============================================
  // 【移除】定期刷新 Effect - 避免切换标签页时刷新
  // ============================================
  // 注释掉定时刷新，避免页面不必要的刷新
  // useEffect(() => {
  //   let mounted = true;
  //   
  //   const interval = setInterval(() => {
  //     if (mounted) {
  //       fetchUserStatsRef.current();
  //     }
  //   }, 30000);
  //   
  //   return () => {
  //     mounted = false;
  //     clearInterval(interval);
  //   };
  // }, [])

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

  // ============================================
  // 【关键修复】监听认证状态变化，当认证完成且用户存在时触发数据获取
  // ============================================
  useEffect(() => {
    // 当 authLoading 从 true 变为 false，且 authUser 存在时，触发数据获取
    if (!authLoading && authUser) {
      console.log('[Dashboard] 认证状态就绪，用户:', authUser.id)
      // 使用 setTimeout 确保其他 Effect 已经执行完毕
      setTimeout(() => {
        fetchUserStatsRef.current(authUser)
      }, 100)
    }
  }, [authLoading, authUser])

  // 【修复】处理考试类型切换 - 避免 router.push 导致的无限循环
  const handleTypeChange = useCallback((newType: string) => {
    // 如果类型没有变化，不执行任何操作
    if (newType === currentTypeRef.current) {
      console.log('[Practice] 类型未变化，跳过:', newType)
      return
    }
    
    // 保存到 localStorage 以便持久化
    localStorage.setItem(STORAGE_KEYS.LAST_EXAM_TYPE, newType)
    console.log('[Practice] 保存考试类型到 localStorage:', newType)

    // 根据考试类型切换语言模式
    // HSK、BCT、TOCFL 是中文考试 -> LEARN_CHINESE
    // IELTS、TOEFL、CET-4、CET-6 是英文考试 -> LEARN_ENGLISH
    const isChineseExam = ['HSK', 'BCT', 'TOCFL'].includes(newType)
    const newMode = isChineseExam ? 'LEARN_CHINESE' : 'LEARN_ENGLISH'
    
    // 切换语言模式
    switchMode(newMode)
    
    // 【修复】只使用 replaceState 更新 URL，不触发 router.push
    // 这样可以避免页面重新加载导致的循环
    const params = new URLSearchParams(window.location.search)
    params.set("type", newType)
    window.history.replaceState(null, "", `/practice?${params.toString()}`)
    
    // 【修复】手动触发数据刷新，而不是通过 router.push 刷新页面
    currentTypeRef.current = newType
    fetchExams(newType)
    // 【关键修复】使用 ref 调用 fetchUserStats
    fetchUserStatsRef.current()
  }, [switchMode]) // 【修复】移除 router 和 searchParams 依赖

  // 生成功能卡片的链接（带 type 参数）
  const getLinkWithType = (path: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const separator = path.includes('?') ? '&' : '?'
    return params.toString() ? `${path}${separator}${params.toString()}` : path
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
          
          {/* 右侧：合并显示 (统计数据 + 用户信息) */}
          <div className="flex items-center gap-4">
            {/* 1. 统计数据 (稍微缩小一点，给头像腾地方) */}
            <div className="hidden md:flex flex-col items-end border-r pr-4 border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {uiLanguage === 'zh' ? '当前 / 目标' : 'Current / Target'}
              </p>
              <p className="text-lg font-serif font-bold text-[#C23E32]">
                {isLoading ? '-' : userStats.currentScore} <span className="text-gray-300 font-normal">/</span> {userStats.targetScore}
              </p>
            </div>

            {/* 2. 用户信息 (直接嵌入在这里) */}
            {authLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              </div>
            ) : authUser ? (
              <div className="flex items-center gap-3">
                {/* 用户名称和VIP标识 */}
                <div className="flex flex-col items-end hidden sm:flex">
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-bold text-gray-800 text-sm">
                      {authUser.name || 'Scholar'}
                    </span>
                    {/* VIP 标识 */}
                    {['yearly', 'monthly', 'active', 'pro'].includes(authUser.subscription_status || '') && (
                      <span className="bg-yellow-400 text-white text-[10px] px-1.5 py-0.5 rounded-sm shadow-sm">
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400">ID: {authUser.id.slice(0, 6)}</div>
                </div>

                {/* 头像 */}
                <img
                  src={authUser.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${authUser.id}`}
                  alt={authUser.name || 'User'}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
                />
              </div>
            ) : (
              <span className="text-sm text-gray-500">未登录</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* 统计卡片行 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
              icon={BookOpen} 
              value={isLoading ? '-' : userStats.studyDailyCount} 
              label={uiLanguage === 'zh' ? '今日学习' : 'Today Study'}
              color="purple"
            />
            <StatCard 
              icon={Calendar} 
              value={isLoading ? '-' : userStats.libraryDailyCount} 
              label={uiLanguage === 'zh' ? '今日阅读' : 'Today Read'}
              color="blue"
            />
            {/* VIP 状态栏 - 使用 useAuth 数据（更可靠） */}
            <div className={`rounded-xl p-4 border shadow-sm ${
              authLoading 
                ? 'bg-gray-50 border-gray-200'
                : (authUser?.subscription_status && ['yearly', 'monthly', 'active', 'pro'].includes(authUser.subscription_status.toLowerCase()))
                  ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
                  : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  authLoading
                    ? 'bg-gray-200 text-gray-500'
                    : (authUser?.subscription_status && ['yearly', 'monthly', 'active', 'pro'].includes(authUser.subscription_status.toLowerCase()))
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  <span className="text-xl">
                    {authLoading 
                      ? '📅' 
                      : (authUser?.subscription_status && ['yearly', 'monthly', 'active', 'pro'].includes(authUser.subscription_status.toLowerCase()))
                        ? '👑'
                        : '📅'
                    }
                  </span>
                </div>
                <div>
                  <p className={`text-lg font-bold ${
                    authLoading
                      ? 'text-gray-600'
                      : (authUser?.subscription_status && ['yearly', 'monthly', 'active', 'pro'].includes(authUser.subscription_status.toLowerCase()))
                        ? 'text-amber-700'
                        : 'text-gray-600'
                  }`}>
                    {authLoading 
                      ? '-' 
                      : (authUser?.subscription_status && ['yearly', 'monthly', 'active', 'pro'].includes(authUser.subscription_status.toLowerCase()) && authUser?.current_period_end)
                        ? `Valid until: ${new Date(authUser.current_period_end).toISOString().split('T')[0]}`
                        : 'Free Plan'
                    }
                  </p>
                  <p className={`text-xs ${
                    authLoading
                      ? 'text-gray-400'
                      : (authUser?.subscription_status && ['yearly', 'monthly', 'active', 'pro'].includes(authUser.subscription_status.toLowerCase()))
                        ? 'text-amber-600'
                        : 'text-gray-400'
                  }`}>
                    {uiLanguage === 'zh' ? '会员状态' : 'Membership Status'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 数据加载提示 */}
          {isLoading && (
            <div className="text-center py-2 text-sm text-gray-500">
              {uiLanguage === 'zh' ? '正在加载您的学习数据...' : 'Loading your learning data...'}
            </div>
          )}
          
          {/* 无数据提示 - 使用水墨风格空状态组件 */}
          {!isLoading && !hasExamData && (
            <EmptyState
              type="no-data"
              examType={currentType}
              uiLanguage={uiLanguage}
              onRefresh={() => {
                // 刷新数据
                fetchUserStats()
              }}
              onSwitchType={() => {
                // 滚动到考试类型选择器或打开下拉菜单
                const typeSelector = document.querySelector('[data-exam-type-selector]')
                if (typeSelector) {
                  typeSelector.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  // 可以尝试触发点击事件打开下拉菜单
                  const dropdownTrigger = typeSelector.querySelector('button')
                  dropdownTrigger?.click()
                }
              }}
            />
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

            {/* 右侧：功能入口 + 试卷列表 */}
            <div className="lg:col-span-7 space-y-6">
              {/* 主要功能：智能刷题 */}
              <FeatureCard
                href={getLinkWithType("/practice/drill?mode=practice")}
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
                  href={getLinkWithType("/practice/drill?mode=exam")}
                  icon={PenTool}
                  title={uiLanguage === 'zh' ? '全真模考' : 'Mock Exam'}
                  subtitle={uiLanguage === 'zh' ? 'Simulation' : 'Simulation'}
                  description={uiLanguage === 'zh'
                    ? '模拟真实考试环境，检验备考成果'
                    : 'Full-length practice tests under exam conditions'
                  }
                  locked={false}
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

              {/* 【新增】试卷列表 */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {uiLanguage === 'zh' ? '试卷列表' : 'Exam Papers'}
                  </h3>
                  {examsLoading && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>

                {examsLoading ? (
                  // 加载中骨架屏
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/90 rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
                          <div className="flex-1">
                            <div className="w-32 h-4 rounded bg-gray-200 animate-pulse mb-2" />
                            <div className="w-24 h-3 rounded bg-gray-200 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : exams.length === 0 ? (
                  // 空状态
                  <div className="bg-white/90 rounded-xl p-8 border border-gray-200 shadow-sm text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-gray-600 font-medium mb-2">
                      {uiLanguage === 'zh' ? '暂无试卷' : 'No Exams Available'}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {uiLanguage === 'zh' 
                        ? '该分类下暂时没有试卷，请尝试切换其他分类' 
                        : 'No exams available for this category'}
                    </p>
                  </div>
                ) : (
                  // 试卷列表
                  <div className="space-y-3">
                    {exams.map((exam) => (
                      <Link
                        key={exam.id}
                        href={`/practice/drill/${exam.id}`}
                        className="block bg-white/90 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md hover:border-[#C23E32]/30 transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          {/* 图标 */}
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C23E32]/10 to-[#C23E32]/5 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-[#C23E32]" />
                          </div>
                          
                          {/* 内容 */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 group-hover:text-[#C23E32] transition-colors truncate">
                              {translateExamTitle(exam.title, uiLanguage === 'zh')}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {translateExamDescription(exam.description, uiLanguage === 'zh')}
                            </p>
                            
                            {/* 标签 */}
                            <div className="flex items-center gap-2 mt-3">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {uiLanguage === 'zh' 
                                  ? (EXAM_TYPE_LABELS[exam.category] || exam.category)
                                  : exam.category
                                }
                              </span>
                              {exam.difficulty && (
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  exam.difficulty === 'easy' 
                                    ? 'bg-green-100 text-green-600'
                                    : exam.difficulty === 'medium'
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-red-100 text-red-600'
                                }`}>
                                  {exam.difficulty === 'easy' 
                                    ? (uiLanguage === 'zh' ? '简单' : 'Easy')
                                    : exam.difficulty === 'medium'
                                    ? (uiLanguage === 'zh' ? '中等' : 'Medium')
                                    : (uiLanguage === 'zh' ? '困难' : 'Hard')
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* 箭头 */}
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#C23E32] group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
