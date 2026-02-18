"use client"

import { useState, useEffect } from "react"
import { Crown, Check, X, Home, Loader2, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { getLanguageSettings, type NativeLang } from "@/lib/language-utils"
import { PRICING_CONFIG } from "@/lib/stripe/config"
import { useToast } from "@/components/ink-toast/toast-context"
import { useAuth, checkIsVip } from "@/lib/contexts/auth-context"

/**
 * 订阅页面组件
 * 支持中英文双语显示
 * 会员用户显示管理订阅入口
 */
export default function SubscriptionPage() {
  const router = useRouter()
  const toast = useToast()
  const { user, isVip, isAuthenticated } = useAuth()
  const [nativeLang, setNativeLang] = useState<NativeLang>("zh")
  const [isLoading, setIsLoading] = useState(false)

  /**
   * UI文本字典
   */
  const UI_TEXT = {
    zh: {
      title: "开通墨语会员",
      subtitle: "选择适合您的订阅方案",
      badge: "超值推荐",
      monthlyLabel: "月度会员",
      yearlyLabel: "年度会员",
      periodMonth: "/ 月",
      periodYear: "/ 年",
      savings: "立省 16%",
      features: {
        unlimited: "无限修习",
        fullLibrary: "词书全库",
        offline: "离线缓存",
        support: "专属客服",
        priority: "优先支持"
      },
      subscribeBtn: "立即订阅",
      processing: "处理中...",
      memberTitle: "您已是尊贵的会员",
      memberSubtitle: "感谢您对墨语的支持",
      manageSubscription: "管理订阅 / 取消订阅",
      expiryLabel: "到期时间",
      backHome: "返回首页",
      loginRequired: "请先登录",
      errorMessage: "创建支付会话失败"
    },
    en: {
      title: "Unlock InkWords Premium",
      subtitle: "Choose the plan that works for you",
      badge: "Best Value",
      monthlyLabel: "Monthly",
      yearlyLabel: "Yearly",
      periodMonth: "/ month",
      periodYear: "/ year",
      savings: "Save 16%",
      features: {
        unlimited: "Unlimited Learning",
        fullLibrary: "Full Vocabulary Library",
        offline: "Offline Access",
        support: "Dedicated Support",
        priority: "Priority Support"
      },
      subscribeBtn: "Subscribe Now",
      processing: "Processing...",
      memberTitle: "You are a Premium Member",
      memberSubtitle: "Thank you for supporting InkWords",
      manageSubscription: "Manage Subscription",
      expiryLabel: "Expires on",
      backHome: "Back to Home",
      loginRequired: "Please login first",
      errorMessage: "Failed to create checkout session"
    }
  }

  const t = UI_TEXT[nativeLang]
  const monthly = PRICING_CONFIG.monthly
  const yearly = PRICING_CONFIG.yearly

  /**
   * 初始化：获取语言设置
   */
  useEffect(() => {
    const settings = getLanguageSettings()
    setNativeLang(settings.nativeLang)
  }, [])

  /**
   * 处理订阅 - 调用 Stripe Checkout
   * @param priceId - Stripe Price ID
   */
  const handleSubscribe = async (priceId: string) => {
    // 检查用户登录状态
    if (!isAuthenticated || !user?.id) {
      toast.error(t.loginRequired)
      router.push("/auth")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t.errorMessage)
      }

      // 跳转到 Stripe Checkout 页面
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("未获取到支付链接")
      }
    } catch (error: any) {
      console.error("订阅失败:", error)
      toast.error(error.message || t.errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 管理订阅 - 跳转到 Stripe Customer Portal
   */
  const handleManageSubscription = async () => {
    setIsLoading(true)

    try {
      // 获取用户邮箱用于认证
      const email = user?.email || localStorage.getItem("inkwords_email")
      
      const response = await fetch("/api/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": email || "",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "创建门户会话失败")
      }

      // 跳转到 Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("未获取到门户链接")
      }
    } catch (error: any) {
      console.error("管理订阅失败:", error)
      toast.error(error.message || "管理订阅失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackHome = () => {
    router.push("/")
  }

  // 格式化到期时间
  const formatExpiryDate = () => {
    if (user?.current_period_end) {
      return new Date(user.current_period_end).toLocaleDateString(
        nativeLang === "zh" ? "zh-CN" : "en-US"
      )
    }
    return null
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      
      <main className="relative z-10 min-h-screen overflow-y-auto scrollbar-hide">
        <div className="w-full min-h-screen bg-[#FDFBF7]/70 pt-14 pb-8 md:bg-transparent md:min-h-0 md:max-w-4xl md:mx-auto md:my-8 md:rounded-xl md:shadow-[0_4px_20px_rgba(43,43,43,0.08)]">
          <div className="px-4 py-8">
            {/* 标题 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center mb-8"
            >
              <h1 className="font-serif text-3xl md:text-4xl text-ink-black mb-2 leading-tight">
                {t.title}
              </h1>
              <p className="text-sm md:text-base text-ink-gray/70 font-serif">
                {t.subtitle}
              </p>
            </motion.div>

            {/* 会员状态显示 */}
            <AnimatePresence mode="wait">
              {isVip ? (
                // 已是会员 - 显示会员状态卡片
                <motion.div
                  key="member"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative bg-gradient-to-br from-[#C23E32] to-[#A33428] rounded-2xl p-8 md:p-10 shadow-xl text-white"
                >
                  {/* 皇冠图标 */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 flex items-center justify-center">
                      <Crown className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* 会员标题 */}
                  <div className="text-center mb-6">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">
                      {t.memberTitle}
                    </h2>
                    <p className="text-white/80 font-serif">
                      {t.memberSubtitle}
                    </p>
                  </div>

                  {/* 会员权益列表 */}
                  <div className="bg-white/10 rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-300" />
                        <span className="text-sm">{nativeLang === "zh" ? "无限刷题" : "Unlimited Practice"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-300" />
                        <span className="text-sm">{nativeLang === "zh" ? "无限阅读" : "Unlimited Reading"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-300" />
                        <span className="text-sm">{nativeLang === "zh" ? "全功能解锁" : "All Features"}</span>
                      </div>
                    </div>
                  </div>

                  {/* 到期时间 */}
                  {formatExpiryDate() && (
                    <div className="text-center mb-6">
                      <p className="text-white/70 text-sm">
                        {t.expiryLabel}: {formatExpiryDate()}
                      </p>
                    </div>
                  )}

                  {/* 管理订阅按钮 */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleManageSubscription}
                      disabled={isLoading}
                      className="px-8 py-3 bg-white text-[#C23E32] rounded-full font-serif text-base tracking-wider shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t.processing}
                        </>
                      ) : (
                        <>
                          <Settings className="w-5 h-5" />
                          {t.manageSubscription}
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBackHome}
                      className="px-8 py-3 bg-white/20 text-white rounded-full font-serif text-base tracking-wider hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Home className="w-5 h-5" />
                      {t.backHome}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                // 非会员 - 显示定价卡片
                <motion.div
                  key="pricing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  {/* 月度会员 */}
                  <div className="relative bg-[#FDFBF7] border border-stone-200/50 rounded-2xl p-6 md:p-8 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                        <Crown className="w-6 h-6 text-ink-gray" />
                      </div>
                      <div>
                        <h2 className="font-serif text-xl md:text-2xl text-ink-black">
                          {nativeLang === "zh" ? monthly.name : monthly.nameEn}
                        </h2>
                        <p className="text-sm text-ink-gray/60">
                          {nativeLang === "zh" ? monthly.description : monthly.descriptionEn}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="font-serif text-4xl md:text-5xl text-ink-black font-bold">
                        {monthly.priceDisplay}
                      </span>
                      <span className="text-ink-gray/60 ml-1">
                        {t.periodMonth}
                      </span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {(nativeLang === "zh" ? monthly.features : monthly.featuresEn).map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-[#7A9078] flex-shrink-0" />
                          <span className="text-ink-black font-serif">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(monthly.priceId)}
                      disabled={isLoading}
                      className="w-full py-3.5 bg-stone-200 text-ink-black font-serif text-base tracking-wider rounded-full hover:bg-stone-300 disabled:bg-ink-gray/30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t.processing}
                        </>
                      ) : (
                        t.subscribeBtn
                      )}
                    </button>
                  </div>

                  {/* 年度会员 - 推荐 */}
                  <div className="relative bg-[#FDFBF7] border-2 border-[#C23E32] rounded-2xl p-6 md:p-8 shadow-xl">
                    {/* 推荐标签 */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-[#C23E32] text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <span className="text-sm font-medium">
                          {t.badge}
                        </span>
                      </div>
                    </div>

                    {/* 节省标签 */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full text-sm font-medium">
                        {t.savings}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-6 pt-2">
                      <div className="w-12 h-12 rounded-full bg-[#C23E32]/10 flex items-center justify-center">
                        <Crown className="w-6 h-6 text-[#C23E32]" />
                      </div>
                      <div>
                        <h2 className="font-serif text-xl md:text-2xl text-ink-black">
                          {nativeLang === "zh" ? yearly.name : yearly.nameEn}
                        </h2>
                        <p className="text-sm text-ink-gray/60">
                          {nativeLang === "zh" ? yearly.description : yearly.descriptionEn}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="font-serif text-4xl md:text-5xl text-[#C23E32] font-bold">
                        {yearly.priceDisplay}
                      </span>
                      <span className="text-ink-gray/60 ml-1">
                        {t.periodYear}
                      </span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {(nativeLang === "zh" ? yearly.features : yearly.featuresEn).map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-[#C23E32] flex-shrink-0" />
                          <span className="text-ink-black font-serif">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(yearly.priceId)}
                      disabled={isLoading}
                      className="w-full py-3.5 bg-[#C23E32] text-white font-serif text-base tracking-wider rounded-full hover:bg-[#A33428] disabled:bg-ink-gray/30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t.processing}
                        </>
                      ) : (
                        t.subscribeBtn
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 底部说明 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center text-sm text-ink-gray/50 mt-8 font-serif"
            >
              {nativeLang === "zh"
                ? "安全支付由 Stripe 提供支持 · 随时取消订阅"
                : "Secure payment powered by Stripe · Cancel anytime"}
            </motion.p>
          </div>
        </div>
      </main>
    </>
  )
}
