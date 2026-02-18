/**
 * SubscriptionStatus 组件
 *
 * 文件说明：
 * 显示用户会员状态的卡片组件
 *
 * 功能：
 * - 显示会员类型（月度/年度）
 * - 显示到期时间
 * - 显示会员权益列表
 * - 提供管理订阅入口
 */

"use client"

import { useState } from "react"
import { Crown, Check, Settings, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/components/ink-toast/toast-context"

interface SubscriptionStatusProps {
  isPro: boolean
  expiryDate?: string
  planType?: "monthly" | "yearly"
  nativeLang?: "zh" | "en"
}

export function SubscriptionStatus({
  isPro,
  expiryDate,
  planType = "monthly",
  nativeLang = "zh",
}: SubscriptionStatusProps) {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const t = {
    zh: {
      memberTitle: "您已是尊贵的会员",
      memberSubtitle: "感谢您对墨语的支持",
      freeTitle: "免费用户",
      freeSubtitle: "升级会员解锁更多功能",
      monthly: "月度会员",
      yearly: "年度会员",
      expiryLabel: "到期时间",
      manageBtn: "管理订阅",
      upgradeBtn: "升级会员",
      benefits: {
        unlimitedPractice: "无限刷题",
        unlimitedReading: "无限阅读",
        allFeatures: "全功能解锁",
      },
    },
    en: {
      memberTitle: "You are a Premium Member",
      memberSubtitle: "Thank you for supporting InkWords",
      freeTitle: "Free User",
      freeSubtitle: "Upgrade to unlock more features",
      monthly: "Monthly",
      yearly: "Yearly",
      expiryLabel: "Expires on",
      manageBtn: "Manage Subscription",
      upgradeBtn: "Upgrade",
      benefits: {
        unlimitedPractice: "Unlimited Practice",
        unlimitedReading: "Unlimited Reading",
        allFeatures: "All Features Unlocked",
      },
    },
  }[nativeLang]

  /**
   * 管理订阅 - 跳转到 Stripe Customer Portal
   */
  const handleManageSubscription = async () => {
    setIsLoading(true)

    try {
      // 从 inkwords_user 对象中获取 email
      const userStr = localStorage.getItem("inkwords_user")
      const user = userStr ? JSON.parse(userStr) : null
      const email = user?.email

      if (!email) {
        throw new Error("请先登录")
      }

      const response = await fetch("/api/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": email,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "创建门户会话失败")
      }

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

  if (!isPro) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl p-6 shadow-md"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-stone-300 flex items-center justify-center">
            <Crown className="w-7 h-7 text-stone-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-lg text-ink-black font-bold">{t.freeTitle}</h3>
            <p className="text-sm text-ink-gray/70">{t.freeSubtitle}</p>
          </div>
          <button
            onClick={() => (window.location.href = "/subscription")}
            className="px-5 py-2 bg-[#C23E32] text-white rounded-full text-sm font-medium hover:bg-[#A33428] transition-colors"
          >
            {t.upgradeBtn}
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-[#C23E32] to-[#A33428] rounded-2xl p-6 shadow-xl text-white"
    >
      {/* 头部 */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
          <Crown className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-lg font-bold">{t.memberTitle}</h3>
          <p className="text-sm text-white/80">{t.memberSubtitle}</p>
        </div>
        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
          {planType === "yearly" ? t.yearly : t.monthly}
        </span>
      </div>

      {/* 权益列表 */}
      <div className="bg-white/10 rounded-xl p-4 mb-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-300" />
            <span className="text-xs">{t.benefits.unlimitedPractice}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-300" />
            <span className="text-xs">{t.benefits.unlimitedReading}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-300" />
            <span className="text-xs">{t.benefits.allFeatures}</span>
          </div>
        </div>
      </div>

      {/* 到期时间 */}
      {expiryDate && (
        <div className="mb-4">
          <p className="text-white/70 text-sm">
            {t.expiryLabel}: {expiryDate}
          </p>
        </div>
      )}

      {/* 管理按钮 */}
      <button
        onClick={handleManageSubscription}
        disabled={isLoading}
        className="w-full py-2.5 bg-white text-[#C23E32] rounded-full text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <Settings className="w-4 h-4" />
            {t.manageBtn}
          </>
        )}
      </button>
    </motion.div>
  )
}
