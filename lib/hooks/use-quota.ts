/**
 * @file use-quota.ts
 * @description 用户配额管理 Hook - 用于检查和消耗用户配额
 * @author InkWords Team
 * @date 2026-02-20
 *
 * 功能说明：
 * - 检查用户配额状态
 * - 消耗配额
 * - 显示升级弹窗
 * - VIP 用户自动放行
 */

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'

/**
 * 配额类型
 */
export type QuotaType = 'study' | 'library' | 'practice'

/**
 * 配额检查结果
 */
export interface QuotaResult {
  allowed: boolean
  error?: string
  code?: string
  remaining?: number
  isVip?: boolean
}

/**
 * 配额状态
 */
export interface QuotaStatus {
  study: {
    used: number
    limit: number
    remaining: number
  }
  library: {
    used: number
    limit: number
    remaining: number
  }
  practice: {
    tickets: number
    limit: number
  }
  isVip: boolean
}

/**
 * API 响应接口
 */
interface QuotaApiResponse {
  success: boolean
  quota?: QuotaStatus
  result?: QuotaResult
  error?: string
  message?: string
}

/**
 * 使用配额 Hook
 *
 * @returns 配额检查和消耗函数
 *
 * @example
 * const { checkQuota, consumeQuota, quotaStatus, showUpgrade, setShowUpgrade } = useQuota()
 *
 * // 检查配额
 * const result = await checkQuota('study')
 * if (!result.allowed) {
 *   setShowUpgrade(true)
 *   return
 * }
 *
 * // 消耗配额
 * await consumeQuota('study')
 */
export function useQuota() {
  const { isVip } = useAuth()
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState('')

  /**
   * 获取配额状态
   */
  const fetchQuotaStatus = useCallback(async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/user/quota')

      if (!response.ok) {
        console.error('[useQuota] 获取配额状态失败')
        return null
      }

      const data: QuotaApiResponse = await response.json()

      if (data.success && data.quota) {
        setQuotaStatus(data.quota)
        return data.quota
      }

      return null
    } catch (error) {
      console.error('[useQuota] 获取配额状态异常:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 检查配额
   * @param type - 配额类型
   * @returns 检查结果
   */
  const checkQuota = useCallback(async (type: QuotaType): Promise<QuotaResult> => {
    if (isVip) {
      return {
        allowed: true,
        isVip: true,
        remaining: -1
      }
    }

    try {
      setLoading(true)

      const response = await fetch('/api/user/quota', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          action: 'check'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          allowed: false,
          error: errorData.message || '配额检查失败',
          code: 'CHECK_FAILED'
        }
      }

      const data: QuotaApiResponse = await response.json()

      if (data.success && data.result) {
        if (!data.result.allowed) {
          setUpgradeMessage(data.result.error || '已达上限，请升级会员')
        }
        return data.result
      }

      return {
        allowed: false,
        error: '配额检查失败',
        code: 'UNKNOWN_ERROR'
      }
    } catch (error) {
      console.error('[useQuota] 检查配额异常:', error)
      return {
        allowed: false,
        error: '网络错误，请稍后重试',
        code: 'NETWORK_ERROR'
      }
    } finally {
      setLoading(false)
    }
  }, [isVip])

  /**
   * 消耗配额
   * @param type - 配额类型
   * @returns 消耗结果
   */
  const consumeQuota = useCallback(async (type: QuotaType): Promise<QuotaResult> => {
    if (isVip) {
      return {
        allowed: true,
        isVip: true,
        remaining: -1
      }
    }

    try {
      setLoading(true)

      const response = await fetch('/api/user/quota', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          action: 'consume'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          allowed: false,
          error: errorData.message || '配额消耗失败',
          code: 'CONSUME_FAILED'
        }
      }

      const data: QuotaApiResponse = await response.json()

      if (data.success && data.result) {
        if (!data.result.allowed) {
          setUpgradeMessage(data.result.error || '已达上限，请升级会员')
          setShowUpgrade(true)
        }
        return data.result
      }

      return {
        allowed: false,
        error: '配额消耗失败',
        code: 'UNKNOWN_ERROR'
      }
    } catch (error) {
      console.error('[useQuota] 消耗配额异常:', error)
      return {
        allowed: false,
        error: '网络错误，请稍后重试',
        code: 'NETWORK_ERROR'
      }
    } finally {
      setLoading(false)
    }
  }, [isVip])

  /**
   * 检查并消耗配额（原子操作）
   * @param type - 配额类型
   * @returns 是否允许操作
   */
  const checkAndConsume = useCallback(async (type: QuotaType): Promise<boolean> => {
    const result = await consumeQuota(type)

    if (!result.allowed) {
      setShowUpgrade(true)
      return false
    }

    return true
  }, [consumeQuota])

  /**
   * 显示升级提示
   * @param message - 自定义消息
   */
  const showUpgradeModal = useCallback((message?: string) => {
    if (message) {
      setUpgradeMessage(message)
    }
    setShowUpgrade(true)
  }, [])

  /**
   * 隐藏升级提示
   */
  const hideUpgradeModal = useCallback(() => {
    setShowUpgrade(false)
    setUpgradeMessage('')
  }, [])

  return {
    quotaStatus,
    loading,
    showUpgrade,
    upgradeMessage,
    fetchQuotaStatus,
    checkQuota,
    consumeQuota,
    checkAndConsume,
    showUpgradeModal,
    hideUpgradeModal,
    setShowUpgrade
  }
}
