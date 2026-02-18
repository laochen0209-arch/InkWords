/**
 * @file supabase.ts
 * @description Supabase 客户端配置及用户活动记录工具函数
 * @author InkWords Team
 * @date 2026-02-14
 * 
 * 重要说明：
 * - 完全依赖 Supabase 官方认证机制
 * - 不使用手动 localStorage 管理会话
 * - 所有认证状态通过 supabase.auth.getSession() 获取
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 检查环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] 环境变量未设置:', { 
    supabaseUrl: supabaseUrl ? '已设置' : '未设置', 
    supabaseAnonKey: supabaseAnonKey ? '已设置' : '未设置' 
  })
}

/**
 * 全局变量存储 Supabase 实例（单例模式）
 */
const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient | undefined
}

/**
 * 清理旧的本地存储字段
 * 这些字段是之前手动管理认证时使用的，现在需要清理
 */
export function cleanupLegacyStorage(): void {
  if (typeof window === 'undefined') return
  
  const keysToRemove = [
    'inkwords_user',
    'userId', 
    'isLoggedIn',
    'inkwords_token',
    'inkwords_email'
  ]
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`[Supabase] 清理旧存储字段: ${key}`)
      localStorage.removeItem(key)
    }
  })
}

/**
 * 获取 Supabase 客户端实例
 * 使用 Supabase 官方默认配置，不手动干预存储
 */
function getSupabaseClient(): SupabaseClient {
  try {
    // 如果已经有实例，直接返回
    if (globalForSupabase.supabase) {
      return globalForSupabase.supabase
    }

    // 检查环境变量
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase 环境变量未设置')
    }

    console.log('[Supabase] 创建客户端...')
    
    // 创建客户端 - 使用 Supabase 官方默认配置
    // 不手动设置 storage，让 Supabase 自动处理
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // 注意：不手动设置 storage，使用 Supabase 默认行为
      },
    })

    console.log('[Supabase] 客户端创建成功')

    // 保存到全局变量
    globalForSupabase.supabase = client

    return client
  } catch (error) {
    console.error('[Supabase] 创建客户端失败:', error)
    throw error
  }
}

/**
 * Supabase 客户端实例
 */
export const supabase = getSupabaseClient()

/**
 * 用户活动类型
 */
export type UserActionType = 'read_article' | 'take_exam' | 'learn_word'

/**
 * 记录用户活动到 user_activities 表
 * 使用 Supabase 官方方法获取当前用户，不依赖手动存储
 */
export async function logUserActivity(
  action_type: UserActionType,
  target_id?: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    // 使用 Supabase 官方方法获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.warn('[logUserActivity] 用户未登录，跳过记录')
      return
    }

    const { error } = await supabase.from('user_activities').insert({
      user_id: user.id,
      action_type,
      target_id: target_id || null,
      details: details || {},
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('[logUserActivity] 记录用户活动失败:', error)
    } else {
      console.log('[logUserActivity] 记录成功:', { action_type, target_id, details })
    }
  } catch (err) {
    console.error('[logUserActivity] 记录用户活动时发生错误:', err)
  }
}
