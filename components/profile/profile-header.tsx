"use client"

import { Crown } from "lucide-react"
import { useLanguage } from "@/lib/contexts/language-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { useDataRefresh } from "@/lib/contexts/data-refresh-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { NativeLang } from "@/lib/language-utils"
import { useEffect, useState, useCallback } from "react"

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
 * - 显示学习统计数据（通过 API 获取真实数据）
 * - VIP 用户显示皇冠标识
 * - 支持实时数据刷新
 *
 * @version 2.0.0 - 重构为 API 调用模式，绕过 GFW 阻断
 */
export function ProfileHeader({ nativeLang = "zh" }: ProfileHeaderProps) {
  const { user, isVip, refreshUserStats } = useAuth()
  const { learningMode } = useLanguage()
  const { refreshTrigger } = useDataRefresh()
  const [wordsLearned, setWordsLearned] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const [loading, setLoading] = useState(true)

  const t = TRANSLATIONS[learningMode]

  /**
   * 获取用户真实统计数据的函数
   * 通过 API 路由获取数据
   */
  const fetchUserStats = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/user/activities?action_type=learn_word&limit=1000')

      if (!response.ok) {
        console.error('[ProfileHeader] API 请求失败')
        return
      }

      const data = await response.json()

      if (data.success) {
        setWordsLearned(data.count || 0)
      }

      const examResponse = await fetch('/api/user/activities?action_type=take_exam&limit=100')

      if (examResponse.ok) {
        const examData = await examResponse.json()

        if (examData.success && examData.data && examData.data.length > 0) {
          const totalScore = examData.data.reduce((sum: number, record: any) => {
            return sum + (record.details?.score || 0)
          }, 0)
          const avgAccuracy = Math.round(totalScore / examData.data.length)
          setAccuracy(avgAccuracy)
        } else {
          setAccuracy(0)
        }
      }
    } catch (error) {
      console.error('[ProfileHeader] 获取用户统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    let isMounted = true

    const fetchStats = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const response = await fetch('/api/user/activities?action_type=learn_word&limit=1000')

        if (!response.ok) {
          console.error('[ProfileHeader] API 请求失败')
          return
        }

        const data = await response.json()

        if (isMounted && data.success) {
          setWordsLearned(data.count || 0)
        }

        const examResponse = await fetch('/api/user/activities?action_type=take_exam&limit=100')

        if (isMounted && examResponse.ok) {
          const examData = await examResponse.json()

          if (examData.success && examData.data && examData.data.length > 0) {
            const totalScore = examData.data.reduce((sum: number, record: any) => {
              return sum + (record.details?.score || 0)
            }, 0)
            const avgAccuracy = Math.round(totalScore / examData.data.length)
            setAccuracy(avgAccuracy)
          } else {
            setAccuracy(0)
          }
        }
      } catch (error) {
        console.error('[ProfileHeader] 获取用户统计数据失败:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchStats()

    return () => {
      isMounted = false
    }
  }, [user?.id])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id) {
        fetchUserStats()
        refreshUserStats()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user?.id, fetchUserStats, refreshUserStats])

  useEffect(() => {
    if (user?.id && refreshTrigger > 0) {
      console.log('[ProfileHeader] 检测到数据刷新事件，正在更新统计数据...')
      fetchUserStats()
      refreshUserStats()
    }
  }, [refreshTrigger, user?.id, fetchUserStats, refreshUserStats])

  const isChineseUI = learningMode === "LEARN_ENGLISH"

  const getTranslation = (key: string, defaultValue: string) => {
    try {
      const keys = key.split('.')
      let value: any = t
      for (const k of keys) {
        value = value?.[k]
      }
      return value || defaultValue
    } catch {
      return defaultValue
    }
  }

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

          {isVip && (
            <div
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: '#D4AF37' }}
              title={isChineseUI ? "墨语会员" : "InkWords Premium"}
            >
              <Crown className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
          )}

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
