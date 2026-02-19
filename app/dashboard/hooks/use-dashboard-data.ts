/**
 * @file use-dashboard-data.ts
 * @description 用户数据中心数据获取 Hook - 从数据库读取真实数据
 * @author InkWords Team
 * @date 2026-02-04
 */

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useDataRefresh } from '@/lib/contexts/data-refresh-context'
import { useAuth } from '@/lib/contexts/auth-context'

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
 * 支持实时刷新，配合 useDataRefresh 使用
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

  const supabase = createBrowserClient()
  const { refreshTrigger } = useDataRefresh()
  const { user, isAuthenticated } = useAuth()

  /**
   * 获取仪表板数据
   * 从数据库获取最新的用户学习数据和活动记录
   */
  const fetchDashboardData = useCallback(async (currentUser: any) => {
    try {
      console.log('[useDashboardData] 开始获取数据...')
      setLoading(true)
      setError(null)

      // 从 users 表获取用户统计数据
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('study_daily_count, library_daily_count, practice_tickets, last_reset_date, created_at')
        .eq('id', currentUser.id)
        .single()

      if (userError) {
        console.warn('[useDashboardData] 获取用户数据失败:', userError)
      }

      // 获取用户活动记录（最多 100 条）
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (activitiesError) {
        console.warn('[useDashboardData] 获取活动记录失败:', activitiesError)
      }

      const activitiesList = activitiesData || []
      console.log('[useDashboardData] 获取到', activitiesList.length, '条活动记录')
      setActivities(activitiesList)

      // 计算统计数据
      calculateStats(activitiesList, userData)

      // 生成热力图数据
      generateHeatmapData(activitiesList)

      // 生成雷达图数据
      generateRadarData(activitiesList)

      console.log('[useDashboardData] 数据获取完成')
    } catch (err: any) {
      // 忽略请求取消错误
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        console.log('[useDashboardData] 请求被取消')
        return
      }
      console.error('[useDashboardData] 获取用户活动数据失败:', err)
      setError('获取数据失败，请稍后重试')
    } finally {
      setLoading(false)
      setIsInitialized(true)
    }
  }, [supabase])

  /**
   * 监听数据刷新事件和用户登录状态
   * 当 refreshTrigger 变化或用户登录状态改变时，自动刷新数据
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('[useDashboardData] 检测到用户已登录或数据刷新事件，开始获取数据')
      fetchDashboardData(user)
    } else if (!isAuthenticated && isInitialized) {
      // 如果用户已登出，清空数据
      setActivities([])
      setStats({
        totalStudyDays: 0,
        totalArticlesRead: 0,
        totalExamsTaken: 0,
        totalWordsMastered: 0,
      })
      setHeatmapData([])
      setRadarData([])
    }
  }, [isAuthenticated, user, refreshTrigger, fetchDashboardData, isInitialized])

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
   * 可以被外部组件主动调用，用于手动刷新
   */
  const refresh = useCallback(() => {
    console.log('[useDashboardData] 手动刷新数据...')
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
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
