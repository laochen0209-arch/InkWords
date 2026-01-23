"use client"

import { useState } from "react"
import Link from "next/link"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // 获取验证码
  const handleGetCode = () => {
    if (countdown > 0 || !phone) return
    
    // 模拟发送验证码
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
  }

  // 登录
  const handleLogin = async () => {
    if (!phone || !code) return
    setIsLoading(true)
    // 模拟登录
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <>
      {/* Layer 1: 固定背景层 - 水墨山水 */}
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      
      {/* Layer 2: 居中登录卡片 */}
      <main className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#FDFBF7]/90 backdrop-blur-md rounded-2xl shadow-xl shadow-stone-200/50 p-8 md:p-10">
          
          {/* 头部 Logo */}
          <header className="text-center mb-10">
            {/* Logo 与印章 */}
            <div className="relative inline-block">
              <h1 className="font-serif text-4xl text-ink-black tracking-wider">
                墨语
              </h1>
              {/* 红色小印章 */}
              <div 
                className="absolute -top-1 -right-6 w-6 h-6 flex items-center justify-center"
                aria-hidden="true"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-full h-full text-ink-vermilion opacity-80"
                  fill="currentColor"
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
            {/* Slogan */}
            <p className="mt-3 text-sm text-ink-gray font-serif tracking-widest">
              静心修习，日积跬步
            </p>
          </header>

          {/* 表单区域 */}
          <form 
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              handleLogin()
            }}
          >
            {/* 手机号输入 */}
            <div className="space-y-2">
              <label htmlFor="phone" className="sr-only">手机号</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                autoComplete="tel"
              />
            </div>

            {/* 验证码输入 */}
            <div className="space-y-2">
              <label htmlFor="code" className="sr-only">验证码</label>
              <div className="relative">
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="请输入验证码"
                  maxLength={6}
                  className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-3 pr-24 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                  autoComplete="one-time-code"
                />
                {/* 获取验证码按钮 */}
                <button
                  type="button"
                  onClick={handleGetCode}
                  disabled={countdown > 0 || !phone}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-sm font-serif text-ink-vermilion hover:text-ink-vermilion/80 disabled:text-ink-gray/40 disabled:cursor-not-allowed transition-colors"
                >
                  {countdown > 0 ? `${countdown}s` : "获取验证码"}
                </button>
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={!phone || !code || isLoading}
              className="w-full mt-8 py-3.5 bg-ink-vermilion text-white font-serif text-base tracking-wider rounded-full shadow-md shadow-ink-vermilion/20 hover:bg-ink-vermilion/90 disabled:bg-ink-gray/30 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? "登录中..." : "登录"}
            </button>
          </form>

          {/* 底部辅助链接 */}
          <footer className="mt-8 flex items-center justify-center gap-4 text-xs text-ink-gray/60">
            <button 
              type="button"
              className="hover:text-ink-gray transition-colors font-serif"
            >
              微信一键登录
            </button>
            <span className="text-stone-300">|</span>
            <Link 
              href="/"
              className="hover:text-ink-gray transition-colors font-serif"
            >
              先逛一逛
            </Link>
          </footer>

          {/* 用户协议 */}
          <p className="mt-6 text-center text-xs text-ink-gray/40 font-serif leading-relaxed">
            登录即表示同意
            <button type="button" className="underline underline-offset-2 hover:text-ink-gray/60 transition-colors">用户协议</button>
            与
            <button type="button" className="underline underline-offset-2 hover:text-ink-gray/60 transition-colors">隐私政策</button>
          </p>
        </div>
      </main>
    </>
  )
}
