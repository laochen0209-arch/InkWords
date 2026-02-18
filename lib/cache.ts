/**
 * @file cache.ts
 * @description 简单的内存缓存工具，用于优化性能
 * @author InkWords Team
 * @date 2026-02-14
 */

interface CacheItem<T> {
  value: T
  expireTime: number
}

class SimpleCache {
  private cache: Map<string, CacheItem<any>> = new Map()
  private defaultTTL: number = 60000 // 默认 60 秒

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（毫秒）
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expireTime = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { value, expireTime })
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值，如果不存在或已过期则返回 null
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) {
      return null
    }
    if (Date.now() > item.expireTime) {
      this.cache.delete(key)
      return null
    }
    return item.value
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 检查缓存是否存在且有效
   * @param key 缓存键
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * 获取或设置缓存的便捷方法
   * @param key 缓存键
   * @param factory 生成值的工厂函数
   * @param ttl 过期时间（毫秒）
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }
    const value = await factory()
    this.set(key, value, ttl)
    return value
  }
}

// 导出单例实例
export const cache = new SimpleCache()
