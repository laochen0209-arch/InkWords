"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { User, Settings, Bell, Moon, LogOut, ChevronRight, Lock, ShieldCheck, X, Loader2 } from "lucide-react"
import { BottomNavBar } from "@/components/library/bottom-nav-bar"
import { useToast } from "@/components/ink-toast/toast-context"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

type TabType = "home" | "practice" | "library" | "profile" | "study" | "checkin"

/**
 * 设置页面组件
 * 
 * 功能：
 * - 账号设置
 * - 密码修改
 * - 通知设置
 * - 学习设置
 * - 外观设置
 * - 关于页面
 * - 退出登录
 */
export default function SettingsPage() {
  const router = useRouter()
  const toast = useToast()
  const { learningMode } = useLanguage()
  const t = TRANSLATIONS[learningMode]
  
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("profile")
  
  // 修改密码相关状态
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // 设置项配置
  const settingsItems = [
    {
      id: "account",
      icon: User,
      title: t.settings.items.account.title,
      description: t.settings.items.account.description,
    },
    {
      id: "password",
      icon: Lock,
      title: t.settings.items.password.title,
      description: t.settings.items.password.description,
    },
    {
      id: "notification",
      icon: Bell,
      title: t.settings.items.notification.title,
      description: t.settings.items.notification.description,
    },
    {
      id: "study",
      icon: Settings,
      title: t.settings.items.study.title,
      description: t.settings.items.study.description,
    },
    {
      id: "appearance",
      icon: Moon,
      title: t.settings.items.appearance.title,
      description: t.settings.items.appearance.description,
    },
    {
      id: "about",
      icon: User,
      title: t.settings.items.about.title,
      description: t.settings.items.about.description,
    },
  ]

  // 获取当前用户邮箱
  useEffect(() => {
    const userStr = localStorage.getItem("inkwords_user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserEmail(user.email || "")
      } catch (e) {
        console.error("解析用户信息失败:", e)
      }
    }
  }, [])

  const handleLogout = async () => {
    if (confirm(t.auth.logoutConfirm)) {
      // 调用 Supabase 官方登出方法
      await supabase.auth.signOut()
      // 注意：不再手动操作 localStorage，Supabase 会自动清理会话
      router.push("/auth")
    }
  }

  const handleSettingClick = (id: string) => {
    if (id === "password") {
      setShowChangePassword(true)
    } else if (id === "home" || id === "practice" || id === "library" || id === "profile") {
      setActiveTab(id as "home" | "practice" | "library" | "profile")
    }
  }

  // ==================== 修改密码功能 ====================

  // 发送验证码
  const handleSendCode = async () => {
    if (!userEmail) {
      toast.error(t.auth.email_invalid)
      return
    }

    if (countdown > 0) return

    setIsSendingCode(true)
    try {
      const response = await fetch('/api/change-password/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(t.auth.code_sent)
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
        console.error("发送验证码失败:", data)
        toast.error(data.error || t.auth.send_code)
      }
    } catch (error) {
      console.error('发送验证码失败:', error)
      toast.error(t.auth.send_code)
    } finally {
      setIsSendingCode(false)
    }
  }

  // 提交修改密码
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode || !newPassword || !confirmPassword) {
      toast.error(t.auth.fill_all_fields)
      return
    }

    if (newPassword.length < 6) {
      toast.error(t.auth.password_too_short)
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error(t.auth.password_not_match)
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/change-password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          code: verificationCode,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(t.settings.changePassword.title + ' ' + t.common.success)
        
        // 关闭弹窗并重置状态
        setShowChangePassword(false)
        setVerificationCode('')
        setNewPassword('')
        setConfirmPassword('')
        setCountdown(0)
      } else {
        console.error("修改密码失败:", data)
        toast.error(data.error || t.settings.changePassword.title)
      }
    } catch (error) {
      console.error('修改密码失败:', error)
      toast.error(t.settings.changePassword.title)
    } finally {
      setIsChangingPassword(false)
    }
  }

  // 关闭修改密码弹窗
  const closeChangePassword = () => {
    setShowChangePassword(false)
    setVerificationCode('')
    setNewPassword('')
    setConfirmPassword('')
    setCountdown(0)
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      
      <main className="relative z-10 min-h-screen overflow-y-auto">
        <div className="w-full min-h-screen bg-[#FDFBF7]/70 pt-14 pb-8 md:bg-transparent md:min-h-0 md:max-w-2xl md:mx-auto md:my-8 md:rounded-xl md:shadow-[0_4px_20px_rgba(43,43,43,0.08)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="px-4 py-8"
          >
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl text-ink-black mb-2">
                {t.settings.title}
              </h1>
              <p className="text-sm text-ink-gray/70 font-serif">
                {t.settings.subtitle}
              </p>
            </div>

            <div className="space-y-3">
              {settingsItems.map((item) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  onClick={() => handleSettingClick(item.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4",
                    "bg-[#FDFBF7]/90 backdrop-blur-sm",
                    "border border-stone-200/30",
                    "rounded-xl",
                    "transition-all duration-300",
                    "hover:border-stone-300/50 hover:shadow-md",
                    activeTab === item.id && "border-[#C23E32] shadow-[0_4px_20px_rgba(194,62,50,0.15)]"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 flex items-center justify-center",
                    "rounded-full",
                    "bg-gradient-to-br from-stone-100/60 to-stone-200/80",
                    "transition-all duration-300",
                    activeTab === item.id && "bg-[#C23E32]/20"
                  )}
                  >
                    <item.icon className="w-6 h-6 text-ink-gray/70" strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h3 className="font-serif text-lg text-ink-black font-semibold mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-ink-gray/70 font-serif">
                      {item.description}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-ink-gray/40" strokeWidth={1.5} />
                </motion.button>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 pt-6 border-t border-stone-200/30"
            >
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-ink-gray hover:text-ink-vermilion transition-colors"
              >
                <LogOut className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-serif text-base">
                  {t.auth.logout}
                </span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </main>
      
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 修改密码弹窗 */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeChangePassword}
          />
          
          {/* 弹窗内容 */}
          <div className="relative w-full max-w-md bg-[#FDFBF7] rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            {/* 关闭按钮 */}
            <button
              onClick={closeChangePassword}
              className="absolute right-4 top-4 text-ink-gray/50 hover:text-ink-gray transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 标题 */}
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl text-ink-black tracking-wider">
                {t.settings.changePassword.title}
              </h2>
              <p className="mt-2 text-sm text-ink-gray/70 font-serif">
                {t.settings.changePassword.subtitle}
              </p>
            </div>

            <form 
              className="space-y-5"
              onSubmit={handleChangePassword}
            >
              {/* 当前邮箱（只读） */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-600 font-serif">
                  {t.settings.changePassword.currentEmail}
                </label>
                <div className="relative">
                  <User className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
                  <input
                    type="email"
                    value={userEmail}
                    readOnly
                    className="w-full bg-stone-100 border-0 border-b border-stone-300 rounded-none pl-8 pr-0 py-3 text-ink-gray font-serif cursor-not-allowed"
                  />
                </div>
              </div>

              {/* 验证码 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-600 font-serif">
                  {t.settings.changePassword.verificationCode}
                </label>
                <div className="relative flex gap-3">
                  <div className="relative flex-1">
                    <ShieldCheck className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder={t.settings.changePassword.codePlaceholder}
                      maxLength={6}
                      className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none pl-8 pr-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || !userEmail || isSendingCode}
                    className="px-4 py-2 bg-[#C23E32] text-white text-sm font-serif rounded-lg hover:bg-[#A33428] disabled:bg-ink-gray/30 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {isSendingCode ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : countdown > 0 ? (
                      `${countdown}s`
                    ) : (
                      t.settings.changePassword.sendCode
                    )}
                  </button>
                </div>
              </div>

              {/* 新密码 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-600 font-serif">
                  {t.settings.changePassword.newPassword}
                </label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t.settings.changePassword.passwordPlaceholder}
                    className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none pl-8 pr-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* 确认新密码 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-600 font-serif">
                  {t.settings.changePassword.confirmPassword}
                </label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/50" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.settings.changePassword.confirmPlaceholder}
                    className="w-full bg-transparent border-0 border-b border-stone-300 rounded-none pl-8 pr-0 py-3 text-ink-black font-serif placeholder:text-ink-gray/50 focus:outline-none focus:border-ink-vermilion focus:ring-0 transition-colors"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* 按钮组 */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={!verificationCode || !newPassword || !confirmPassword || isChangingPassword}
                  className="w-full py-3.5 bg-[#C23E32] text-white font-serif text-base tracking-wider rounded-full shadow-md hover:bg-[#A33428] disabled:bg-ink-gray/30 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.common.processing}
                    </>
                  ) : (
                    t.settings.changePassword.confirmChange
                  )}
                </button>

                <button
                  type="button"
                  onClick={closeChangePassword}
                  className="w-full py-3 text-sm text-ink-gray/60 font-serif hover:text-ink-gray transition-colors"
                >
                  {t.settings.changePassword.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
