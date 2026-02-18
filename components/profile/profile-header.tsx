"use client"

import { Crown } from "lucide-react"
import { useLanguage } from "@/lib/contexts/language-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { NativeLang } from "@/lib/language-utils"
import { useEffect, useState, useRef } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

interface StatItem {
  label: string
  value: number | string
  unit?: string
}

interface ProfileHeaderProps {
  nativeLang?: NativeLang
}

/**
 * 个人资料头部组件
 *
 * 功能：
 * - 显示用户头像
 * - 显示用户名和ID
 * - 显示学习统计数据（从数据库获取真实数据）
 * - VIP 用户显示皇冠标识
 *
 * 注意：LEARN_ENGLISH = 中文界面（学英语的中文用户）
 *       LEARN_CHINESE = 英文界面（学中文的英文用户）
 */
export function ProfileHeader({ nativeLang = "zh" }: ProfileHeaderProps) {
  const { user, isVip } = useAuth()
  const { learningMode } = useLanguage()
  const [wordsLearned, setWordsLearned] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // 【修复】使用 ref 存储 supabase 客户端，避免重复创建
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null)
  
  // 初始化 supabase 客户端（只执行一次）
  if (!supabaseRef.current) {
    supabaseRef.current = createBrowserClient()
  }

  const t = TRANSLATIONS[learningMode]

  // 获取用户真实统计数据
  useEffect(() => {
    // 【修复】添加标志位防止重复请求
    let isMounted = true
    
    const fetchUserStats = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const supabase = supabaseRef.current!
        
        // 获取已学单词数
        const { count: wordsCount, error: wordsError } = await supabase
          .from('user_activities')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('action_type', 'learn_word')

        if (isMounted && !wordsError) {
          setWordsLearned(wordsCount || 0)
        }

        // 获取考试记录计算准确率
        const { data: examData, error: examError } = await supabase
          .from('user_activities')
          .select('details')
          .eq('user_id', user.id)
          .eq('action_type', 'take_exam')

        if (isMounted && !examError && examData && examData.length > 0) {
          const totalScore = examData.reduce((sum, record) => {
            return sum + (record.details?.score || 0)
          }, 0)
          const avgAccuracy = Math.round(totalScore / examData.length)
          setAccuracy(avgAccuracy)
        } else if (isMounted) {
          setAccuracy(0)
        }
      } catch (error) {
        console.error('获取用户统计数据失败:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchUserStats()
    
    // 【修复】清理函数
    return () => {
      isMounted = false
    }
  // 【修复】移除 supabase 从依赖数组，只监听 user?.id
  }, [user?.id])

  // 判断是否为中文界面 - 【修复】移到 stats 数组之前，避免暂时性死区错误
  const isChineseUI = learningMode === "LEARN_ENGLISH"

  // 【修复】提供安全的翻译默认值
  const getTranslation = (key: string, defaultValue: string) => {
    try {
      const keys = key.split('.');
      let value: any = t;
      for (const k of keys) {
        value = value?.[k];
      }
      return value || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const stats: StatItem[] = [
    { 
      label: getTranslation('profile.stats.wordsLearned', isChineseUI ? '已学单词' : 'Words Learned'), 
      value: wordsLearned 
    },
    { 
      label: getTranslation('profile.stats.studyDays', isChineseUI ? '学习天数' : 'Study Days'), 
      value: user?.streak || 0 
    },
    { 
      label: getTranslation('profile.stats.accuracy', isChineseUI ? '准确率' : 'Accuracy'), 
      value: accuracy > 0 ? `${accuracy}%` : "--", 
      unit: "" 
    }
  ]

  return (
    <header className="pt-12 pb-6 px-4">
      <div className="flex flex-col items-center">
        {/* 头像 */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-[#FDFBF7] border-2 border-ink-vermilion/60 shadow-lg overflow-hidden">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={t.profile?.avatarAlt || "User Avatar"} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F5F2EC] to-[#E8E4DC]">
                <span className="text-3xl font-serif text-ink-black">
                  {user?.name ? user.name.charAt(0) : '墨'}
                </span>
              </div>
            )}
          </div>
          
          {/* VIP 皇冠标识 */}
          {isVip && (
            <div 
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: '#D4AF37' }}
              title={isChineseUI ? "墨语会员" : "InkWords Premium"}
            >
              <Crown className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
          )}
          
          {/* 头像边缘装饰 - 微妙的金色光晕 */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: isVip 
                ? '0 0 0 2px rgba(212, 175, 55, 0.6), 0 0 16px rgba(212, 175, 55, 0.3)'
                : '0 0 0 1px rgba(212, 175, 55, 0.3), 0 0 12px rgba(212, 175, 55, 0.15)'
            }}
            aria-hidden="true"
          />
        </div>
        
        {/* 用户名/ID */}
        <div className="flex items-center gap-2 mt-4">
          <h1 className="text-xl font-serif font-medium text-ink-black">
            {user?.name || t.profile?.defaultNickname || "InkWords User"}
          </h1>
          {isVip && (
            <span 
              className="px-2 py-0.5 text-xs font-medium rounded-full"
              style={{ 
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                color: '#B8941F'
              }}
            >
              {isChineseUI ? "会员" : "VIP"}
            </span>
          )}
        </div>
        
        <p className="mt-1 text-sm text-ink-gray font-sans">
          {t.profile?.idLabel || "ID"}: {user?.id || "INK20240001"}
        </p>
        
        {/* 数据概览 */}
        <div className="mt-6 w-full max-w-xs">
          <div className="flex items-center justify-between">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="flex flex-col items-center relative"
              >
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-serif font-semibold text-ink-black">
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span className="text-sm text-ink-gray font-serif">
                      {stat.unit}
                    </span>
                  )}
                </div>
                <span className="mt-1 text-xs text-ink-gray font-serif">
                  {stat.label}
                </span>
                
                {/* 分隔符 - 最后一项不显示 */}
                {index < stats.length - 1 && (
                  <div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-ink-gray/20"
                    style={{ right: '-50%' }}
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
