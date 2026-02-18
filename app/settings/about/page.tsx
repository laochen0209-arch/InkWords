"use client"

/**
 * @file page.tsx
 * @description 关于墨语页面 - 展示应用信息、联系方式和功能特色
 * @author InkWords Team
 * @date 2026-02-13
 * @version 1.2.0 - 添加用户协议和隐私政策模态框
 */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, 
  Mail, 
  Sparkles, 
  BookOpen, 
  Target, 
  Palette,
  Copy,
  Check,
  MessageCircle,
  X
} from "lucide-react"
import { getLanguageSettings, NativeLang } from "@/lib/language-utils"
import { openTidioChat } from "@/components/tidio-provider"

interface AboutPageProps {
  nativeLang?: NativeLang
}

type ModalType = 'userAgreement' | 'privacyPolicy' | null

const UI_TEXT = {
  zh: {
    pageTitle: "关于墨语",
    appName: "墨语",
    appSubName: "InkWords",
    version: "版本 v1.0.0",
    appDesc: "极简东方美学，沉浸式语言修行",
    appSubDesc: "让学习成为一种生活方式",
    userAgreement: "用户协议",
    privacyPolicy: "隐私政策",
    copyright: "© 2025 墨语 InkWords. All rights reserved.",
    contactTitle: "联系我们",
    contactDesc: "有任何问题或建议？随时与我们联系",
    emailLabel: "官方邮箱",
    emailValue: "inkwords.help@gmail.com",
    copySuccess: "已复制",
    onlineSupport: "在线客服",
    onlineSupportDesc: "实时解答您的疑问",
    featuresTitle: "功能特色",
    features: [
      { icon: Palette, title: "东方美学", desc: "融合传统水墨意境与现代设计" },
      { icon: BookOpen, title: "双语学习", desc: "中英文对照，沉浸式语言体验" },
      { icon: Target, title: "智能追踪", desc: "AI 驱动的个性化学习路径" },
      { icon: Sparkles, title: "文化传承", desc: "在语言学习中感受文化魅力" },
    ],
    // 模态框
    closeModal: "关闭",
    lastUpdated: "最后更新：2025年1月",
  },
  en: {
    pageTitle: "About InkWords",
    appName: "InkWords",
    appSubName: "InkWords",
    version: "Version v1.0.0",
    appDesc: "Minimalist Oriental aesthetics, immersive language practice",
    appSubDesc: "Make learning a lifestyle",
    userAgreement: "User Agreement",
    privacyPolicy: "Privacy Policy",
    copyright: "© 2025 InkWords. All rights reserved.",
    contactTitle: "Contact Us",
    contactDesc: "Have questions or suggestions? Get in touch with us",
    emailLabel: "Official Email",
    emailValue: "inkwords.help@gmail.com",
    copySuccess: "Copied",
    onlineSupport: "Online Support",
    onlineSupportDesc: "Real-time answers to your questions",
    featuresTitle: "Features",
    features: [
      { icon: Palette, title: "Oriental Aesthetics", desc: "Blend of traditional ink painting and modern design" },
      { icon: BookOpen, title: "Bilingual Learning", desc: "Chinese-English comparison, immersive experience" },
      { icon: Target, title: "Smart Tracking", desc: "AI-powered personalized learning paths" },
      { icon: Sparkles, title: "Cultural Heritage", desc: "Experience culture through language learning" },
    ],
    // 模态框
    closeModal: "Close",
    lastUpdated: "Last Updated: January 2025",
  }
}

const AGREEMENT_CONTENT = {
  zh: {
    userAgreement: {
      title: "用户协议",
      sections: [
        {
          title: "一、服务条款",
          content: "欢迎使用墨语（InkWords）语言学习应用。在使用本应用之前，请您仔细阅读本用户协议。使用本应用即表示您同意接受本协议的所有条款和条件。"
        },
        {
          title: "二、用户注册",
          content: "1. 用户需要注册账号才能使用本应用的完整功能。\n2. 用户应提供真实、准确的注册信息。\n3. 用户有责任保护自己的账号安全，不得将账号转让或出借给他人使用。"
        },
        {
          title: "三、使用规范",
          content: "1. 用户不得利用本应用从事任何违法或不当活动。\n2. 用户不得干扰或破坏本应用的正常运行。\n3. 用户不得复制、修改或传播本应用的任何内容，除非获得明确授权。"
        },
        {
          title: "四、知识产权",
          content: "本应用的所有内容，包括但不限于文字、图片、音频、视频、软件等，均受知识产权法律保护。未经授权，任何人不得擅自使用。"
        },
        {
          title: "五、免责声明",
          content: "1. 本应用不保证服务不会中断，对服务的及时性、安全性不作担保。\n2. 对于因使用本应用而产生的任何直接或间接损失，本应用不承担责任。"
        },
        {
          title: "六、协议修改",
          content: "我们保留随时修改本协议的权利。修改后的协议将在应用内公布，用户继续使用本应用即视为接受修改后的协议。"
        },
        {
          title: "七、联系我们",
          content: "如有任何问题，请通过 inkwords.help@gmail.com 与我们联系。"
        }
      ]
    },
    privacyPolicy: {
      title: "隐私政策",
      sections: [
        {
          title: "一、信息收集",
          content: "我们收集以下类型的信息：\n1. 账号信息：邮箱地址、用户名等。\n2. 学习数据：学习进度、练习记录、词汇掌握情况等。\n3. 设备信息：设备类型、操作系统版本等。"
        },
        {
          title: "二、信息使用",
          content: "我们使用收集的信息用于：\n1. 提供个性化学习体验。\n2. 改进产品功能和服务质量。\n3. 发送学习提醒和产品更新通知。\n4. 保障账号安全。"
        },
        {
          title: "三、信息保护",
          content: "1. 我们采用业界标准的安全措施保护您的信息。\n2. 您的数据通过加密传输和存储。\n3. 我们不会向第三方出售您的个人信息。"
        },
        {
          title: "四、信息共享",
          content: "除以下情况外，我们不会与第三方共享您的信息：\n1. 获得您的明确同意。\n2. 法律法规要求。\n3. 保护我们或用户的权益所需。"
        },
        {
          title: "五、用户权利",
          content: "您有权：\n1. 访问和更正您的个人信息。\n2. 删除您的账号和相关数据。\n3. 撤回同意或选择退出某些数据处理活动。"
        },
        {
          title: "六、Cookie 使用",
          content: "我们使用 Cookie 和类似技术来：\n1. 记住您的登录状态。\n2. 分析应用使用情况。\n3. 提供个性化内容。"
        },
        {
          title: "七、政策更新",
          content: "我们可能会不时更新本隐私政策。更新后的政策将在应用内公布，建议您定期查阅。"
        },
        {
          title: "八、联系我们",
          content: "如有任何隐私相关问题，请通过 inkwords.help@gmail.com 与我们联系。"
        }
      ]
    }
  },
  en: {
    userAgreement: {
      title: "User Agreement",
      sections: [
        {
          title: "1. Terms of Service",
          content: "Welcome to InkWords language learning application. Please read this User Agreement carefully before using the application. By using this application, you agree to be bound by all terms and conditions of this agreement."
        },
        {
          title: "2. User Registration",
          content: "1. Users need to register an account to access full features.\n2. Users should provide accurate and truthful registration information.\n3. Users are responsible for protecting their account security and shall not transfer or lend their account to others."
        },
        {
          title: "3. Usage Guidelines",
          content: "1. Users shall not use this application for any illegal or improper activities.\n2. Users shall not interfere with or disrupt the normal operation of this application.\n3. Users shall not copy, modify, or distribute any content of this application without explicit authorization."
        },
        {
          title: "4. Intellectual Property",
          content: "All content of this application, including but not limited to text, images, audio, video, and software, is protected by intellectual property laws. Unauthorized use is prohibited."
        },
        {
          title: "5. Disclaimer",
          content: "1. We do not guarantee uninterrupted service and make no warranties regarding timeliness or security.\n2. We are not liable for any direct or indirect damages arising from the use of this application."
        },
        {
          title: "6. Agreement Modifications",
          content: "We reserve the right to modify this agreement at any time. Modified agreements will be published in the application, and continued use constitutes acceptance of the modified agreement."
        },
        {
          title: "7. Contact Us",
          content: "For any questions, please contact us at inkwords.help@gmail.com."
        }
      ]
    },
    privacyPolicy: {
      title: "Privacy Policy",
      sections: [
        {
          title: "1. Information Collection",
          content: "We collect the following types of information:\n1. Account information: email address, username, etc.\n2. Learning data: progress, practice records, vocabulary mastery, etc.\n3. Device information: device type, OS version, etc."
        },
        {
          title: "2. Information Usage",
          content: "We use collected information to:\n1. Provide personalized learning experience.\n2. Improve product features and service quality.\n3. Send learning reminders and product updates.\n4. Protect account security."
        },
        {
          title: "3. Information Protection",
          content: "1. We employ industry-standard security measures to protect your information.\n2. Your data is encrypted during transmission and storage.\n3. We do not sell your personal information to third parties."
        },
        {
          title: "4. Information Sharing",
          content: "We do not share your information with third parties except:\n1. With your explicit consent.\n2. As required by law.\n3. To protect our rights or the rights of users."
        },
        {
          title: "5. User Rights",
          content: "You have the right to:\n1. Access and correct your personal information.\n2. Delete your account and related data.\n3. Withdraw consent or opt out of certain data processing activities."
        },
        {
          title: "6. Cookie Usage",
          content: "We use cookies and similar technologies to:\n1. Remember your login status.\n2. Analyze application usage.\n3. Provide personalized content."
        },
        {
          title: "7. Policy Updates",
          content: "We may update this privacy policy from time to time. Updated policies will be published in the application. We recommend reviewing it periodically."
        },
        {
          title: "8. Contact Us",
          content: "For any privacy-related questions, please contact us at inkwords.help@gmail.com."
        }
      ]
    }
  }
}

export default function AboutPage({ nativeLang: propNativeLang }: AboutPageProps) {
  const router = useRouter()
  const [currentLang, setCurrentLang] = useState<NativeLang>(propNativeLang || "zh")
  const [copied, setCopied] = useState(false)
  const [modalType, setModalType] = useState<ModalType>(null)

  /**
   * 初始化语言设置
   */
  useEffect(() => {
    const settings = getLanguageSettings()
    setCurrentLang(settings.nativeLang)
  }, [])

  /**
   * 监听语言设置变化
   */
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

  const t = UI_TEXT[currentLang as keyof typeof UI_TEXT]
  const agreementContent = AGREEMENT_CONTENT[currentLang as keyof typeof AGREEMENT_CONTENT]

  const handleBack = () => {
    router.push("/profile")
  }

  /**
   * 复制邮箱到剪贴板
   */
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(t.emailValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("复制失败:", err)
    }
  }

  /**
   * 打开在线客服
   */
  const handleOpenSupport = () => {
    openTidioChat()
  }

  /**
   * 打开模态框
   */
  const openModal = (type: ModalType) => {
    setModalType(type)
  }

  /**
   * 关闭模态框
   */
  const closeModal = () => {
    setModalType(null)
  }

  /**
   * 获取模态框内容
   */
  const getModalContent = () => {
    if (!modalType) return null
    return agreementContent[modalType]
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
              className="px-4 py-12"
            >
              <div className="flex flex-col items-center justify-center space-y-10">
                {/* Logo区域 */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative"
                >
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#C23E32] to-[#A8352B] flex items-center justify-center shadow-[0_8px_32px_rgba(194,62,50,0.3)]">
                    <span className="text-6xl font-serif text-white font-bold">
                      墨
                    </span>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#C23E32]"
                  />
                </motion.div>

                {/* 应用名称 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-center"
                >
                  <h2 className="text-3xl font-serif font-bold text-ink-black mb-2">
                    {t.appName}
                  </h2>
                  <p className="text-base text-ink-gray/70 font-serif break-words w-full">
                    {t.appSubName}
                  </p>
                </motion.div>

                {/* 版本号 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="px-6 py-3 bg-white/80 rounded-full border border-stone-200/50"
                >
                  <p className="text-sm font-sans text-ink-gray/70 break-words w-full">
                    {t.version}
                  </p>
                </motion.div>

                {/* 应用描述 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="max-w-md text-center px-4"
                >
                  <p className="text-base font-serif text-ink-gray/80 leading-relaxed break-words w-full">
                    {t.appDesc}
                  </p>
                  <p className="text-sm text-ink-gray/60 font-sans mt-2 break-words w-full">
                    {t.appSubDesc}
                  </p>
                </motion.div>

                {/* 分隔线 */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="w-full max-w-xs h-px bg-stone-200/50"
                />

                {/* 功能特色 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.65 }}
                  className="w-full max-w-md px-4"
                >
                  <h3 className="text-lg font-serif font-semibold text-ink-black text-center mb-6">
                    {t.featuresTitle}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {t.features.map((feature, index) => {
                      const Icon = feature.icon
                      return (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                          className="p-4 bg-white/80 rounded-xl border border-stone-200/50 hover:border-[#C23E32]/30 hover:bg-[#C23E32]/5 transition-all duration-300 text-center"
                        >
                          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#C23E32]/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-[#C23E32]" strokeWidth={1.5} />
                          </div>
                          <h4 className="text-sm font-serif font-medium text-ink-black mb-1">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-ink-gray/60 font-sans leading-relaxed">
                            {feature.desc}
                          </p>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>

                {/* 分隔线 */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="w-full max-w-xs h-px bg-stone-200/50"
                />

                {/* 联系方式 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.85 }}
                  className="w-full max-w-md px-4"
                >
                  <h3 className="text-lg font-serif font-semibold text-ink-black text-center mb-2">
                    {t.contactTitle}
                  </h3>
                  <p className="text-sm text-ink-gray/60 font-sans text-center mb-6">
                    {t.contactDesc}
                  </p>

                  <div className="space-y-4">
                    {/* 邮箱 */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.9 }}
                      className="flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-stone-200/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#C23E32]/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-[#C23E32]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-ink-gray/50 font-sans mb-0.5">
                          {t.emailLabel}
                        </p>
                        <p className="text-sm font-sans text-ink-black truncate">
                          {t.emailValue}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="p-2 rounded-full hover:bg-[#C23E32]/10 transition-colors flex-shrink-0"
                        title={copied ? t.copySuccess : "Copy"}
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" strokeWidth={2} />
                        ) : (
                          <Copy className="w-4 h-4 text-ink-gray/60" strokeWidth={1.5} />
                        )}
                      </button>
                    </motion.div>

                    {/* 在线客服 */}
                    <motion.button
                      type="button"
                      onClick={handleOpenSupport}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.95 }}
                      className="w-full flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-stone-200/50 hover:border-[#C23E32]/30 hover:bg-[#C23E32]/5 transition-all duration-300 text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#C23E32]/10 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-[#C23E32]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-serif font-medium text-ink-black">
                          {t.onlineSupport}
                        </p>
                        <p className="text-xs text-ink-gray/50 font-sans">
                          {t.onlineSupportDesc}
                        </p>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-ink-gray/40 rotate-180 flex-shrink-0" strokeWidth={1.5} />
                    </motion.button>
                  </div>
                </motion.div>

                {/* 分隔线 */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                  className="w-full max-w-xs h-px bg-stone-200/50"
                />

                {/* 用户协议链接 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.05 }}
                  className="space-y-4 w-full max-w-xs"
                >
                  <button
                    type="button"
                    onClick={() => openModal('userAgreement')}
                    className="w-full px-6 py-3 bg-white/80 rounded-xl border border-stone-200/50 hover:border-[#C23E32]/30 hover:bg-[#C23E32]/5 transition-all duration-300"
                  >
                    <span className="text-sm font-serif text-ink-black break-words w-full">
                      {t.userAgreement}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal('privacyPolicy')}
                    className="w-full px-6 py-3 bg-white/80 rounded-xl border border-stone-200/50 hover:border-[#C23E32]/30 hover:bg-[#C23E32]/5 transition-all duration-300"
                  >
                    <span className="text-sm font-serif text-ink-black break-words w-full">
                      {t.privacyPolicy}
                    </span>
                  </button>
                </motion.div>

                {/* 版权信息 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  className="text-center pt-4"
                >
                  <p className="text-xs text-ink-gray/50 font-sans break-words w-full">
                    {t.copyright}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* 模态框 */}
      <AnimatePresence>
        {modalType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-lg max-h-[80vh] bg-[#FDFBF7] rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 模态框头部 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/50 bg-white/50">
                <h2 className="text-lg font-serif font-semibold text-ink-black">
                  {getModalContent()?.title}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-black/5 transition-colors"
                >
                  <X className="w-5 h-5 text-ink-gray" strokeWidth={1.5} />
                </button>
              </div>

              {/* 模态框内容 */}
              <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
                <p className="text-xs text-ink-gray/50 font-sans mb-4">
                  {t.lastUpdated}
                </p>
                {getModalContent()?.sections.map((section, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <h3 className="text-sm font-serif font-semibold text-ink-black mb-2">
                      {section.title}
                    </h3>
                    <p className="text-sm text-ink-gray/70 font-sans leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* 模态框底部 */}
              <div className="px-6 py-4 border-t border-stone-200/50 bg-white/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full py-3 bg-[#C23E32] text-white font-serif rounded-xl hover:bg-[#A8352B] transition-colors"
                >
                  {t.closeModal}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
