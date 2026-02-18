/**
 * @file use-dashboard-data.ts
 * @description 用户数据中心数据获取 Hook - 从数据库读取真实数据
 * @author InkWords Team
 * @date 2026-02-04
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

/**
 * 用户活动记录接口
 */
export interface UserActivity {
  id: string
  user_id: string
  action_type: 'read_article' | 'take_exam' | 'learn_word'
  target_id: string | null
  details: Record<string, any>
  created_at: string
}

/**
 * 统计数据接口
 */
export interface DashboardStats {
  totalStudyDays: number
  totalArticlesRead: number
  totalExamsTaken: number
  totalWordsMastered: number
}

/**
 * 热力图数据接口
 */
export interface HeatmapData {
  date: string
  count: number
}

/**
 * 雷达图数据接口
 */
export interface RadarData {
  subject: string
  score: number
  fullMark: number
}

/**
 * 使用用户数据中心数据的 Hook
 * @returns 统计数据、活动记录、加载状态等
 */
export function useDashboardData() {
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalStudyDays: 0,
    totalArticlesRead: 0,
    totalExamsTaken: 0,
    totalWordsMastered: 0,
  })
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [radarData, setRadarData] = useState<RadarData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // 使用 ref 防止重复获取数据
  const dataFetchedRef = useRef(false)

  const supabase = createBrowserClient()

  /**
   * 获取仪表板数据
   */
  const fetchDashboardData = useCallback(async (user: any) => {
    try {
      setLoading(true)
      setError(null)

      // 从 users 表获取用户统计数据
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('study_daily_count, library_daily_count, practice_tickets, last_reset_date, created_at')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.warn('获取用户数据失败:', userError)
      }

      // 获取用户活动记录
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (activitiesError) {
        console.warn('获取活动记录失败:', activitiesError)
      }

      const activitiesList = activitiesData || []
      setActivities(activitiesList)

      // 计算统计数据
      calculateStats(activitiesList, userData)

      // 生成热力图数据
      generateHeatmapData(activitiesList)

      // 生成雷达图数据
      generateRadarData(activitiesList)
    } catch (err: any) {
      // 忽略请求取消错误
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        console.log('[Dashboard] 请求被取消')
        return
      }
      console.error('获取用户活动数据失败:', err)
      setError('获取数据失败，请稍后重试')
    } finally {
      setLoading(false)
      setIsInitialized(true)
    }
  }, [supabase])

  /**
   * 初始化数据获取 - 使用监听模式
   */
  useEffect(() => {
    let mounted = true
    let authSubscription: { unsubscribe: () => void } | null = null

    const initData = async () => {
      // 1. 先获取 session，给它一点时间
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // 如果没拿到，不要急着报错，监听状态变化
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            if (session && mounted && !dataFetchedRef.current) {
              // 只有真的拿到 session 了，才去 fetch 数据
              dataFetchedRef.current = true
              fetchDashboardData(session.user)
            }
          }
        )
        authSubscription = subscription
        // 设置一个超时，如果 10 秒后还没拿到 session，显示错误
        setTimeout(() => {
          if (mounted && !dataFetchedRef.current) {
            setError('用户未登录')
            setLoading(false)
            setIsInitialized(true)
          }
        }, 10000)
      } else {
        // 如果直接拿到了，就正常加载
        if (!dataFetchedRef.current) {
          dataFetchedRef.current = true
          fetchDashboardData(session.user)
        }
      }
    }

    initData()

    return () => {
      mounted = false
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [fetchDashboardData, supabase.auth])

  /**
   * 计算统计数据
   */
  const calculateStats = (activitiesData: UserActivity[], userData: any) => {
    // 累计学习天数：统计有活动记录的不同日期数
    const uniqueDays = new Set(
      activitiesData.map((a) => a.created_at.split('T')[0])
    )
    const totalStudyDays = uniqueDays.size

    // 已读文章数
    const totalArticlesRead = activitiesData.filter(
      (a) => a.action_type === 'read_article'
    ).length

    // 累计考试次数
    const totalExamsTaken = activitiesData.filter(
      (a) => a.action_type === 'take_exam'
    ).length

    // 掌握单词量
    const totalWordsMastered = activitiesData.filter(
      (a) => a.action_type === 'learn_word'
    ).length

    setStats({
      totalStudyDays,
      totalArticlesRead,
      totalExamsTaken,
      totalWordsMastered,
    })
  }

  /**
   * 生成热力图数据（过去30天）
   */
  const generateHeatmapData = (activitiesData: UserActivity[]) => {
    const today = new Date()
    const heatmap: HeatmapData[] = []

    // 生成过去30天的日期
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      // 统计当天的活动数量
      const count = activitiesData.filter((a) =>
        a.created_at.startsWith(dateStr)
      ).length

      heatmap.push({
        date: dateStr,
        count,
      })
    }

    setHeatmapData(heatmap)
  }

  /**
   * 生成雷达图数据
   */
  const generateRadarData = (activitiesData: UserActivity[]) => {
    // 获取考试记录
    const examActivities = activitiesData.filter(
      (a) => a.action_type === 'take_exam'
    )

    if (examActivities.length === 0) {
      // 没有考试记录时显示默认值
      setRadarData([
        { subject: '听力', score: 0, fullMark: 100 },
        { subject: '阅读', score: 0, fullMark: 100 },
        { subject: '词汇', score: 0, fullMark: 100 },
      ])
      return
    }

    // 按考试类型分组计算平均分
    const examTypes = ['listening', 'reading', 'vocabulary']
    const radar: RadarData[] = []

    examTypes.forEach((type) => {
      const typeExams = examActivities.filter((a) => {
        const details = a.details || {}
        // 根据考试类型或section类型判断
        return (
          details.exam_type?.toLowerCase().includes(type) ||
          details.section_type === type
        )
      })

      let score = 0
      if (typeExams.length > 0) {
        const totalScore = typeExams.reduce((sum, a) => {
          return sum + (a.details?.score || 0)
        }, 0)
        score = Math.round(totalScore / typeExams.length)
      }

      const subjectMap: Record<string, string> = {
        listening: '听力',
        reading: '阅读',
        vocabulary: '词汇',
      }

      radar.push({
        subject: subjectMap[type],
        score,
        fullMark: 100,
      })
    })

    setRadarData(radar)
  }

  /**
   * 获取最近的活动记录
   * @param limit 数量限制
   */
  const getRecentActivities = (limit: number = 10): UserActivity[] => {
    return activities.slice(0, limit)
  }

  /**
   * 刷新数据
   */
  const refresh = useCallback(() => {
    dataFetchedRef.current = false
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        dataFetchedRef.current = true
        fetchDashboardData(session.user)
      }
    }
    initData()
  }, [fetchDashboardData, supabase.auth])

  return {
    activities,
    stats,
    heatmapData,
    radarData,
    loading,
    error,
    isInitialized,
    getRecentActivities,
    refresh,
  }
}

/**
 * 格式化相对时间
 * @param dateString ISO 格式日期字符串
 * @returns 相对时间描述
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return '刚刚'
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 30) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

/**
 * 获取活动描述
 * @param activity 活动记录
 * @returns 格式化的活动描述
 */
export function getActivityDescription(activity: UserActivity): string {
  const { action_type, details } = activity

  switch (action_type) {
    case 'read_article':
      return `阅读了文章「${details?.title || '未知文章'}」`
    case 'take_exam':
      return `完成了${details?.exam_type || ''}练习，得分 ${details?.score || 0}`
    case 'learn_word':
      return `掌握了单词「${details?.word || '未知单词'}」`
    default:
      return '进行了学习活动'
  }
}

/**
 * 获取活动图标类型
 * @param actionType 活动类型
 * @returns 图标名称
 */
export function getActivityIcon(actionType: string): string {
  switch (actionType) {
    case 'read_article':
      return 'BookOpen'
    case 'take_exam':
      return 'FileText'
    case 'learn_word':
      return 'Type'
    default:
      return 'Activity'
  }
}
