/**
 * 练习数据管理工具
 * 用于管理用户练习数据的持久化存储
 */

export interface PracticeResult {
  userId: string
  score: number
  wordsCount: number
  date: Date
}

export interface PracticeStats {
  totalPoints: number
  wordsLearned: number
  streak: number
  lastStudyDate: string | null
}

const PRACTICE_STATS_KEY = "inkwords_practice_stats"

const DEFAULT_PRACTICE_STATS: PracticeStats = {
  totalPoints: 0,
  wordsLearned: 0,
  streak: 0,
  lastStudyDate: null
}

export function getPracticeStats(): PracticeStats {
  if (typeof window === "undefined") {
    return DEFAULT_PRACTICE_STATS
  }
  try {
    const stored = localStorage.getItem(PRACTICE_STATS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Failed to parse practice stats:", error)
  }
  return DEFAULT_PRACTICE_STATS
}

export function submitPracticeResult(result: PracticeResult): PracticeStats {
  if (typeof window === "undefined") {
    return DEFAULT_PRACTICE_STATS
  }
  try {
    const currentStats = getPracticeStats()
    const today = new Date()
    const lastStudyDate = currentStats.lastStudyDate ? new Date(currentStats.lastStudyDate) : null
    
    let newStreak = currentStats.streak
    
    if (lastStudyDate) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      const isYesterday = lastStudyDate.toDateString() === yesterday.toDateString()
      const isToday = lastStudyDate.toDateString() === today.toDateString()
      
      if (isYesterday) {
        newStreak = currentStats.streak + 1
      } else if (!isToday) {
        newStreak = 1
      }
    } else {
      newStreak = 1
    }
    
    const updatedStats: PracticeStats = {
      totalPoints: currentStats.totalPoints + result.score,
      wordsLearned: currentStats.wordsLearned + result.wordsCount,
      streak: newStreak,
      lastStudyDate: today.toISOString()
    }
    
    localStorage.setItem(PRACTICE_STATS_KEY, JSON.stringify(updatedStats))
    
    return updatedStats
  } catch (error) {
    console.error("Failed to submit practice result:", error)
    return DEFAULT_PRACTICE_STATS
  }
}

export function clearPracticeStats(): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.removeItem(PRACTICE_STATS_KEY)
  } catch (error) {
    console.error("Failed to clear practice stats:", error)
  }
}
