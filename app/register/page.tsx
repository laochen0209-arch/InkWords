"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ink-toast/toast-context"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const { learningMode } = useLanguage()

  const t = TRANSLATIONS[learningMode]

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!username || !email || !password || !confirmPassword) {
      toast.error(t.auth.email_label + " " + t.auth.password_label + " " + t.auth.confirm_password_label)
      return
    }
    
    if (password !== confirmPassword) {
      toast.error(t.auth.password_label + " " + t.auth.confirm_password_label + " " + t.auth.password_label + "不匹配")
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
          email: email,
          password: password,
        }),
      })

      const data = await response.json()

      if (response.status === 200) {
        toast.success(t.auth.register_btn + " " + t.welcome.slogan)
        
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("inkwords_user", JSON.stringify(data.user))
        
        setTimeout(() => {
          window.location.href = "/study"
        }, 500)
      } else {
        console.error("注册失败:", data)
        toast.error(data.error || t.auth.register_btn + " " + t.auth.no_account)
        setIsLoading(false)
      }
    } catch (error) {
      console.error("注册失败:", error)
      toast.error(t.auth.register_btn + " " + t.auth.no_account)
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
              <label htmlFor="username" className="sr-only">{t.auth.username_label}</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.auth.username_label}
                className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="sr-only">{t.auth.email_label}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.email_label}
                className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="sr-only">{t.auth.password_label}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.password_label}
                className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="sr-only">{t.auth.confirm_password_label}</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.auth.confirm_password_label}
                className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={!username || !email || !password || !confirmPassword || isLoading}
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
