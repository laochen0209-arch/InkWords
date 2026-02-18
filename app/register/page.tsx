"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ink-toast/toast-context"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { Mail, Lock, User, ShieldCheck, Loader2 } from "lucide-react"

/**
 * 注册页面组件
 *
 * 文件说明：
 * 用户注册页面，支持邮箱验证码注册
 * 优化了错误处理，将后端英文错误翻译为中文提示
 *
 * 功能：
 * - 邮箱格式验证
 * - 发送邮箱验证码（60秒倒计时）
 * - 验证码验证
 * - 密码确认
 * - 注册成功后自动登录
 * - 智能错误翻译
 */
export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [emailError, setEmailError] = useState("")
  const router = useRouter()
  const toast = useToast()
  const { learningMode } = useLanguage()

  // 调试：打印 learningMode
  useEffect(() => {
    console.log('[Register Page] learningMode:', learningMode)
    console.log('[Register Page] localStorage:', localStorage.getItem('inkwords_learning_mode'))
  }, [learningMode])

  const t = TRANSLATIONS[learningMode]

  /**
   * 验证邮箱格式
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * 处理邮箱输入变化
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (value && !isValidEmail(value)) {
      setEmailError(t.auth.email_invalid || '请输入有效的邮箱地址')
    } else {
      setEmailError("")
    }
  }

  /**
   * 翻译错误信息
   * 将后端返回的英文错误翻译为中文
   */
  const translateError = (errorMessage: string): string => {
    // 【修复】处理空值情况
    if (!errorMessage || typeof errorMessage !== 'string') {
      return '注册失败，请稍后重试'
    }
    
    const lowerMessage = errorMessage.toLowerCase()

    // 密码相关错误
    if (lowerMessage.includes('password should contain') ||
        lowerMessage.includes('password should be at least') ||
        lowerMessage.includes('weak password') ||
        lowerMessage.includes('password is too weak')) {
      return '密码太弱：请包含大写字母、小写字母和数字，且长度至少6位'
    }

    // 用户已存在
    if (lowerMessage.includes('user already registered') ||
        lowerMessage.includes('already exists') ||
        lowerMessage.includes('already registered') ||
        lowerMessage.includes('该邮箱已注册')) {
      return '该邮箱已被注册，请直接登录'
    }

    // 验证码错误
    if (lowerMessage.includes('verification code') ||
        lowerMessage.includes('code') ||
        lowerMessage.includes('验证码')) {
      if (lowerMessage.includes('expired') || lowerMessage.includes('过期')) {
        return '验证码已过期，请重新获取'
      }
      if (lowerMessage.includes('invalid') || lowerMessage.includes('error') || lowerMessage.includes('错误')) {
        return '验证码错误，请重新输入'
      }
    }

    // 邮箱格式错误
    if (lowerMessage.includes('invalid email') ||
        lowerMessage.includes('email format') ||
        lowerMessage.includes('邮箱格式')) {
      return '请输入有效的邮箱地址'
    }

    // 必填字段
    if (lowerMessage.includes('required') ||
        lowerMessage.includes('missing') ||
        lowerMessage.includes('请填写')) {
      return '请填写所有必填字段'
    }

    // 频率限制
    if (lowerMessage.includes('rate limit') ||
        lowerMessage.includes('too many requests') ||
        lowerMessage.includes('尝试次数过多')) {
      return '尝试次数过多，请稍后再试'
    }

    // 网络错误
    if (lowerMessage.includes('network') ||
        lowerMessage.includes('fetch') ||
        lowerMessage.includes('connection')) {
      return '网络连接失败，请检查网络后重试'
    }

    // 服务器错误
    if (lowerMessage.includes('server error') ||
        lowerMessage.includes('internal error') ||
        lowerMessage.includes('服务器错误')) {
      return '服务器繁忙，请稍后重试'
    }

    // 权限错误
    if (lowerMessage.includes('permission') ||
        lowerMessage.includes('unauthorized') ||
        lowerMessage.includes('forbidden')) {
      return '权限不足，请联系管理员'
    }

    // 数据库错误
    if (lowerMessage.includes('database') ||
        lowerMessage.includes('schema') ||
        lowerMessage.includes('column')) {
      return '系统配置错误，请联系管理员'
    }

    // 如果无法识别，返回原始错误（去除前缀）
    const cleanedMessage = errorMessage.replace(/^注册失败:\s*/i, '').trim()
    return cleanedMessage || '注册失败，请稍后重试'
  }

  /**
   * 发送验证码
   */
  const handleSendCode = async () => {
    if (!email || !isValidEmail(email)) {
      toast.error(t.auth.email_invalid || '请输入有效的邮箱地址')
      return
    }

    if (countdown > 0) return

    try {
      setIsSendingCode(true)

      const response = await fetch('/api/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          type: 'register'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // 解析错误信息
        const errorMessage = data.error || data.message || '发送验证码失败'
        const translatedError = translateError(errorMessage)
        throw new Error(translatedError)
      }

      toast.success(t.auth.code_sent || '验证码已发送，请查看邮箱')

      // 开始倒计时
      setCountdown(60)

    } catch (error: any) {
      console.error('发送验证码失败:', error)
      toast.error(error.message || '发送验证码失败')
    } finally {
      setIsSendingCode(false)
    }
  }

  /**
   * 倒计时效果
   */
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  /**
   * 处理注册
   */
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // 验证表单
    if (!email || !code || !password || !confirmPassword) {
      toast.error(t.auth.fill_all_fields || '请填写所有必填字段')
      return
    }

    if (!isValidEmail(email)) {
      toast.error(t.auth.email_invalid || '请输入有效的邮箱地址')
      return
    }

    if (password.length < 6) {
      toast.error(t.auth.password_too_short || '密码长度至少为6位')
      return
    }

    if (password !== confirmPassword) {
      toast.error(t.auth.password_not_match || '两次输入的密码不一致')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          code,
          name: name || email.split('@')[0]
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // 解析后端错误信息
        const errorMessage = data.error || data.message || '注册失败'
        const translatedError = translateError(errorMessage)

        console.error('[Register] 注册失败:', {
          originalError: errorMessage,
          translatedError: translatedError,
          status: response.status
        })

        toast.error(translatedError)
        return
      }

      toast.success(t.auth.register_success || '注册成功')

      // 注意：不再手动操作 localStorage，完全依赖 Supabase 官方认证机制
      // Supabase 会自动将 session 存储在浏览器中

      // 跳转到首页
      setTimeout(() => {
        router.push('/')
      }, 1000)

    } catch (error: any) {
      console.error('注册失败:', error)
      // 【修复】确保传入 translateError 的是字符串
      const errorMessage = error?.message || error?.toString() || '注册失败'
      const translatedError = translateError(errorMessage)
      toast.error(translatedError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      <main className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#FDFBF7]/90 backdrop-blur-md rounded-2xl shadow-xl shadow-stone-200/50 p-8 md:p-10">
          <header className="text-center mb-10">
            <h1 className="font-serif text-4xl text-ink-black tracking-wider mb-2">
              {t.auth.register_title}
            </h1>
            <p className="text-sm text-ink-gray/70 font-serif leading-relaxed">
              {t.welcome.slogan}
            </p>
          </header>

          <form
            className="space-y-5"
            onSubmit={handleRegister}
          >
            {/* 昵称（可选） */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-stone-600 font-serif">
                {t.auth.username_label || 'Nickname'} <span className="text-stone-400 text-xs">({t.common?.optional || 'Optional'})</span>
              </label>
              <div className="relative">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.auth.username_label || 'Nickname'}
                  className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none pl-8 pr-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* 邮箱 */}
            <div className="space-y-2">
              <label htmlFor="email" className="sr-only">{t.auth.email_label}</label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder={t.auth.email_label}
                  className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none pl-8 pr-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                  autoComplete="email"
                />
              </div>
              {emailError && (
                <p className="text-xs text-[#C23E32] font-serif">{emailError}</p>
              )}
            </div>

            {/* 验证码 */}
            <div className="space-y-2">
              <label htmlFor="code" className="sr-only">{t.auth.verification_code}</label>
              <div className="relative flex gap-3">
                <div className="relative flex-1">
                  <ShieldCheck className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={t.auth.verification_code}
                    maxLength={6}
                    className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none pl-8 pr-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSendingCode || countdown > 0 || !email || !!emailError}
                  className="px-4 py-2 bg-[#C23E32] text-white text-sm font-serif rounded-lg hover:bg-[#A33428] disabled:bg-ink-gray/30 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {isSendingCode ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : countdown > 0 ? (
                    `${countdown}s`
                  ) : (
                    t.auth.send_code
                  )}
                </button>
              </div>
            </div>

            {/* 密码 */}
            <div className="space-y-2">
              <label htmlFor="password" className="sr-only">{t.auth.password_label}</label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.password_label}
                  className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none pl-8 pr-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* 确认密码 */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="sr-only">{t.auth.confirm_password_label}</label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.auth.confirm_password_label}
                  className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none pl-8 pr-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !code || !password || !confirmPassword}
              className="w-full mt-8 py-3.5 bg-[#C23E32] text-white font-serif text-base tracking-wider rounded-full shadow-md hover:bg-[#A33428] disabled:bg-ink-gray/30 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.auth.registering}
                </>
              ) : (
                t.auth.register_btn
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ink-gray/60 font-serif">
              {t.auth.have_account}
            </p>
            <Link
              href="/auth"
              className="inline-block mt-2 px-6 py-2 bg-stone-100 text-ink-gray rounded-full font-serif text-sm hover:bg-stone-200 transition-colors"
            >
              {t.auth.login_now}
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
