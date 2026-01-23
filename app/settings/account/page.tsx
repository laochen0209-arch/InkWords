"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Camera, Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ink-toast/toast-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { getLanguageSettings, NativeLang } from "@/lib/language-utils"
import { getUserData } from "@/lib/user-data"

interface AccountPageProps {
  nativeLang?: NativeLang
}

const UI_TEXT = {
  zh: {
    pageTitle: "账号设置",
    avatarSection: "头像设置",
    avatarDesc: "点击头像可更换您的个人头像",
    nicknameSection: "昵称",
    nicknamePlaceholder: "请输入昵称",
    cancel: "取消",
    save: "保存",
    phoneSection: "手机号",
    phonePlaceholder: "请输入手机号",
    phoneBound: "已绑定",
    phoneUnbound: "未绑定",
    bindPhone: "点击绑定手机号",
    phoneDesc: "绑定手机号可用于账号安全验证和重要通知",
    securityTip: "为了保障您的账号安全，建议定期修改密码并绑定手机号。如遇到账号异常，请及时联系客服。",
    toastNicknameSuccess: "昵称修改成功",
    toastAvatarSuccess: "头像更新成功",
    toastPhoneSuccess: "手机号绑定成功",
    toastPhoneError: "请输入正确的手机号",
  },
  en: {
    pageTitle: "Account Settings",
    avatarSection: "Avatar",
    avatarDesc: "Click avatar to change your profile picture",
    nicknameSection: "Nickname",
    nicknamePlaceholder: "Enter nickname",
    cancel: "Cancel",
    save: "Save",
    phoneSection: "Phone Number",
    phonePlaceholder: "Enter phone number",
    phoneBound: "Bound",
    phoneUnbound: "Unbound",
    bindPhone: "Click to bind phone",
    phoneDesc: "Binding phone number can be used for account security verification and important notifications",
    securityTip: "To protect your account security, we recommend changing your password regularly and binding your phone number. If you encounter any account issues, please contact customer service immediately.",
    toastNicknameSuccess: "Nickname updated successfully",
    toastAvatarSuccess: "Avatar updated successfully",
    toastPhoneSuccess: "Phone number bound successfully",
    toastPhoneError: "Please enter a valid phone number",
  },
}

export default function AccountPage({ nativeLang: propNativeLang }: AccountPageProps) {
  const router = useRouter()
  const toast = useToast()
  const { updateUserProfile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentLang, setCurrentLang] = useState<NativeLang>(propNativeLang || "zh")

  const [nickname, setNickname] = useState("")
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [isPhoneBound, setIsPhoneBound] = useState(true)
  const [phoneInput, setPhoneInput] = useState("")
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState("")

  useEffect(() => {
    const settings = getLanguageSettings()
    setCurrentLang(settings.nativeLang)
  }, [])

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

  const t = UI_TEXT[currentLang]

  const handleBack = () => {
    router.push("/profile")
  }

  const handleNicknameEdit = () => {
    setIsEditingNickname(true)
  }

  const handleNicknameSave = () => {
    console.log('[Account Settings] 保存昵称:', nickname)
    updateUserProfile({ name: nickname })
    setIsEditingNickname(false)
    toast.success(t.toastNicknameSuccess)
  }

  const handleNicknameCancel = () => {
    const userData = getUserData()
    setNickname(userData.nickname)
    setIsEditingNickname(false)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        console.log('[Account Settings] 保存头像:', base64)
        setAvatarUrl(base64)
        updateUserProfile({ avatar: base64 })
        toast.success(t.toastAvatarSuccess)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhoneBind = () => {
    if (isPhoneBound) {
      setIsEditingPhone(true)
      setPhoneInput(phoneInput.replace(/\*/g, ""))
    } else {
      setIsEditingPhone(true)
      setPhoneInput("")
    }
  }

  const handlePhoneSave = () => {
    if (phoneInput.length === 11) {
      const maskedPhone = phoneInput.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2$3")
      setPhoneInput(maskedPhone)
      setIsPhoneBound(true)
      setIsEditingPhone(false)
      toast.success(t.toastPhoneSuccess)
    } else {
      toast.error(t.toastPhoneError)
    }
  }

  const handlePhoneCancel = () => {
    setIsEditingPhone(false)
    setPhoneInput("")
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
            {/* 顶部导航栏 */}
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

            {/* 内容区域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="px-4 py-6 space-y-6"
            >
              {/* 头像设置区块 */}
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
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="relative group"
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
                          墨
                        </span>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center transition-opacity duration-200"
                    >
                      <Camera className="w-6 h-6 text-white" strokeWidth={1.5} />
                    </motion.div>
                  </button>
                  <div className="flex-1">
                    <h2 className="text-lg font-serif font-semibold text-ink-black mb-1">
                      {t.avatarSection}
                    </h2>
                    <p className="text-sm text-ink-gray/60 font-sans break-words w-full">
                      {t.avatarDesc}
                    </p>
                  </div>
                </motion.div>
              </section>

              {/* 昵称设置区块 */}
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
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#C23E32] text-white hover:bg-[#A8352B] transition-colors font-serif text-sm font-medium"
                      >
                        {t.save}
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
                      {nickname}
                    </span>
                    <ChevronRight className="w-5 h-5 text-ink-gray/40 flex-shrink-0" strokeWidth={1.5} />
                  </motion.button>
                )}
              </section>

              {/* 手机号绑定区块 */}
              <section className="bg-[#FDFBF7] rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-serif font-semibold text-ink-black mb-4">
                  {t.phoneSection}
                </h2>
                {isEditingPhone ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      maxLength={11}
                      className="w-full px-4 py-3 rounded-xl border-2 border-stone-200/50 focus:border-[#C23E32] focus:outline-none transition-colors bg-white text-ink-black font-serif text-base"
                      placeholder={t.phonePlaceholder}
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handlePhoneCancel}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200/50 text-ink-gray hover:bg-stone-50 transition-colors font-serif text-sm"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={handlePhoneSave}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#C23E32] text-white hover:bg-[#A8352B] transition-colors font-serif text-sm font-medium"
                      >
                        {t.save}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handlePhoneBind}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="w-full p-4 rounded-xl border-2 border-stone-200/50 hover:border-stone-300/80 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {isPhoneBound && (
                        <div className="w-5 h-5 rounded-full bg-[#C23E32] flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                        </div>
                      )}
                      <div className="flex flex-col items-start">
                        <span className="text-base font-serif text-ink-black break-words w-full">
                          {isPhoneBound ? phoneInput : t.phoneUnbound}
                        </span>
                        <span className="text-sm text-ink-gray/60 font-sans mt-1 break-words w-full">
                          {isPhoneBound ? t.phoneBound : t.bindPhone}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-ink-gray/40 flex-shrink-0" strokeWidth={1.5} />
                  </motion.button>
                )}
              </section>

              {/* 账号安全提示 */}
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
