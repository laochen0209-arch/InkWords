"use client"

/**
 * @file settings/account/page.tsx
 * @description 账号设置页面 - 管理用户资料、邮箱和密码
 * @author InkWords Team
 * @date 2026-02-18
 * 
 * 功能说明：
 * - 修改昵称
 * - 更换头像
 * - 绑定/更换邮箱
 * - 修改密码
 * - 完善的错误处理和超时保护
 */

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Camera, Check, ChevronRight, Lock, Eye, EyeOff, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ink-toast/toast-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { getLanguageSettings, NativeLang } from "@/lib/language-utils"

interface AccountPageProps {
  nativeLang?: NativeLang
}

const UI_TEXT = {
  zh: {
    pageTitle: "账号设置",
    avatarSection: "头像设置",
    avatarDesc: "点击头像上传新图片",
    avatarDisabled: "支持 JPG、PNG 格式，最大 2MB",
    nicknameSection: "昵称",
    nicknamePlaceholder: "请输入昵称",
    cancel: "取消",
    save: "保存",
    emailSection: "邮箱",
    currentEmail: "当前邮箱",
    newEmailPlaceholder: "请输入新邮箱",
    sendCode: "发送验证码",
    resendCode: "重新发送",
    codePlaceholder: "请输入6位验证码",
    confirmBind: "确认绑定",
    changeEmail: "更换邮箱",
    emailBound: "已绑定",
    emailUnbound: "未绑定",
    bindEmail: "点击绑定邮箱",
    invalidEmail: "请输入正确的邮箱格式",
    codeSent: "验证码已发送",
    emailBindSuccess: "邮箱更换成功",
    codeError: "验证码错误",
    securityTip: "为了保障您的账号安全，建议定期修改密码并绑定邮箱。如遇到账号异常，请及时联系客服。",
    toastNicknameSuccess: "昵称修改成功",
    toastAvatarSuccess: "头像更新成功",
    passwordSection: "修改密码",
    currentPassword: "当前密码",
    newPassword: "新密码",
    confirmPassword: "确认新密码",
    currentPasswordPlaceholder: "请输入当前密码",
    newPasswordPlaceholder: "请输入新密码（至少6位）",
    confirmPasswordPlaceholder: "请再次输入新密码",
    changePassword: "修改密码",
    passwordChangeSuccess: "密码修改成功",
    passwordChangeFailed: "密码修改失败",
    passwordMismatch: "两次输入的密码不一致",
    passwordTooShort: "密码长度至少为6位",
    wrongPassword: "当前密码错误",
    timeout: "请求超时，请稍后重试",
    saving: "保存中...",
    loading: "加载中...",
    notLoggedIn: "未登录，请先登录",
  },
  en: {
    pageTitle: "Account Settings",
    avatarSection: "Avatar",
    avatarDesc: "Click avatar to upload new image",
    avatarDisabled: "JPG, PNG supported, max 2MB",
    nicknameSection: "Nickname",
    nicknamePlaceholder: "Enter nickname",
    cancel: "Cancel",
    save: "Save",
    emailSection: "Email",
    currentEmail: "Current Email",
    newEmailPlaceholder: "Enter new email",
    sendCode: "Send Code",
    resendCode: "Resend",
    codePlaceholder: "Enter 6-digit code",
    confirmBind: "Confirm",
    changeEmail: "Change Email",
    emailBound: "Bound",
    emailUnbound: "Unbound",
    bindEmail: "Click to bind email",
    invalidEmail: "Please enter a valid email",
    codeSent: "Verification code sent",
    emailBindSuccess: "Email changed successfully",
    codeError: "Invalid verification code",
    securityTip: "To protect your account security, we recommend changing your password regularly and binding your email. If you encounter any account issues, please contact customer service immediately.",
    toastNicknameSuccess: "Nickname updated successfully",
    toastAvatarSuccess: "Avatar updated successfully",
    passwordSection: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    currentPasswordPlaceholder: "Enter current password",
    newPasswordPlaceholder: "Enter new password (at least 6 characters)",
    confirmPasswordPlaceholder: "Enter new password again",
    changePassword: "Change Password",
    passwordChangeSuccess: "Password changed successfully",
    passwordChangeFailed: "Failed to change password",
    passwordMismatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 6 characters",
    wrongPassword: "Current password is incorrect",
    timeout: "Request timeout, please try again later",
    saving: "Saving...",
    loading: "Loading...",
    notLoggedIn: "Please login first",
  },
}

/**
 * 带超时的 fetch 工具函数
 */
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 10000) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('timeout')
    }
    throw error
  }
}

export default function AccountPage({ nativeLang: propNativeLang }: AccountPageProps) {
  const router = useRouter()
  const toast = useToast()
  const { updateUserProfile, user: authUser, refreshSession, isAuthenticated } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentLang, setCurrentLang] = useState<NativeLang>(propNativeLang || "zh")

  const [nickname, setNickname] = useState("")
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [isSavingNickname, setIsSavingNickname] = useState(false)
  const [email, setEmail] = useState("")
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const t = UI_TEXT[currentLang]

  // 【修复】优化初始化逻辑，优先使用 authUser
  useEffect(() => {
    const settings = getLanguageSettings()
    setCurrentLang(settings.nativeLang)

    // 优先从 authUser 获取数据
    if (authUser) {
      setNickname(authUser.name || "")
      setEmail(authUser.email || "")
      setAvatarUrl(authUser.avatar || "")
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [authUser])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "inkwords_native_lang") {
        const newLang = (e.newValue as NativeLang) || "zh"
        setCurrentLang(newLang)
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleBack = () => {
    router.push("/profile")
  }

  const handleNicknameEdit = () => {
    setIsEditingNickname(true)
  }

  const handleNicknameSave = async () => {
    console.log('[Account Settings] 保存昵称:', nickname)

    const userId = authUser?.id
    if (!userId) {
      toast.error(t.notLoggedIn)
      return
    }

    setIsSavingNickname(true)

    try {
      const response = await fetchWithTimeout('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: nickname }),
      }, 15000)

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || (currentLang === 'zh' ? '保存失败' : 'Save failed'))
        return
      }

      const data = await response.json()

      // 【修复】更新前端状态
      updateUserProfile({ name: nickname })

      setIsEditingNickname(false)
      toast.success(t.toastNicknameSuccess)
    } catch (error: any) {
      console.error('[Account Settings] 保存昵称失败:', error)
      if (error.message === 'timeout') {
        toast.error(t.timeout)
      } else {
        toast.error(currentLang === 'zh' ? '保存失败' : 'Save failed')
      }
    } finally {
      setIsSavingNickname(false)
    }
  }

  const handleNicknameCancel = () => {
    // 恢复原始值
    if (authUser) {
      setNickname(authUser.name || "")
    }
    setIsEditingNickname(false)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error(currentLang === 'zh' ? '请选择图片文件' : 'Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(currentLang === 'zh' ? '图片大小不能超过 2MB' : 'Image size must be less than 2MB')
      return
    }

    const userId = authUser?.id
    if (!userId) {
      toast.error(t.notLoggedIn)
      return
    }

    setIsUploadingAvatar(true)

    try {
      toast.info(currentLang === 'zh' ? '正在上传头像...' : 'Uploading avatar...')

      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string

        try {
          const response = await fetchWithTimeout('/api/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, avatar: base64 }),
          }, 30000)

          if (!response.ok) {
            const data = await response.json()
            toast.error(data.error || (currentLang === 'zh' ? '上传失败' : 'Upload failed'))
            return
          }

          const data = await response.json()

          // 【修复】立即更新前端状态，确保头像显示
          setAvatarUrl(base64)
          updateUserProfile({ avatar: base64 })

          toast.success(t.toastAvatarSuccess)
        } catch (error: any) {
          console.error('[Account Settings] 头像上传失败:', error)
          if (error.message === 'timeout') {
            toast.error(t.timeout)
          } else {
            toast.error(currentLang === 'zh' ? '上传失败' : 'Upload failed')
          }
        } finally {
          setIsUploadingAvatar(false)
        }
      }
      reader.readAsDataURL(file)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleChangeEmail = () => {
    setIsEditingEmail(true)
    setNewEmail("")
    setVerificationCode("")
    setIsCodeSent(false)
    setCountdown(0)
  }

  const handleEmailCancel = () => {
    setIsEditingEmail(false)
    setNewEmail("")
    setVerificationCode("")
    setIsCodeSent(false)
    setCountdown(0)
  }

  const handleSendCode = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      toast.error(t.invalidEmail)
      return
    }

    try {
      const response = await fetchWithTimeout('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, type: 'change_email' })
      }, 15000)

      if (response.ok) {
        setIsCodeSent(true)
        setCountdown(60)
        toast.success(t.codeSent)
      } else {
        const data = await response.json()
        toast.error(data.error || (currentLang === 'zh' ? '发送失败' : 'Send failed'))
      }
    } catch (error: any) {
      console.error('[Account Settings] 发送验证码失败:', error)
      if (error.message === 'timeout') {
        toast.error(t.timeout)
      } else {
        toast.error(currentLang === 'zh' ? '网络错误' : 'Network error')
      }
    }
  }

  const handleVerifyAndBind = async () => {
    if (verificationCode.length !== 6) {
      toast.error(t.codeError)
      return
    }

    try {
      const response = await fetchWithTimeout('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          code: verificationCode,
          type: 'change_email'
        })
      }, 15000)

      if (response.ok) {
        setEmail(newEmail)
        setIsEditingEmail(false)
        setNewEmail("")
        setVerificationCode("")
        setIsCodeSent(false)
        toast.success(t.emailBindSuccess)
      } else {
        const data = await response.json()
        toast.error(data.error || t.codeError)
      }
    } catch (error: any) {
      console.error('[Account Settings] 验证邮箱失败:', error)
      if (error.message === 'timeout') {
        toast.error(t.timeout)
      } else {
        toast.error(currentLang === 'zh' ? '网络错误' : 'Network error')
      }
    }
  }

  const handleChangePassword = () => {
    setIsEditingPassword(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handlePasswordCancel = () => {
    setIsEditingPassword(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(currentLang === 'zh' ? '请填写所有密码字段' : 'Please fill in all password fields')
      return
    }

    if (newPassword.length < 6) {
      toast.error(t.passwordTooShort)
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error(t.passwordMismatch)
      return
    }

    const userId = authUser?.id
    if (!userId) {
      toast.error(t.notLoggedIn)
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetchWithTimeout('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
        }),
      }, 20000)

      const data = await response.json()

      if (response.ok) {
        toast.success(t.passwordChangeSuccess)
        setIsEditingPassword(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(data.error || t.passwordChangeFailed)
      }
    } catch (error: any) {
      console.error('[Account Settings] 修改密码失败:', error)
      if (error.message === 'timeout') {
        toast.error(t.timeout)
      } else {
        toast.error(t.passwordChangeFailed)
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  // 【新增】加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink-paper flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-ink-vermilion border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-ink-gray font-serif">{t.loading}</p>
        </div>
      </div>
    )
  }

  // 【新增】未登录提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ink-paper flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-ink-gray font-serif mb-4">{t.notLoggedIn}</p>
          <button
            onClick={() => router.push('/auth')}
            className="px-6 py-2 bg-ink-vermilion text-white rounded-lg font-serif hover:bg-ink-vermilion/80 transition-colors"
          >
            {currentLang === 'zh' ? '去登录' : 'Login'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      
      <main className="relative z-10 min-h-screen overflow-y-auto">
        <div className="pb-8">
          <div className="w-full max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-4 px-4 py-4 bg-[#FDFBF7]/80 backdrop-blur-sm sticky top-0 z-20"
            >
              <button
                type="button"
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-black/5 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-ink-black" strokeWidth={1.5} />
              </button>
              <h1 className="text-xl font-serif font-semibold text-ink-black">
                {t.pageTitle}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="px-4 py-6 space-y-6"
            >
              <section className="bg-[#FDFBF7] rounded-2xl p-6 shadow-sm border border-gray-100">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex items-center gap-6"
                >
                  <div
                    className="relative group cursor-pointer"
                    onClick={handleAvatarClick}
                    title={t.avatarDesc}
                  >
                    {avatarUrl ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden shadow-[0_4px_16px_rgba(194,62,50,0.3)]">
                        <img
                          src={avatarUrl}
                          alt={t.avatarSection}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C23E32] to-[#A8352B] flex items-center justify-center shadow-[0_4px_16px_rgba(194,62,50,0.3)]">
                        <span className="text-3xl font-serif text-white font-bold">
                          {nickname ? nickname.charAt(0) : '墨'}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploadingAvatar ? (
                        <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Camera className="w-6 h-6 text-white" strokeWidth={1.5} />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-serif font-semibold text-ink-black mb-1">
                      {t.avatarSection}
                    </h2>
                    <p className="text-sm text-ink-gray/60 font-sans break-words w-full">
                      {t.avatarDesc}
                    </p>
                    <p className="text-xs text-ink-vermilion/80 font-sans mt-1">
                      {t.avatarDisabled}
                    </p>
                  </div>
                </motion.div>
              </section>

              <section className="bg-[#FDFBF7] rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-serif font-semibold text-ink-black mb-4">
                  {t.nicknameSection}
                </h2>
                {isEditingNickname ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={20}
                      className="w-full px-4 py-3 rounded-xl border-2 border-stone-200/50 focus:border-[#C23E32] focus:outline-none transition-colors bg-white text-ink-black font-serif text-base"
                      placeholder={t.nicknamePlaceholder}
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleNicknameCancel}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200/50 text-ink-gray hover:bg-stone-50 transition-colors font-serif text-sm"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={handleNicknameSave}
                        disabled={isSavingNickname}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#C23E32] text-white hover:bg-[#A8352B] transition-colors font-serif text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSavingNickname ? t.saving : t.save}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handleNicknameEdit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="w-full p-4 rounded-xl border-2 border-stone-200/50 hover:border-stone-300/80 transition-colors flex items-center justify-between"
                  >
                    <span className="text-base font-serif text-ink-black break-words w-full pr-4">
                      {nickname || (currentLang === 'zh' ? '点击设置昵称' : 'Click to set nickname')}
                    </span>
                    <ChevronRight className="w-5 h-5 text-ink-gray/40 flex-shrink-0" strokeWidth={1.5} />
                  </motion.button>
                )}
              </section>

              <section className="bg-[#FDFBF7] rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-serif font-semibold text-ink-black mb-4">
                  {t.emailSection}
                </h2>
                {isEditingEmail ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {email && (
                      <div className="text-sm text-ink-gray/60">
                        {t.currentEmail}: {email}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-200/50 focus:border-[#C23E32] focus:outline-none transition-colors bg-white text-ink-black font-serif text-base"
                        placeholder={t.newEmailPlaceholder}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={countdown > 0}
                        className={cn(
                          "px-4 py-3 rounded-xl font-serif text-sm whitespace-nowrap transition-colors",
                          countdown > 0 
                            ? "bg-stone-200 text-stone-500 cursor-not-allowed" 
                            : "bg-[#C23E32] text-white hover:bg-[#A8352B]"
                        )}
                      >
                        {countdown > 0 ? `${countdown}s` : (isCodeSent ? t.resendCode : t.sendCode)}
                      </button>
                    </div>
                    
                    {isCodeSent && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-3"
                      >
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          maxLength={6}
                          className="w-full px-4 py-3 rounded-xl border-2 border-stone-200/50 focus:border-[#C23E32] focus:outline-none transition-colors bg-white text-ink-black font-serif text-base tracking-widest text-center"
                          placeholder={t.codePlaceholder}
                        />
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleEmailCancel}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200/50 text-ink-gray hover:bg-stone-50 transition-colors font-serif text-sm"
                          >
                            {t.cancel}
                          </button>
                          <button
                            type="button"
                            onClick={handleVerifyAndBind}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-[#C23E32] text-white hover:bg-[#A8352B] transition-colors font-serif text-sm font-medium"
                          >
                            {t.confirmBind}
                          </button>
                        </div>
                      </motion.div>
                    )}
                    
                    {!isCodeSent && (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleEmailCancel}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200/50 text-ink-gray hover:bg-stone-50 transition-colors font-serif text-sm"
                        >
                          {t.cancel}
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handleChangeEmail}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="w-full p-4 rounded-xl border-2 border-stone-200/50 hover:border-stone-300/80 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {email && (
                        <div className="w-5 h-5 rounded-full bg-[#C23E32] flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                        </div>
                      )}
                      <div className="flex flex-col items-start">
                        <span className="text-base font-serif text-ink-black break-words w-full">
                          {email || t.emailUnbound}
                        </span>
                        <span className="text-sm text-ink-gray/60 font-sans mt-1 break-words w-full">
                          {email ? t.changeEmail : t.bindEmail}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-ink-gray/40 flex-shrink-0" strokeWidth={1.5} />
                  </motion.button>
                )}
              </section>

              <section className="bg-[#FDFBF7] rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-serif font-semibold text-ink-black mb-4">
                  {t.passwordSection}
                </h2>
                {isEditingPassword ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/40" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-stone-200/50 focus:border-[#C23E32] focus:outline-none transition-colors bg-white text-ink-black font-serif text-base"
                        placeholder={t.currentPasswordPlaceholder}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-gray/40 hover:text-ink-gray transition-colors"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/40" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-stone-200/50 focus:border-[#C23E32] focus:outline-none transition-colors bg-white text-ink-black font-serif text-base"
                        placeholder={t.newPasswordPlaceholder}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-gray/40 hover:text-ink-gray transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-gray/40" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-stone-200/50 focus:border-[#C23E32] focus:outline-none transition-colors bg-white text-ink-black font-serif text-base"
                        placeholder={t.confirmPasswordPlaceholder}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-gray/40 hover:text-ink-gray transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handlePasswordCancel}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200/50 text-ink-gray hover:bg-stone-50 transition-colors font-serif text-sm"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={handlePasswordSave}
                        disabled={isChangingPassword}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#C23E32] text-white hover:bg-[#A8352B] transition-colors font-serif text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isChangingPassword ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {t.saving}
                          </span>
                        ) : (
                          t.save
                        )}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handleChangePassword}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="w-full p-4 rounded-xl border-2 border-stone-200/50 hover:border-stone-300/80 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-ink-gray/60" />
                      <span className="text-base font-serif text-ink-black">
                        {t.changePassword}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-ink-gray/40 flex-shrink-0" strokeWidth={1.5} />
                  </motion.button>
                )}
              </section>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="px-4 py-4 bg-[#C23E32]/5 rounded-xl border border-[#C23E32]/20"
              >
                <p className="text-sm text-ink-gray/70 font-sans leading-relaxed break-words w-full">
                  {t.securityTip}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  )
}
