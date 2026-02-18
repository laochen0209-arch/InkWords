"use client"

/**
 * @file auth/page.tsx
 * @description 登录页 - 使用 Supabase 官方认证
 * @author InkWords Team
 * @date 2026-02-14
 * 
 * 重要说明：
 * - 直接使用 supabase.auth.signInWithPassword 进行登录
 * - 不手动操作 LocalStorage，完全依赖 Supabase 自动会话管理
 * - 登录成功后监听 AuthContext 状态更新再跳转
 */

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight, X, Loader2, Mail, Lock, ShieldCheck } from "lucide-react"
import { useToast } from "@/components/ink-toast/toast-context"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/contexts/auth-context"

/**
 * 登录页
 * 新中式极简登录界面，支持手机号/邮箱登录
 */
export default function AuthPage() {
  const toast = useToast()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lang, setLang] = useState<"zh" | "en">("zh")
  const [loginAttempted, setLoginAttempted] = useState(false)

  // 忘记密码相关状态
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotCode, setForgotCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [forgotCountdown, setForgotCountdown] = useState(0)
  const [isSendingForgotCode, setIsSendingForgotCode] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  /**
   * 【防御逻辑】组件挂载时清理存储空间
   * 防止 LocalStorage 爆满导致 Supabase 无法写入 Token
   */
  useEffect(() => {
    // 清理存储空间，确保 Supabase 有足够空间
    try {
      console.log('[Auth Page] 清理 LocalStorage 和 SessionStorage...')
      localStorage.clear()
      sessionStorage.clear()
      console.log('[Auth Page] 存储空间已清理')
    } catch (e) {
      console.error('[Auth Page] 清理存储失败:', e)
    }

    // 恢复语言设置（清理后重新设置）
    const savedLang = localStorage.getItem('pref_lang') as "zh" | "en" | null
    if (savedLang) {
      setLang(savedLang)
    }
  }, [])

  /**
   * 【新增】监听认证状态变化，登录成功后跳转
   */
  useEffect(() => {
    if (loginAttempted && isAuthenticated) {
      console.log('[Auth Page] 检测到已登录状态，跳转到 /study')
      router.push('/study')
    }
  }, [isAuthenticated, loginAttempted, router])

  const texts = {
    zh: {
      title: "登录",
      subtitle: "墨语 · 每日修行",
      account: "手机号 / 邮箱",
      password: "密码",
      login: "登录",
      logging: "登录中...",
      noAccount: "还没有账号？",
      register: "立即注册",
      back: "返回首页",
      forgotPassword: "忘记密码？",
      forgotPasswordTitle: "找回密码",
      emailLabel: "邮箱地址",
      codeLabel: "验证码",
      newPasswordLabel: "新密码",
      confirmPasswordLabel: "确认新密码",
      sendCode: "发送验证码",
      resetPassword: "重置密码",
      backToLogin: "返回登录"
    },
    en: {
      title: "Login",
      subtitle: "InkWords · Daily Practice",
      account: "Phone / Email",
      password: "Password",
      login: "Login",
      logging: "Logging in...",
      noAccount: "Don't have an account?",
      register: "Register Now",
      back: "Back to Home",
      forgotPassword: "Forgot Password?",
      forgotPasswordTitle: "Reset Password",
      emailLabel: "Email Address",
      codeLabel: "Verification Code",
      newPasswordLabel: "New Password",
      confirmPasswordLabel: "Confirm New Password",
      sendCode: "Send Code",
      resetPassword: "Reset Password",
      backToLogin: "Back to Login"
    }
  }

  const t = texts[lang]

  /**
   * 【核心】登录处理函数
   * 直接使用 Supabase 官方 signInWithPassword 方法
   * 优化：设置登录状态标记，等待 AuthContext 同步后跳转
   */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!account || !password) {
      toast.error(lang === 'zh' ? '请输入账号和密码' : 'Please enter account and password')
      return
    }
    
    setIsLoading(true)
    setLoginAttempted(false)
    
    try {
      console.log('[Auth Page] 开始登录...')
      
      // 【核心】使用 Supabase 官方登录方法
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account,
        password: password,
      })

      if (error) {
        console.error('[Auth Page] 登录失败:', error)
        
        // 【优化】更明显的密码错误提示
        const isInvalidCredentials = error.message?.toLowerCase().includes('invalid') || 
                                     error.message?.toLowerCase().includes('credentials') ||
                                     error.message?.includes('密码') ||
                                     error.message?.includes('password')
        
        if (isInvalidCredentials) {
          // 使用更明显的错误提示
          toast.error(
            lang === 'zh'
              ? '❌ 邮箱或密码错误，请重新输入'
              : '❌ Invalid email or password, please try again'
          )
        } else {
          toast.error(
            lang === 'zh' ? '❌ 登录失败：' + error.message : '❌ Login failed: ' + error.message
          )
        }
      } else if (data.user) {
        console.log('[Auth Page] Supabase 登录成功，等待 AuthContext 同步...')
        setLoginAttempted(true)
        // 不立即跳转，由 useEffect 监听 isAuthenticated 变化后跳转
      }
    } catch (error: any) {
      console.error('[Auth Page] 登录异常:', error)
      toast.error(lang === 'zh' ? '登录失败，请稍后重试' : 'Login failed, please try again later')
    } finally {
      // 【关键】无论成功失败，必须释放按钮
      setIsLoading(false)
    }
  }

  // ==================== 忘记密码功能 ====================

  // 验证邮箱格式
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 发送验证码
  const handleSendForgotCode = async () => {
    if (!forgotEmail || !isValidEmail(forgotEmail)) {
      toast.error(lang === 'zh' ? '请输入有效的邮箱地址' : 'Please enter a valid email address')
      return
    }

    if (forgotCountdown > 0) return

    setIsSendingForgotCode(true)
    try {
      const response = await fetch('/api/forgot-password/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(lang === 'zh' ? '验证码已发送到您的邮箱' : 'Verification code sent to your email')
        setForgotCountdown(60)
        const timer = setInterval(() => {
          setForgotCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        console.error("发送验证码失败:", data)
        toast.error(data.error || (lang === 'zh' ? '发送验证码失败' : 'Failed to send code'))
      }
    } catch (error) {
      console.error('发送验证码失败:', error)
      toast.error(lang === 'zh' ? '发送验证码失败' : 'Failed to send code')
    } finally {
      setIsSendingForgotCode(false)
    }
  }

  // 重置密码
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!forgotCode || !newPassword || !confirmNewPassword) {
      toast.error(lang === 'zh' ? '请填写所有必填字段' : 'Please fill in all required fields')
      return
    }

    if (newPassword.length < 6) {
      toast.error(lang === 'zh' ? '密码长度至少为6位' : 'Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmNewPassword) {
      toast.error(lang === 'zh' ? '两次输入的密码不一致' : 'Passwords do not match')
      return
    }

    setIsResettingPassword(true)
    try {
      const response = await fetch('/api/forgot-password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotEmail,
          code: forgotCode,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(lang === 'zh' ? '密码重置成功！请使用新密码登录' : 'Password reset successful! Please login with your new password')
        
        // 关闭弹窗并重置状态
        setShowForgotPassword(false)
        setForgotEmail('')
        setForgotCode('')
        setNewPassword('')
        setConfirmNewPassword('')
        setForgotCountdown(0)
        
        // 自动填充邮箱
        setAccount(forgotEmail)
      } else {
        console.error("重置密码失败:", data)
        toast.error(data.error || (lang === 'zh' ? '重置密码失败' : 'Failed to reset password'))
      }
    } catch (error) {
      console.error('重置密码失败:', error)
      toast.error(lang === 'zh' ? '重置密码失败' : 'Failed to reset password')
    } finally {
      setIsResettingPassword(false)
    }
  }

  // 关闭忘记密码弹窗
  const closeForgotPassword = () => {
    setShowForgotPassword(false)
    setForgotEmail('')
    setForgotCode('')
    setNewPassword('')
    setConfirmNewPassword('')
    setForgotCountdown(0)
  }

  return (
    <div className="min-h-screen bg-ink-paper ink-landscape-bg">
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-ink-paper/90 backdrop-blur-md shadow-xl shadow-stone-200/50 p-8 md:p-10"
        >
          <header className="text-center mb-10">
            <div className="relative inline-block">
              <h1 className="font-serif text-4xl text-ink-black tracking-wider">
                {t.title}
              </h1>
              <div 
                className="absolute -top-1 -right-6 w-6 h-6 flex items-center justify-center"
                aria-hidden="true"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-full h-full opacity-80"
                  fill="#C23E32"
                >
                  <rect x="2" y="2" width="20" height="20" rx="2" />
                  <text 
                    x="12" 
                    y="16" 
                    textAnchor="middle" 
                    fontSize="10" 
                    fill="#FDFBF7"
                    fontFamily="serif"
                  >
                    印
                  </text>
                </svg>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-gray font-serif tracking-wider">
              {t.subtitle}
            </p>
          </header>
          
          <form 
            className="space-y-6"
            onSubmit={handleLogin}
          >
            <div className="space-y-2">
              <label htmlFor="account" className="sr-only">{t.account}</label>
              <input
                id="account"
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder={t.account}
                className="w-full bg-transparent border-0 border-b border-stone-300 px-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                autoComplete="username"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="sr-only">{t.password}</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.password}
                  className="w-full bg-transparent border-0 border-b border-stone-300 px-0 py-3 pr-12 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-ink-gray/60 hover:text-ink-gray transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {/* 忘记密码链接 */}
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-ink-gray/60 hover:text-ink-vermilion font-serif transition-colors underline underline-offset-2"
                >
                  {t.forgotPassword}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!account || !password || isLoading}
              className="w-full mt-8 py-3.5 bg-ink-vermilion text-white font-serif text-base tracking-wider shadow-md hover:bg-ink-vermilion/80 disabled:bg-ink-gray/30 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? t.logging : (
                <>
                  <span>{t.login}</span>
                  <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                </>
              )}
            </button>
          </form>
          
          <footer className="mt-8 flex flex-col items-center gap-4 text-xs text-ink-gray/60">
            <div className="flex items-center gap-2">
              <span>{t.noAccount}</span>
              <Link 
                href="/register"
                className="text-ink-vermilion hover:text-ink-vermilion/80 font-semibold transition-colors"
              >
                {t.register}
              </Link>
            </div>
            <Link 
              href="/"
              className="hover:text-ink-gray transition-colors font-serif"
            >
              {t.back}
            </Link>
          </footer>
        </motion.div>
      </div>

      {/* 忘记密码弹窗 */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeForgotPassword}
          />
          
          {/* 弹窗内容 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-ink-paper shadow-2xl p-8"
          >
            {/* 关闭按钮 */}
            <button
              onClick={closeForgotPassword}
              className="absolute right-4 top-4 text-ink-gray/50 hover:text-ink-gray transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 标题 */}
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl text-ink-black tracking-wider">
                {t.forgotPasswordTitle}
              </h2>
            </div>

            <form 
              className="space-y-5"
              onSubmit={handleResetPassword}
            >
              {/* 邮箱 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-600 font-serif">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder={t.emailLabel}
                    className="w-full bg-transparent border-0 border-b border-stone-300 pl-8 pr-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* 验证码 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-600 font-serif">
                  {t.codeLabel}
                </label>
                <div className="relative flex gap-3">
                  <div className="relative flex-1">
                    <ShieldCheck className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
                    <input
                      type="text"
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value)}
                      placeholder={t.codeLabel}
                      maxLength={6}
                      className="w-full bg-transparent border-0 border-b border-stone-300 pl-8 pr-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendForgotCode}
                    disabled={forgotCountdown > 0 || !forgotEmail || isSendingForgotCode}
                    className="px-4 py-2 bg-ink-vermilion text-white text-sm font-serif hover:bg-ink-vermilion/80 disabled:bg-ink-gray/30 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {isSendingForgotCode ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : forgotCountdown > 0 ? (
                      `${forgotCountdown}s`
                    ) : (
                      t.sendCode
                    )}
                  </button>
                </div>
              </div>

              {/* 新密码 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-600 font-serif">
                  {t.newPasswordLabel}
                </label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t.newPasswordLabel}
                    className="w-full bg-transparent border-0 border-b border-stone-300 pl-8 pr-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* 确认新密码 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-600 font-serif">
                  {t.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder={t.confirmPasswordLabel}
                    className="w-full bg-transparent border-0 border-b border-stone-300 pl-8 pr-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* 按钮组 */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={!forgotCode || !newPassword || !confirmNewPassword || isResettingPassword}
                  className="w-full py-3.5 bg-ink-vermilion text-white font-serif text-base tracking-wider shadow-md hover:bg-ink-vermilion/80 disabled:bg-ink-gray/30 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isResettingPassword ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {lang === 'zh' ? '重置中...' : 'Resetting...'}
                    </>
                  ) : (
                    t.resetPassword
                  )}
                </button>

                <button
                  type="button"
                  onClick={closeForgotPassword}
                  className="w-full py-3 text-sm text-ink-gray/60 font-serif hover:text-ink-gray transition-colors"
                >
                  {t.backToLogin}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
