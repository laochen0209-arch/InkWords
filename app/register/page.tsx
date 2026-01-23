"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ink-toast/toast-context"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

export default function RegisterPage() {
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const { learningMode } = useLanguage()

  const t = TRANSLATIONS[learningMode]

  const handleGetCode = async () => {
    if (countdown > 0 || !phone) return
    
    setIsSendingCode(true)
    try {
      const response = await fetch('/api/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (response.status === 200) {
        toast.success('验证码已发送，请查看控制台')
        console.log('='.repeat(50))
        console.log('📱 前端提示：验证码已发送')
        console.log('🔑 请在服务器控制台查看验证码')
        console.log('='.repeat(50))
        
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        toast.error(data.error || '发送验证码失败')
      }
    } catch (error) {
      console.error('发送验证码失败:', error)
      toast.error('发送验证码失败')
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!phone || !code) {
      toast.error(t.auth.email_label + "和" + t.auth.password_label + "不能为空")
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: phone,
          password: code,
        }),
      })

      const data = await response.json()

      if (response.status === 200) {
        toast.success(t.auth.register_btn + "成功")
        
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("inkwords_user", JSON.stringify(data.user))
        
        setTimeout(() => {
          window.location.href = "/study"
        }, 500)
      } else {
        console.error("注册失败:", data)
        toast.error(data.error || t.auth.register_btn + "失败")
      }
    } catch (error) {
      console.error("注册失败:", error)
      toast.error(t.auth.register_btn + "失败")
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
            className="space-y-6"
            onSubmit={handleRegister}
          >
            <div className="space-y-2">
              <label htmlFor="phone" className="sr-only">{t.auth.email_label}</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.auth.email_label}
                className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="code" className="sr-only">{t.auth.password_label}</label>
              <div className="relative">
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t.auth.password_label}
                  maxLength={6}
                  className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-3 pr-24 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                  autoComplete="one-time-code"
                />
                <button
                  type="button"
                  onClick={handleGetCode}
                  disabled={countdown > 0 || !phone || isSendingCode}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-sm font-serif text-ink-vermilion hover:text-ink-vermilion/80 disabled:text-ink-gray/40 disabled:cursor-not-allowed transition-colors"
                >
                  {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!phone || !code || isLoading}
              className="w-full mt-8 py-3.5 bg-[#C23E32] text-white font-serif text-base tracking-wider rounded-full shadow-md hover:bg-[#A33428] disabled:bg-ink-gray/30 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? t.auth.register_btn + "..." : t.auth.register_btn}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-ink-gray/60 font-serif">
              {t.auth.have_account}
            </p>
            <Link 
              href="/login"
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
