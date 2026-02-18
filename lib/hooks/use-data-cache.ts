/**
 * @file use-data-cache.ts
 * @description 数据缓存 Hook - 减少重复请求
 * @author InkWords Team
 */

import { useState, useEffect, useCallback, useRef } from 'react'

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresIn: number
}

// 全局缓存存储
const globalCache = new Map<string, CacheItem<any>>()

interface UseDataCacheOptions<T> {
  key: string
  fetcher: () => Promise<T>
  expiresIn?: number // 缓存过期时间（毫秒），默认 5 分钟
  enabled?: boolean // 是否启用请求
}

export function useDataCache<T>({
  key,
  fetcher,
  expiresIn = 5 * 60 * 1000, // 默认 5 分钟
  enabled = true
}: UseDataCacheOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMounted = useRef(true)

  const fetchData = useCallback(async (forceRefresh = false) => {
    // 检查缓存
    if (!forceRefresh) {
      const cached = globalCache.get(key)
      if (cached && Date.now() - cached.timestamp < cached.expiresIn) {
        setData(cached.data)
        return
      }
    }

    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      
      if (isMounted.current) {
        setData(result)
        // 更新缓存
        globalCache.set(key, {
          data: result,
          timestamp: Date.now(),
          expiresIn
        })
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || '获取数据失败')
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [key, fetcher, expiresIn, enabled])

  useEffect(() => {
    isMounted.current = true
    fetchData()
    
    return () => {
      isMounted.current = false
    }
  }, [fetchData])

  const refresh = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  const clearCache = useCallback(() => {
    globalCache.delete(key)
  }, [key])

  return {
    data,
    loading,
    error,
    refresh,
    clearCache
  }
}

// 清除所有缓存
export function clearAllCache() {
  globalCache.clear()
}
