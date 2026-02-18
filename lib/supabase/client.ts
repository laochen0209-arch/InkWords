/**
 * @file client.ts
 * @description 浏览器端 Supabase 客户端 - 真正的单例模式
 * @author InkWords Team
 */

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

// 环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * 全局变量存储 Supabase 实例（真正的单例模式）
 */
const globalForSupabase = globalThis as unknown as {
  browserSupabase: SupabaseClient | undefined
}

/**
 * 创建浏览器端 Supabase 客户端
 * 使用全局变量确保只有一个实例
 */
export const createBrowserClient = (): SupabaseClient => {
  // 如果已经有实例，直接返回
  if (globalForSupabase.browserSupabase) {
    return globalForSupabase.browserSupabase
  }

  // 检查环境变量
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('[createBrowserClient] Supabase 环境变量未设置')
  }

  console.log('[createBrowserClient] 创建新的 Supabase 客户端实例...')

  // 创建客户端
  const client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })

  // 保存到全局变量
  globalForSupabase.browserSupabase = client

  console.log('[createBrowserClient] Supabase 客户端创建成功')

  return client
}

/**
 * 获取现有的 Supabase 客户端实例（如果不存在则创建）
 */
export const getBrowserClient = (): SupabaseClient => {
  return createBrowserClient()
}
