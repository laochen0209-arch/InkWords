/**
 * 签到数据管理工具
 * 
 * 功能：
 * - 提供签到数据的读取、更新、重置功能
 * - 使用 localStorage 存储签到数据
 * - 确保多个页面共享签到状态
 */

export interface CheckInData {
  checked: boolean
  streak: number
  lastCheckInDate: string
}

const STORAGE_KEY = 'inkwords_checkin_data'

/**
 * 获取今天的日期字符串（YYYY-MM-DD 格式）
 */
function getTodayDateString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 从 localStorage 读取签到数据
 */
export function getCheckInData(): CheckInData {
  if (typeof window === 'undefined') {
    return {
      checked: false,
      streak: 12,
      lastCheckInDate: ''
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored) as CheckInData
      
      const today = getTodayDateString()
      
      if (data.lastCheckInDate !== today) {
        return {
          checked: false,
          streak: data.streak,
          lastCheckInDate: data.lastCheckInDate
        }
      }
      
      return data
    }
  } catch (error) {
    console.error('读取签到数据失败:', error)
  }

  return {
    checked: false,
    streak: 12,
    lastCheckInDate: ''
  }
}

/**
 * 更新签到数据
 */
export function updateCheckInData(): CheckInData {
  const currentData = getCheckInData()
  const today = getTodayDateString()
  
  let newStreak = currentData.streak
  
  if (currentData.lastCheckInDate !== today) {
    newStreak = currentData.streak + 1
  }
  
  const newData: CheckInData = {
    checked: true,
    streak: newStreak,
    lastCheckInDate: today
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
  } catch (error) {
    console.error('保存签到数据失败:', error)
  }
  
  return newData
}

/**
 * 重置签到数据（用于测试）
 */
export function resetCheckInData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('重置签到数据失败:', error)
  }
}
