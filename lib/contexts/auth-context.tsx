"use client"

/**
 * @file auth-context.tsx
 * @description 认证上下文 - 管理用户登录状态和会话
 * @author InkWords Team
 * @date 2026-02-14
 * 
 * 核心设计原则：
 * 1. 简化初始化逻辑，避免复杂的 ref 和依赖数组问题
 * 2. 使用 supabase.auth.getSession() 获取当前会话
 * 3. 严格区分 "加载中"、"已登录"、"未登录" 三种状态
 * 4. 生产环境移除 console.log，优化性能
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase, cleanupLegacyStorage } from "@/lib/supabase"
import { cache } from "@/lib/cache"

// ============================================================================
// 类型定义
// ============================================================================

interface User {
  id: string
  email: string
  name: string
  avatar: string | null
  subscription_status: string | null
  points: number
  current_period_end: string | null
  study_daily_count: number
  library_daily_count: number
  practice_tickets: number
  streak: number
  is_pro?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  updateUserProfile: (data: Partial<User>) => void
  isVip: boolean
  refreshSession: () => Promise<void>
}

type AuthState = 
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated'; user: null }

// ============================================================================
// Context 创建
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * VIP 判定辅助函数（大小写不敏感）
 * 检查 is_pro 字段、subscription_status 和 current_period_end（到期时间）
 */
export function checkIsVip(
  subscriptionStatus: string | null | undefined,
  currentPeriodEnd: string | null | undefined = null,
  isPro: boolean | null | undefined = false
): boolean {
  // 【调试】输出判断参数
  console.log("[checkIsVip Debug] isPro:", isPro, "subscriptionStatus:", subscriptionStatus)

  // 如果 is_pro 为 true，直接判定为 VIP
  if (isPro === true) {
    console.log("[checkIsVip Debug] VIP by is_pro")
    return true
  }

  const vipStatuses = ['yearly', 'monthly', 'active', 'pro']
  const hasValidStatus = vipStatuses.includes((subscriptionStatus || '').toLowerCase())

  if (!hasValidStatus) {
    console.log("[checkIsVip Debug] NOT VIP - invalid status")
    return false
  }

  // 检查会员是否已过期
  if (currentPeriodEnd) {
    const expiryDate = new Date(currentPeriodEnd)
    const now = new Date()
    const isValid = expiryDate > now
    console.log("[checkIsVip Debug] VIP by status, expiry valid:", isValid)
    return isValid
  }

  // 如果没有设置到期时间，视为有效会员
  console.log("[checkIsVip Debug] VIP by status (no expiry)")
  return true
}

// ============================================================================
// Provider 组件
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading', user: null })

  /**
   * 从 localStorage 获取缓存的用户资料
   */
  const getCachedUserProfile = (): Partial<User> | null => {
    if (typeof window === 'undefined') return null
    try {
      const cached = localStorage.getItem('inkwords_user_profile')
      if (cached) {
        return JSON.parse(cached)
      }
    } catch {
      // 忽略解析错误
    }
    return null
  }

  /**
   * 缓存用户资料到 localStorage
   * 【修复】添加 is_pro 字段到缓存
   */
  const cacheUserProfile = (user: User) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('inkwords_user_profile', JSON.stringify({
        subscription_status: user.subscription_status,
        current_period_end: user.current_period_end,
        points: user.points,
        practice_tickets: user.practice_tickets,
        streak: user.streak,
        is_pro: user.is_pro
      }))
    } catch {
      // 忽略存储错误
    }
  }

  /**
   * 从会话创建基础用户数据（快速响应）
   * 【修复】使用 localStorage 缓存的 VIP 状态避免闪烁
   * 【修复】添加 is_pro 字段
   */
  const createBaseUser = (authUser: any): User => {
    const cached = getCachedUserProfile()
    return {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '墨语学习者',
      avatar: authUser.user_metadata?.avatar_url || null,
      subscription_status: cached?.subscription_status || null,
      points: cached?.points || 0,
      current_period_end: cached?.current_period_end || null,
      study_daily_count: 0,
      library_daily_count: 0,
      practice_tickets: cached?.practice_tickets || 0,
      streak: cached?.streak || 0,
      is_pro: cached?.is_pro || false
    }
  }

  /**
   * 获取用户完整资料（后台异步加载）
   */
  const fetchUserProfile = async (authUser: any, updateState: boolean = false): Promise<User | null> => {
    const cacheKey = `user_profile_${authUser.id}`
    
    try {
      const cachedUser = cache.get<User>(cacheKey)
      if (cachedUser) {
        return cachedUser
      }

      const { data: userData, error } = await supabase
        .from("users")
        .select("name, avatar, subscription_status, points, current_period_end, study_daily_count, library_daily_count, practice_tickets, streak, is_pro")
        .eq("id", authUser.id)
        .single()

      if (error) {
        console.error("[Auth] 获取用户资料失败:", error)
        return null
      }

      // 【调试】输出原始数据
      console.log("[Auth Debug] userData from DB:", userData)
      console.log("[Auth Debug] is_pro value:", userData?.is_pro)
      console.log("[Auth Debug] is_pro type:", typeof userData?.is_pro)

      const user: User = {
        id: authUser.id,
        email: authUser.email || '',
        // 【修复】优先使用数据库中的 name 和 avatar
        name: userData?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || '墨语学习者',
        avatar: userData?.avatar || authUser.user_metadata?.avatar_url || null,
        subscription_status: userData?.subscription_status || null,
        points: userData?.points || 0,
        current_period_end: userData?.current_period_end || null,
        study_daily_count: userData?.study_daily_count || 0,
        library_daily_count: userData?.library_daily_count || 0,
        practice_tickets: userData?.practice_tickets || 0,
        streak: userData?.streak || 0,
        is_pro: userData?.is_pro === true  // 确保只有 true 才是 true
      }

      console.log("[Auth Debug] constructed user.is_pro:", user.is_pro)

      cache.set(cacheKey, user, 30000)
      
      // 【修复】缓存用户资料到 localStorage，避免 VIP 状态闪烁
      cacheUserProfile(user)
      
      if (updateState) {
        setAuthState({ status: 'authenticated', user })
      }
      
      return user
    } catch (error) {
      return null
    }
  }

  /**
   * 刷新会话（供外部调用）
   */
  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session?.user) {
        setAuthState({ status: 'unauthenticated', user: null })
        return
      }
      
      if (session.user.id) {
        cache.delete(`user_profile_${session.user.id}`)
      }
      
      // 【优化】先用基础用户数据快速响应
      const baseUser = createBaseUser(session.user)
      setAuthState({ status: 'authenticated', user: baseUser })
      
      // 后台异步获取完整用户资料
      fetchUserProfile(session.user, true)
    } catch (error) {
      setAuthState({ status: 'unauthenticated', user: null })
    }
  }

  /**
   * 更新用户资料
   */
  const updateUserProfile = (data: Partial<User>) => {
    setAuthState(prev => {
      if (prev.status !== 'authenticated') return prev
      
      const updatedUser = { ...prev.user, ...data }
      
      if (updatedUser.id) {
        cache.delete(`user_profile_${updatedUser.id}`)
      }
      
      return {
        status: 'authenticated',
        user: updatedUser
      }
    })
  }

  // ============================================================================
  // useEffect：组件挂载时初始化
  // ============================================================================
  
  useEffect(() => {
    let isMounted = true
    
    cleanupLegacyStorage()
    
    const initializeAuth = async () => {
      try {
        if (!supabase) {
          if (isMounted) {
            setAuthState({ status: 'unauthenticated', user: null })
          }
          return
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (!isMounted) {
          return
        }

        if (sessionError) {
          setAuthState({ status: 'unauthenticated', user: null })
          return
        }

        if (!session?.user) {
          setAuthState({ status: 'unauthenticated', user: null })
          return
        }

        // 【优化】先用基础用户数据快速响应
        const baseUser = createBaseUser(session.user)
        setAuthState({ status: 'authenticated', user: baseUser })
        
        // 后台异步获取完整用户资料
        fetchUserProfile(session.user, true)
      } catch (error) {
        if (isMounted) {
          setAuthState({ status: 'unauthenticated', user: null })
        }
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              // 【优化】先用基础用户数据快速响应
              const baseUser = createBaseUser(session.user)
              setAuthState({ status: 'authenticated', user: baseUser })
              
              // 后台异步获取完整用户资料
              fetchUserProfile(session.user, true)
            }
            break
            
          case 'SIGNED_OUT':
            setAuthState({ status: 'unauthenticated', user: null })
            break
            
          case 'TOKEN_REFRESHED':
            break
            
          case 'USER_UPDATED':
            if (session?.user) {
              const user = await fetchUserProfile(session.user)
              if (user) {
                setAuthState({ status: 'authenticated', user })
              }
            }
            break
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // ============================================================================
  // 计算派生状态
  // ============================================================================
  
  const isLoading = authState.status === 'loading'
  const isAuthenticated = authState.status === 'authenticated'
  const user = authState.user
  const isVip = checkIsVip(user?.subscription_status, user?.current_period_end, user?.is_pro)

  // ============================================================================
  // 渲染
  // ============================================================================
  
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    updateUserProfile,
    isVip,
    refreshSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
