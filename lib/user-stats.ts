/**
 * @file user-stats.ts
 * @description 用户统计数据更新工具函数
 * @author InkWords Team
 * @date 2026-02-12
 */

export type StatsAction = 'study' | 'read' | 'practice' | 'earn_points'

/**
 * 更新用户统计数据
 * @param action 操作类型：'study' | 'read' | 'practice' | 'earn_points'
 * @param value 数值（默认为 1）
 * @param userId 用户ID（可选）
 * @returns 更新后的统计数据
 */
export async function updateUserStats(action: StatsAction, value: number = 1, userId?: string) {
  try {
    let url = '/api/user/stats/update'
    if (userId) {
      url += `?userId=${userId}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, value, userId }),
    })

    if (!response.ok) {
      try {
        const error = await response.json()
        throw new Error(error.error || '更新统计数据失败')
      } catch {
        throw new Error('更新统计数据失败')
      }
    }

    const data = await response.json()
    console.log('[UserStats] 更新成功:', data)
    return data.stats
  } catch (error) {
    console.error('[UserStats] 更新失败:', error)
    throw error
  }
}

/**
 * 记录学习活动
 * @param count 学习数量（默认为 1）
 * @param userId 用户ID（可选）
 */
export async function recordStudy(count: number = 1, userId?: string) {
  return updateUserStats('study', count, userId)
}

/**
 * 记录阅读活动
 * @param count 阅读数量（默认为 1）
 * @param userId 用户ID（可选）
 */
export async function recordRead(count: number = 1, userId?: string) {
  return updateUserStats('read', count, userId)
}

/**
 * 消耗练习券
 * @param count 消耗数量（默认为 1）
 * @param userId 用户ID（可选）
 */
export async function consumePracticeTicket(count: number = 1, userId?: string) {
  return updateUserStats('practice', count, userId)
}

/**
 * 增加积分
 * @param points 积分数
 * @param userId 用户ID（可选）
 */
export async function earnPoints(points: number, userId?: string) {
  return updateUserStats('earn_points', points, userId)
}
