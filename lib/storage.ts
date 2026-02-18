/**
 * @file storage.ts
 * @description 统一的存储工具
 * @author InkWords Team
 * @date 2026-02-15
 *
 * 功能：
 * - 封装 localStorage 和 sessionStorage
 * - 处理 SSR 兼容性（服务器端返回默认值）
 * - 处理隐私模式（无痕模式）异常
 * - 支持 JSON 序列化/反序列化
 * - 添加错误处理和日志
 */

import { logger } from './logger'

/**
 * 存储类型
 */
type StorageType = 'local' | 'session'

/**
 * 获取存储对象
 */
function getStorage(type: StorageType): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  try {
    const storage = type === 'local' ? window.localStorage : window.sessionStorage
    // 测试存储是否可用（隐私模式会抛出异常）
    const testKey = '__storage_test__'
    storage.setItem(testKey, 'test')
    storage.removeItem(testKey)
    return storage
  } catch (error) {
    logger.warn(`Storage ${type} is not available:`, error)
    return null
  }
}

/**
 * 统一的存储工具
 */
export const storage = {
  /**
   * 获取存储项
   * @param key - 存储键
   * @param defaultValue - 默认值
   * @param type - 存储类型
   */
  get<T>(key: string, defaultValue: T, type: StorageType = 'local'): T {
    const storageObj = getStorage(type)
    if (!storageObj) {
      return defaultValue
    }

    try {
      const item = storageObj.getItem(key)
      if (item === null) {
        return defaultValue
      }
      return JSON.parse(item) as T
    } catch (error) {
      logger.error(`Failed to get item from ${type}Storage:`, key, error)
      return defaultValue
    }
  },

  /**
   * 设置存储项
   * @param key - 存储键
   * @param value - 存储值
   * @param type - 存储类型
   */
  set<T>(key: string, value: T, type: StorageType = 'local'): boolean {
    const storageObj = getStorage(type)
    if (!storageObj) {
      return false
    }

    try {
      storageObj.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      logger.error(`Failed to set item to ${type}Storage:`, key, error)
      return false
    }
  },

  /**
   * 移除存储项
   * @param key - 存储键
   * @param type - 存储类型
   */
  remove(key: string, type: StorageType = 'local'): boolean {
    const storageObj = getStorage(type)
    if (!storageObj) {
      return false
    }

    try {
      storageObj.removeItem(key)
      return true
    } catch (error) {
      logger.error(`Failed to remove item from ${type}Storage:`, key, error)
      return false
    }
  },

  /**
   * 清空存储
   * @param type - 存储类型
   */
  clear(type: StorageType = 'local'): boolean {
    const storageObj = getStorage(type)
    if (!storageObj) {
      return false
    }

    try {
      storageObj.clear()
      return true
    } catch (error) {
      logger.error(`Failed to clear ${type}Storage:`, error)
      return false
    }
  },

  /**
   * 检查存储是否可用
   * @param type - 存储类型
   */
  isAvailable(type: StorageType = 'local'): boolean {
    return getStorage(type) !== null
  }
}

/**
 * 便捷的 localStorage 工具
 */
export const localStorage = {
  get: <T>(key: string, defaultValue: T) => storage.get(key, defaultValue, 'local'),
  set: <T>(key: string, value: T) => storage.set(key, value, 'local'),
  remove: (key: string) => storage.remove(key, 'local'),
  clear: () => storage.clear('local'),
  isAvailable: () => storage.isAvailable('local')
}

/**
 * 便捷的 sessionStorage 工具
 */
export const sessionStorage = {
  get: <T>(key: string, defaultValue: T) => storage.get(key, defaultValue, 'session'),
  set: <T>(key: string, value: T) => storage.set(key, value, 'session'),
  remove: (key: string) => storage.remove(key, 'session'),
  clear: () => storage.clear('session'),
  isAvailable: () => storage.isAvailable('session')
}

export default storage
