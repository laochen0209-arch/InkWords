"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ink-toast/toast-context"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()

  const handleGetCode = () => {
    if (countdown > 0 || !phone) return
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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!phone || !code) {
      toast.error("Please enter phone number and verification code")
      return
    }
    
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("Login successful!")
      
      localStorage.setItem("isLoggedIn", "true")
      
      setTimeout(() => {
        window.location.href = "/study"
      }, 500)
    } catch (error) {
      console.error("Login failed:", error)
      toast.error("Login failed, please try again")
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
            <div className="relative inline-block">
              <h1 className="font-serif text-4xl text-ink-black tracking-wider">
                InkWords
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
                    Ink
                  </text>
                </svg>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-gray font-serif tracking-widest">
              Cultivate with peace, cherish every word
            </p>
          </header>
          
          <form 
            className="space-y-6"
            onSubmit={handleLogin}
          >
            <div className="space-y-2">
              <label htmlFor="phone" className="sr-only">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="code" className="sr-only">Verification Code</label>
              <div className="relative">
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter verification code"
                  maxLength={6}
                  className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none px-0 py-3 pr-24 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                  autoComplete="one-time-code"
                />
                <button
                  type="button"
                  onClick={handleGetCode}
                  disabled={countdown > 0 || !phone}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-sm font-serif text-ink-vermilion hover:text-ink-vermilion/80 disabled:text-ink-gray/40 disabled:cursor-not-allowed transition-colors"
                >
                  {countdown > 0 ? `${countdown}s` : "Get Code"}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!phone || !code || isLoading}
              className="w-full mt-8 py-3.5 bg-[#C23E32] text-white font-serif text-base tracking-wider rounded-full shadow-md hover:bg-[#A33428] disabled:bg-ink-gray/30 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
          
          <footer className="mt-8 flex items-center justify-center gap-4 text-xs text-ink-gray/60">
            <button 
              type="button"
              onClick={() => toast.info("WeChat login in development")}
              className="hover:text-ink-gray transition-colors font-serif"
            >
              WeChat Login
            </button>
            <span className="text-stone-300">|</span>
            <Link 
              href="/"
              className="hover:text-ink-gray transition-colors font-serif"
            >
              Browse First
            </Link>
          </footer>
          
          <p className="mt-6 text-center text-xs text-ink-gray/40 font-serif leading-relaxed">
            Logging in means you agree to
            <button type="button" onClick={() => toast.info("User Agreement")} className="underline underline-offset-2 hover:text-ink-gray/60 transition-colors">User Agreement</button>
            {" "}
            <button type="button" onClick={() => toast.info("Privacy Policy")} className="underline underline-offset-2 hover:text-ink-gray/60 transition-colors">Privacy Policy</button>
          </p>
        </div>
      </main>
    </>
  )
}
