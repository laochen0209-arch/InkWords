"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ArrowRight } from "lucide-react"

/**
 * 登录页
 * 新中式极简登录界面，支持手机号/邮箱登录
 */
export default function AuthPage() {
  const router = useRouter()
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lang, setLang] = useState<"zh" | "en">("zh")

  useEffect(() => {
    const savedLang = localStorage.getItem('pref_lang') as "zh" | "en" | null
    if (savedLang) {
      setLang(savedLang)
    }
  }, [])

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
      back: "返回首页"
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
      back: "Back to Home"
    }
  }

  const t = texts[lang]

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!account || !password) {
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
          email: account,
          password: password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("inkwords_user", JSON.stringify(data.user))
        
        // 等待数据完全保存后再导航
        setTimeout(() => {
          router.push('/check-in')
        }, 1000)
      } else {
        console.error("登录失败:", data)
      }
    } catch (error) {
      console.error("登录失败:", error)
    } finally {
      setIsLoading(false)
    }
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
    </div>
  )
}
