"use client"

import React from "react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showStamp, setShowStamp] = useState(false)

  // 显示印章动画
  useEffect(() => {
    const timer = setTimeout(() => setShowStamp(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // 验证码倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleGetCode = () => {
    if (phone.length >= 11 && countdown === 0) {
      setCountdown(60)
      // 这里可以添加发送验证码的逻辑
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !code) return
    
    setIsLoading(true)
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    // 登录成功后跳转
  }

  const canSubmit = phone.length >= 11 && code.length >= 4

  return (
    <main className="min-h-screen bg-ink-paper ink-landscape-bg">
      {/* 固定背景层 */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />
      
      {/* 主内容区 - 居中显示 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        
        {/* 登录卡片 */}
        <div 
          className={cn(
            "w-full max-w-md",
            "bg-[#FDFBF7]/90 backdrop-blur-md",
            "rounded-2xl",
            "shadow-xl shadow-stone-200/50",
            "p-7 md:p-9"
          )}
        >
          {/* 头部 - Logo 和 Slogan */}
          <header className="text-center mb-8">
            <div className="relative inline-block">
              {/* 品牌名称 */}
              <h1 className="font-serif text-4xl md:text-5xl text-ink-black font-semibold tracking-widest">
                墨语
              </h1>
              
              {/* 红色小印章 - 正圆形实心印章 */}
              <div
                className={cn(
                  "absolute -top-1 -right-8 md:-right-9",
                  "w-6 h-6",
                  "bg-[#C23E32]",
                  "rounded-full",
                  "rotate-12",
                  "flex items-center justify-center",
                  "shadow-sm shadow-red-900/30",
                  "transition-all duration-500",
                  showStamp ? "opacity-100 animate-stamp" : "opacity-0"
                )}
                aria-hidden="true"
              >
                <span className="text-white font-serif text-[10px] font-bold">
                  印
                </span>
              </div>
            </div>
            
            {/* Slogan */}
            <p className="mt-4 text-sm text-ink-gray font-serif tracking-wider">
              静心修习，日积跬步
            </p>
          </header>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 手机号输入 */}
            <div className="space-y-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="请输入手机号"
                className={cn(
                  "w-full py-3 px-1",
                  "bg-transparent",
                  "border-0 border-b-2 border-stone-400",
                  "rounded-none",
                  "text-ink-black font-sans text-base",
                  "placeholder:text-ink-gray/50",
                  "transition-colors duration-300",
                  "focus:outline-none focus:border-[#C23E32]"
                )}
              />
            </div>

            {/* 验证码输入 */}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="请输入验证码"
                  className={cn(
                    "flex-1 py-3 px-1",
                    "bg-transparent",
                    "border-0 border-b-2 border-stone-400",
                    "rounded-none",
                    "text-ink-black font-sans text-base",
                    "placeholder:text-ink-gray/50",
                    "transition-colors duration-300",
                    "focus:outline-none focus:border-[#C23E32]"
                  )}
                />
                
                {/* 获取验证码按钮 */}
                <button
                  type="button"
                  onClick={handleGetCode}
                  disabled={phone.length < 11 || countdown > 0}
                  className={cn(
                    "absolute right-0 bottom-3",
                    "text-sm font-sans",
                    "transition-colors duration-300",
                    phone.length >= 11 && countdown === 0 
                      ? "text-[#C23E32] hover:text-[#A33428] cursor-pointer" 
                      : "text-ink-gray/50 cursor-not-allowed"
                  )}
                >
                  {countdown > 0 ? `${countdown}s 后重发` : "获取验证码"}
                </button>
              </div>
            </div>

            {/* 登录按钮 - 始终显示朱砂红 */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-3.5 mt-6",
                "rounded-full",
                "bg-[#C23E32] text-white",
                "text-base font-serif font-medium tracking-wider",
                "shadow-lg shadow-red-900/20",
                "transition-all duration-300",
                "hover:bg-[#A33428] hover:shadow-xl hover:shadow-red-900/30",
                "active:scale-[0.98]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C23E32] focus-visible:ring-offset-2",
                isLoading && "opacity-80"
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  登录中...
                </span>
              ) : (
                "登录"
              )}
            </button>
          </form>

          {/* 底部辅助操作 */}
          <footer className="mt-8 flex items-center justify-center gap-4 text-xs text-ink-gray/60">
            <button 
              type="button"
              className="hover:text-ink-gray transition-colors duration-200"
            >
              微信一键登录
            </button>
            <span className="text-ink-gray/30">|</span>
            <button 
              type="button"
              className="hover:text-ink-gray transition-colors duration-200"
            >
              先逛一逛
            </button>
          </footer>
        </div>
      </div>
    </main>
  )
}

// 加载动画组件
function LoadingSpinner() {
  return (
    <svg 
      className="animate-spin h-4 w-4" 
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle 
        className="opacity-25" 
        cx="12" cy="12" r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
