/**
 * 配额检查工具函数
 *
 * 文件说明：
 * 统一处理用户配额检查和重置逻辑
 *
 * 功能：
 * - 检查用户是否为会员（is_pro 或 subscription_status）
 * - 检查每日配额（学习、阅读）
 * - 检查练习券余额
 * - 自动重置跨天配额
 */

import { createServerClient } from "@/lib/supabase/server"

/**
 * 检查用户是否为会员
 * 同时检查 is_pro 字段和 subscription_status 字段
 * 还会检查会员是否已过期（current_period_end）
 */
function isUserVip(user: { 
  is_pro?: boolean; 
  subscription_status?: string | null;
  current_period_end?: string | null;
}): boolean {
  // 检查 is_pro 字段
  if (user.is_pro) {
    return true
  }
  
  // 检查 subscription_status 字段
  const vipStatuses = ['yearly', 'monthly', 'active', 'pro']
  if (user.subscription_status && vipStatuses.includes(user.subscription_status)) {
    // 检查会员是否已过期
    if (user.current_period_end) {
      const expiryDate = new Date(user.current_period_end)
      const now = new Date()
      if (expiryDate > now) {
        return true
      }
    } else {
      // 如果没有设置到期时间，视为有效会员
      return true
    }
  }
  
  return false
}

/**
 * 配额检查结果
 */
export interface QuotaCheckResult {
  allowed: boolean
  error?: string
  code?: string
  remaining?: number
}

/**
 * 检查每日学习配额
 *
 * @param userId - 用户ID
 * @returns QuotaCheckResult - 检查结果
 */
export async function checkStudyQuota(userId: string): Promise<QuotaCheckResult> {
  const supabase = await createServerClient()

  // 获取用户信息（包含会员状态字段）
  const { data: user, error } = await supabase
    .from("users")
    .select("is_pro, subscription_status, current_period_end, study_daily_count, last_reset_date")
    .eq("id", userId)
    .single()

  if (error || !user) {
    return { allowed: false, error: "用户不存在", code: "USER_NOT_FOUND" }
  }

  // 会员直接放行
  if (isUserVip(user)) {
    return { allowed: true }
  }

  // 检查是否需要重置配额（跨天）
  const today = new Date().toISOString().split("T")[0]
  const lastReset = user.last_reset_date
    ? new Date(user.last_reset_date).toISOString().split("T")[0]
    : null

  let currentCount = user.study_daily_count || 0

  if (lastReset !== today) {
    // 跨天了，重置配额
    currentCount = 0
    await supabase
      .from("users")
      .update({
        study_daily_count: 0,
        library_daily_count: 0,
        last_reset_date: new Date().toISOString(),
      })
      .eq("id", userId)
  }

  // 检查是否超过限制（每日5次）
  const DAILY_LIMIT = 5
  if (currentCount >= DAILY_LIMIT) {
    return {
      allowed: false,
      error: "今日学习次数已达上限，请升级会员享受无限学习",
      code: "LIMIT_REACHED",
      remaining: 0,
    }
  }

  // 增加计数
  await supabase
    .from("users")
    .update({ study_daily_count: currentCount + 1 })
    .eq("id", userId)

  return {
    allowed: true,
    remaining: DAILY_LIMIT - currentCount - 1,
  }
}

/**
 * 检查每日阅读配额
 *
 * @param userId - 用户ID
 * @returns QuotaCheckResult - 检查结果
 */
export async function checkLibraryQuota(userId: string): Promise<QuotaCheckResult> {
  const supabase = await createServerClient()

  // 获取用户信息（包含会员状态字段）
  const { data: user, error } = await supabase
    .from("users")
    .select("is_pro, subscription_status, current_period_end, library_daily_count, last_reset_date")
    .eq("id", userId)
    .single()

  console.log('[CHECK LIBRARY QUOTA] 用户数据:', { 
    userId, 
    is_pro: user?.is_pro, 
    subscription_status: user?.subscription_status,
    library_daily_count: user?.library_daily_count 
  })

  if (error || !user) {
    console.log('[CHECK LIBRARY QUOTA] 用户不存在:', error)
    return { allowed: false, error: "用户不存在", code: "USER_NOT_FOUND" }
  }

  // 会员直接放行
  const isVip = isUserVip(user)
  console.log('[CHECK LIBRARY QUOTA] VIP 检查结果:', isVip)
  if (isVip) {
    console.log('[CHECK LIBRARY QUOTA] VIP 用户，直接放行')
    return { allowed: true }
  }

  // 检查是否需要重置配额（跨天）
  const today = new Date().toISOString().split("T")[0]
  const lastReset = user.last_reset_date
    ? new Date(user.last_reset_date).toISOString().split("T")[0]
    : null

  let currentCount = user.library_daily_count || 0

  if (lastReset !== today) {
    // 跨天了，重置配额
    currentCount = 0
    await supabase
      .from("users")
      .update({
        study_daily_count: 0,
        library_daily_count: 0,
        last_reset_date: new Date().toISOString(),
      })
      .eq("id", userId)
  }

  // 检查是否超过限制（每日5次）
  const DAILY_LIMIT = 5
  if (currentCount >= DAILY_LIMIT) {
    return {
      allowed: false,
      error: "今日阅读次数已达上限，请升级会员享受无限阅读",
      code: "LIMIT_REACHED",
      remaining: 0,
    }
  }

  // 增加计数
  await supabase
    .from("users")
    .update({ library_daily_count: currentCount + 1 })
    .eq("id", userId)

  return {
    allowed: true,
    remaining: DAILY_LIMIT - currentCount - 1,
  }
}

/**
 * 检查练习券余额
 *
 * @param userId - 用户ID
 * @returns QuotaCheckResult - 检查结果
 */
export async function checkPracticeTickets(userId: string): Promise<QuotaCheckResult> {
  const supabase = await createServerClient()

  // 获取用户信息（包含会员状态字段）
  const { data: user, error } = await supabase
    .from("users")
    .select("is_pro, subscription_status, current_period_end, practice_tickets")
    .eq("id", userId)
    .single()

  if (error || !user) {
    return { allowed: false, error: "用户不存在", code: "USER_NOT_FOUND" }
  }

  // 会员直接放行
  if (isUserVip(user)) {
    return { allowed: true, remaining: -1 }
  }

  // 检查练习券余额
  const tickets = user.practice_tickets || 0
  if (tickets <= 0) {
    return {
      allowed: false,
      error: "练习券已用完，请升级会员享受无限练习",
      code: "NO_TICKETS",
      remaining: 0,
    }
  }

  // 扣除练习券
  await supabase
    .from("users")
    .update({ practice_tickets: tickets - 1 })
    .eq("id", userId)

  return {
    allowed: true,
    remaining: tickets - 1,
  }
}

/**
 * 获取用户配额信息
 *
 * @param userId - 用户ID
 * @returns 配额信息
 */
export async function getUserQuotaInfo(userId: string) {
  const supabase = await createServerClient()

  const { data: user, error } = await supabase
    .from("users")
    .select("is_pro, study_daily_count, library_daily_count, practice_tickets, last_reset_date")
    .eq("id", userId)
    .single()

  if (error || !user) {
    return null
  }

  // 检查是否需要重置
  const today = new Date().toISOString().split("T")[0]
  const lastReset = user.last_reset_date
    ? new Date(user.last_reset_date).toISOString().split("T")[0]
    : null

  if (lastReset !== today && !user.is_pro) {
    // 跨天了，返回重置后的值
    return {
      isPro: false,
      studyDailyCount: 0,
      libraryDailyCount: 0,
      practiceTickets: user.practice_tickets || 0,
      studyRemaining: 5,
      libraryRemaining: 5,
    }
  }

  return {
    isPro: user.is_pro,
    studyDailyCount: user.study_daily_count || 0,
    libraryDailyCount: user.library_daily_count || 0,
    practiceTickets: user.practice_tickets || 0,
    studyRemaining: user.is_pro ? -1 : Math.max(0, 5 - (user.study_daily_count || 0)),
    libraryRemaining: user.is_pro ? -1 : Math.max(0, 5 - (user.library_daily_count || 0)),
  }
}
