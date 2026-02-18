"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Check, Crown, Loader2, Sparkles } from "lucide-react"
import { PRICING_CONFIG } from "@/lib/stripe/config"
import { getLanguageSettings, type NativeLang } from "@/lib/language-utils"
import { useToast } from "@/components/ink-toast/toast-context"

/**
 * 定价页面组件
 * 展示月度/年度会员定价，支持 Stripe 支付
 */
export default function PricingPage() {
  const router = useRouter()
  const toast = useToast()
  const [nativeLang, setNativeLang] = useState<NativeLang>("zh")
  const [isLoading, setIsLoading] = useState<string | null>(null)

  /**
   * 初始化语言设置
   */
  useEffect(() => {
    const settings = getLanguageSettings()
    setNativeLang(settings.nativeLang)
  }, [])

  /**
   * 处理订阅
   * @param priceId - Stripe Price ID
   */
  const handleSubscribe = async (priceId: string, planId: string) => {
    // 获取用户ID
    const userStr = localStorage.getItem("inkwords_user")
    if (!userStr) {
      toast.error(nativeLang === "zh" ? "请先登录" : "Please login first")
      router.push("/auth")
      return
    }

    const user = JSON.parse(userStr)
    if (!user.id) {
      toast.error(nativeLang === "zh" ? "用户信息无效" : "Invalid user info")
      return
    }

    setIsLoading(planId)

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
        throw new Error(data.error || "创建支付会话失败")
      }

      // 跳转到 Stripe Checkout 页面
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("未获取到支付链接")
      }
    } catch (error: any) {
      console.error("订阅失败:", error)
      toast.error(error.message || (nativeLang === "zh" ? "订阅失败" : "Subscription failed"))
    } finally {
      setIsLoading(null)
    }
  }

  const isZh = nativeLang === "zh"
  const monthly = PRICING_CONFIG.monthly
  const yearly = PRICING_CONFIG.yearly

  return (
    <div className="min-h-screen bg-ink-paper ink-landscape-bg">
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />

      <main className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-5xl">
          {/* 标题 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 md:mb-12"
          >
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-ink-black mb-3">
              {isZh ? "开通墨语会员" : "Unlock InkWords Premium"}
            </h1>
            <p className="text-base md:text-lg text-ink-gray/70 font-serif">
              {isZh ? "选择适合您的订阅方案" : "Choose the plan that works for you"}
            </p>
          </motion.div>

          {/* 定价卡片 */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* 月度会员 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative bg-[#FDFBF7] border border-stone-200/50 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-ink-gray" />
                </div>
                <div>
                  <h2 className="font-serif text-xl md:text-2xl text-ink-black">
                    {isZh ? monthly.name : monthly.nameEn}
                  </h2>
                  <p className="text-sm text-ink-gray/60">
                    {isZh ? monthly.description : monthly.descriptionEn}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <span className="font-serif text-4xl md:text-5xl text-ink-black font-bold">
                  {monthly.priceDisplay}
                </span>
                <span className="text-ink-gray/60 ml-1">
                  {isZh ? monthly.period : monthly.periodEn}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {(isZh ? monthly.features : monthly.featuresEn).map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#7A9078] flex-shrink-0" />
                    <span className="text-ink-black font-serif">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(monthly.priceId, monthly.id)}
                disabled={isLoading === monthly.id}
                className="w-full py-3.5 bg-stone-200 text-ink-black font-serif text-base tracking-wider rounded-full hover:bg-stone-300 disabled:bg-ink-gray/30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading === monthly.id ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isZh ? "处理中..." : "Processing..."}
                  </>
                ) : (
                  isZh ? "立即订阅" : "Subscribe Now"
                )}
              </button>
            </motion.div>

            {/* 年度会员 - 推荐 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative bg-[#FDFBF7] border-2 border-[#C23E32] rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-shadow"
            >
              {/* 推荐标签 */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-[#C23E32] text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isZh ? yearly.badge : yearly.badgeEn}
                  </span>
                </div>
              </div>

              {/* 节省标签 */}
              <div className="absolute top-4 right-4">
                <span className="bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full text-sm font-medium">
                  {isZh ? yearly.savings : yearly.savingsEn}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6 pt-2">
                <div className="w-12 h-12 rounded-full bg-[#C23E32]/10 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-[#C23E32]" />
                </div>
                <div>
                  <h2 className="font-serif text-xl md:text-2xl text-ink-black">
                    {isZh ? yearly.name : yearly.nameEn}
                  </h2>
                  <p className="text-sm text-ink-gray/60">
                    {isZh ? yearly.description : yearly.descriptionEn}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <span className="font-serif text-4xl md:text-5xl text-[#C23E32] font-bold">
                  {yearly.priceDisplay}
                </span>
                <span className="text-ink-gray/60 ml-1">
                  {isZh ? yearly.period : yearly.periodEn}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {(isZh ? yearly.features : yearly.featuresEn).map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#C23E32] flex-shrink-0" />
                    <span className="text-ink-black font-serif">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(yearly.priceId, yearly.id)}
                disabled={isLoading === yearly.id}
                className="w-full py-3.5 bg-[#C23E32] text-white font-serif text-base tracking-wider rounded-full hover:bg-[#A33428] disabled:bg-ink-gray/30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              >
                {isLoading === yearly.id ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isZh ? "处理中..." : "Processing..."}
                  </>
                ) : (
                  isZh ? "立即订阅" : "Subscribe Now"
                )}
              </button>
            </motion.div>
          </div>

          {/* 底部说明 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center text-sm text-ink-gray/50 mt-8 font-serif"
          >
            {isZh
              ? "安全支付由 Stripe 提供支持 · 随时取消订阅"
              : "Secure payment powered by Stripe · Cancel anytime"}
          </motion.p>
        </div>
      </main>
    </div>
  )
}
