"use client"

/**
 * @file auth-context.tsx
 * @description 认证上下文 - 管理用户登录状态和会话
 * @author InkWords Team
 * @date 2026-02-14
 * @version 2.0.0 - 重构为 API 调用模式，绕过 GFW 阻断
 * 
 * 核心设计原则：
 * 1. 简化初始化逻辑，避免复杂的 ref 和依赖数组问题
 * 2. 使用 supabase.auth.getSession() 获取当前会话（Auth 必须保留）
 * 3. 用户资料获取改为调用 /api/user/profile（绕过 GFW）
 * 4. 严格区分 "加载中"、"已登录"、"未登录" 三种状态
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase, cleanupLegacyStorage } from "@/lib/supabase"
import { cache } from "@/lib/cache"

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
  refreshUserStats: () => Promise<void>
}

type AuthState = 
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated'; user: null }

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * VIP 判定辅助函数（大小写不敏感）
 * 检查 is_pro 字段、subscription_status 和 current_period_end（到期时间）
 */
export function checkIsVip(
  subscriptionStatus: string | null | undefined,
  currentPeriodEnd: string | null | undefined = null,
  isPro: boolean | null | undefined = false
): boolean {
  console.log("[checkIsVip Debug] isPro:", isPro, "subscriptionStatus:", subscriptionStatus)

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

  if (currentPeriodEnd) {
    const expiryDate = new Date(currentPeriodEnd)
    const now = new Date()
    const isValid = expiryDate > now
    console.log("[checkIsVip Debug] VIP by status, expiry valid:", isValid)
    return isValid
  }

  console.log("[checkIsVip Debug] VIP by status (no expiry)")
  return true
}

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
    }
    return null
  }

  /**
   * 缓存用户资料到 localStorage
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
    }
  }

  /**
   * 从会话创建基础用户数据（快速响应）
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
   * @version 2.0.0 - 通过 API 路由获取，绕过 GFW 阻断
   */
  const fetchUserProfile = async (authUser: any, updateState: boolean = false): Promise<User | null> => {
    const cacheKey = `user_profile_${authUser.id}`
    
    try {
      const cachedUser = cache.get<User>(cacheKey)
      if (cachedUser) {
        return cachedUser
      }

      console.log('[Auth] 通过 API 获取用户资料...')
      
      const response = await fetch('/api/user/profile')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[Auth] 获取用户资料失败:", errorData)
        return null
      }

      const result = await response.json()

      if (!result.success || !result.data) {
        console.error("[Auth] 用户资料数据格式错误")
        return null
      }

      const userData = result.data

      console.log("[Auth Debug] userData from API:", userData)
      console.log("[Auth Debug] is_pro value:", userData?.is_pro)

      const user: User = {
        id: authUser.id,
        email: authUser.email || '',
        name: userData?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || '墨语学习者',
        avatar: userData?.avatar || authUser.user_metadata?.avatar_url || null,
        subscription_status: userData?.subscription_status || null,
        points: userData?.points || 0,
        current_period_end: userData?.current_period_end || null,
        study_daily_count: userData?.study_daily_count || 0,
        library_daily_count: userData?.library_daily_count || 0,
        practice_tickets: userData?.practice_tickets || 0,
        streak: userData?.streak || 0,
        is_pro: userData?.is_pro === true
      }

      console.log("[Auth Debug] constructed user.is_pro:", user.is_pro)

      cache.set(cacheKey, user, 30000)
      cacheUserProfile(user)
      
      if (updateState) {
        setAuthState({ status: 'authenticated', user })
      }
      
      return user
    } catch (error) {
      console.error("[Auth] 获取用户资料异常:", error)
      return null
    }
  }

  /**
   * 刷新会话（供外部调用）
   */
  const refreshSession = async () => {
    try {
      console.log('[Auth Context] 开始刷新会话...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session?.user) {
        console.warn('[Auth Context] 刷新会话失败，设置为未登录')
        setAuthState({ status: 'unauthenticated', user: null })
        return
      }
      
      if (session.user.id) {
        console.log('[Auth Context] 清除用户资料缓存')
        cache.delete(`user_profile_${session.user.id}`)
      }
      
      console.log('[Auth Context] 使用基础用户数据快速设置状态')
      const baseUser = createBaseUser(session.user)
      setAuthState({ status: 'authenticated', user: baseUser })
      
      console.log('[Auth Context] 后台异步加载完整用户资料...')
      fetchUserProfile(session.user, true)
    } catch (error) {
      console.error('[Auth Context] 刷新会话异常:', error)
      setAuthState({ status: 'unauthenticated', user: null })
    }
  }

  /**
   * 刷新用户统计数据（学习天数等）
   * @version 2.0.0 - 通过 API 路由获取，绕过 GFW 阻断
   */
  const refreshUserStats = async () => {
    if (authState.status !== 'authenticated' || !authState.user?.id) {
      return
    }

    try {
      console.log('[Auth] 通过 API 刷新用户统计数据...')
      
      const response = await fetch('/api/user/stats')
      
      if (!response.ok) {
        console.error('[Auth] 刷新用户统计数据失败')
        return
      }

      const result = await response.json()

      if (!result.success || !result.stats) {
        console.error('[Auth] 用户统计数据格式错误')
        return
      }

      const userData = result.stats

      setAuthState(prev => {
        if (prev.status !== 'authenticated') return prev
        
        const updatedUser = {
          ...prev.user,
          study_daily_count: userData.study_daily_count || 0,
          library_daily_count: userData.library_daily_count || 0,
          practice_tickets: userData.practice_tickets || 0,
          streak: userData.streak || 0,
          points: userData.points || 0
        }
        
        cacheUserProfile(updatedUser)
        
        return {
          status: 'authenticated',
          user: updatedUser
        }
      })
      
      console.log('[Auth] 用户统计数据已刷新')
    } catch (error) {
      console.error('[Auth] 刷新用户统计数据时发生错误:', error)
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

        console.log('[Auth Context] 开始初始化认证状态...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (!isMounted) {
          return
        }

        if (sessionError) {
          console.error('[Auth Context] 获取会话失败:', sessionError)
          setAuthState({ status: 'unauthenticated', user: null })
          return
        }

        if (!session?.user) {
          console.log('[Auth Context] 未找到有效会话，设置为未登录状态')
          setAuthState({ status: 'unauthenticated', user: null })
          return
        }

        console.log('[Auth Context] 找到有效会话，快速设置认证状态')
        const baseUser = createBaseUser(session.user)
        setAuthState({ status: 'authenticated', user: baseUser })
        
        console.log('[Auth Context] 后台异步加载完整用户资料...')
        fetchUserProfile(session.user, true)
      } catch (error) {
        console.error('[Auth Context] 初始化认证状态异常:', error)
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
              console.log('[Auth Context] 检测到 SIGNED_IN 事件，用户已登录')
              const baseUser = createBaseUser(session.user)
              setAuthState({ status: 'authenticated', user: baseUser })
              
              console.log('[Auth Context] 后台异步加载完整用户资料...')
              fetchUserProfile(session.user, true)
            }
            break
            
          case 'SIGNED_OUT':
            console.log('[Auth Context] 检测到 SIGNED_OUT 事件，用户已登出')
            setAuthState({ status: 'unauthenticated', user: null })
            break
            
          case 'TOKEN_REFRESHED':
            console.log('[Auth Context] Token 已刷新')
            break
            
          case 'USER_UPDATED':
            if (session?.user) {
              console.log('[Auth Context] 用户信息已更新，重新获取用户资料')
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

  const isLoading = authState.status === 'loading'
  const isAuthenticated = authState.status === 'authenticated'
  const user = authState.user
  const isVip = checkIsVip(user?.subscription_status, user?.current_period_end, user?.is_pro)

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    updateUserProfile,
    isVip,
    refreshSession,
    refreshUserStats
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
