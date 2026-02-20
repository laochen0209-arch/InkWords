"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, Globe, Heart, ArrowLeft, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS, LearningMode } from "@/lib/i18n"

/**
 * 双引擎收银台组件 - 两步式支付流程
 * 
 * 设计理念：
 * - 第一步：选择支付方式（不显示价格，避免货币对比）
 * - 第二步：选择套餐类型（月费/年费）
 * - 高级水墨融合风格
 * 
 * @author InkWords Team
 * @since 2025-02-19
 */

interface DualCheckoutPanelProps {
  /** 用户ID */
  userId: string
  /** 套餐类型 */
  planType: "month" | "year"
  /** 价格 */
  price: string
}

type PaymentStep = "select-method" | "select-plan"
type PaymentMethod = "domestic" | "international" | null

/**
 * 双引擎收银台组件
 * 
 * 两步式支付流程：
 * - 第一步：选择支付方式（微信/支付宝 或 Credit Card/PayPal）
 * - 第二步：选择套餐类型（月费/年费）
 */
export function DualCheckoutPanel({ userId, planType, price }: DualCheckoutPanelProps) {
  const [step, setStep] = useState<PaymentStep>("select-method")
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null)
  const [learningMode, setLearningMode] = useState<LearningMode>("LEARN_ENGLISH")

  // 获取语言设置
  useEffect(() => {
    const savedMode = localStorage.getItem("inkwords_learning_mode") as LearningMode
    if (savedMode) {
      setLearningMode(savedMode)
    }
  }, [])

  const t = TRANSLATIONS[learningMode]
  const isChineseMode = learningMode === "LEARN_CHINESE"

  /**
   * 处理选择支付方式
   */
  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setStep("select-plan")
  }

  /**
   * 返回选择支付方式
   */
  const handleBack = () => {
    setStep("select-method")
    setSelectedMethod(null)
  }

  /**
   * 处理选择套餐并跳转支付
   */
  const handleSelectPlan = (plan: "month" | "year") => {
    if (typeof window !== "undefined") {
      if (selectedMethod === "domestic") {
        // 爱发电支付链接
        const afdianUrl = `https://afdian.com/a/inkwords?remark=${userId}`
        window.open(afdianUrl, "_blank")
      } else if (selectedMethod === "international") {
        // Patreon 支付链接
        const patreonUrl = "https://patreon.com"
        window.open(patreonUrl, "_blank")
      }
    }
  }

  // 价格配置
  const prices = {
    domestic: {
      month: "￥9.9",
      year: "￥99",
    },
    international: {
      month: "$3.99",
      year: "$39.9",
    },
  }

  return (
    <div className="w-full space-y-4">
      <AnimatePresence mode="wait">
        {step === "select-method" ? (
          /* 
            ========================================
            第一步：选择支付方式
            ========================================
          */
          <motion.div
            key="select-method"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* 标题提示 */}
            <p className="text-center text-sm text-[#FDFBF7]/60 mb-4">
              {isChineseMode ? "请选择支付方式" : "Select Payment Method"}
            </p>

            {/* 国内支付 - 微信/支付宝 */}
            <motion.button
              onClick={() => handleSelectMethod("domestic")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full relative overflow-hidden",
                "rounded-2xl p-5",
                "bg-white/40",
                "backdrop-blur-md",
                "border border-white/30",
                "shadow-sm hover:shadow-lg",
                "transition-all duration-500 ease-out",
                "group"
              )}
            >
              {/* 水墨晕染背景 */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700" />

              {/* 左侧边框点缀 - 竹青色 */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-emerald-400/60 via-emerald-500/40 to-emerald-400/60 rounded-full opacity-60 group-hover:opacity-100 group-hover:h-12 transition-all duration-500" />

              <div className="relative z-10 flex items-center justify-between pl-3">
                <div className="flex items-center gap-4">
                  {/* 图标 */}
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    "bg-emerald-50/80",
                    "border border-emerald-200/50",
                    "group-hover:bg-emerald-100/80",
                    "transition-all duration-500"
                  )}>
                    <Heart className="w-5 h-5 text-emerald-700/80" />
                  </div>

                  {/* 文字 */}
                  <div className="text-left">
                    <span className="text-base font-medium text-white tracking-wide">
                      {isChineseMode ? "微信 / 支付宝" : "WeChat / Alipay"}
                    </span>
                    <p className="text-xs text-white/70 mt-0.5">
                      {isChineseMode ? "爱发电支持" : "Powered by Afdian"}
                    </p>
                  </div>
                </div>

                {/* 箭头 */}
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37]/30 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-[#D4AF37]" />
                </div>
              </div>
            </motion.button>

            {/* 海外支付 - Credit Card/PayPal */}
            <motion.button
              onClick={() => handleSelectMethod("international")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full relative overflow-hidden",
                "rounded-2xl p-5",
                "bg-white/40",
                "backdrop-blur-md",
                "border border-white/30",
                "shadow-sm hover:shadow-lg",
                "transition-all duration-500 ease-out",
                "group"
              )}
            >
              {/* 水墨晕染背景 */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-700" />

              {/* 左侧边框点缀 - 暗橙色 */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-amber-400/60 via-amber-500/40 to-amber-400/60 rounded-full opacity-60 group-hover:opacity-100 group-hover:h-12 transition-all duration-500" />

              <div className="relative z-10 flex items-center justify-between pl-3">
                <div className="flex items-center gap-4">
                  {/* 图标 */}
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    "bg-amber-50/80",
                    "border border-amber-200/50",
                    "group-hover:bg-amber-100/80",
                    "transition-all duration-500"
                  )}>
                    <Globe className="w-5 h-5 text-amber-700/80" />
                  </div>

                  {/* 文字 */}
                  <div className="text-left">
                    <span className="text-base font-medium text-white tracking-wide">
                      Credit Card / PayPal
                    </span>
                    <p className="text-xs text-white/70 mt-0.5">
                      {isChineseMode ? "Patreon 支持" : "Powered by Patreon"}
                    </p>
                  </div>
                </div>

                {/* 箭头 */}
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37]/30 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-[#D4AF37]" />
                </div>
              </div>
            </motion.button>
          </motion.div>
        ) : (
          /*
            ========================================
            第二步：选择套餐类型
            ========================================
          */
          <motion.div
            key="select-plan"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* 返回按钮 */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-[#FDFBF7]/60 hover:text-[#FDFBF7]/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回选择支付方式
            </button>

            {/* 标题提示 */}
            <p className="text-center text-sm text-[#FDFBF7]/60 mb-4">
              {selectedMethod === "domestic" ? "请选择套餐类型" : "Select Plan Type"}
            </p>

            {/* 月费按钮 */}
            <motion.button
              onClick={() => handleSelectPlan("month")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full relative overflow-hidden",
                "rounded-2xl p-5",
                "bg-white/40",
                "backdrop-blur-md",
                "border border-white/30",
                "shadow-sm hover:shadow-lg",
                "transition-all duration-500 ease-out",
                "group"
              )}
            >
              {/* 左侧边框点缀 */}
              <div className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-full opacity-60 group-hover:opacity-100 group-hover:h-12 transition-all duration-500",
                selectedMethod === "domestic" 
                  ? "bg-gradient-to-b from-emerald-400/60 via-emerald-500/40 to-emerald-400/60"
                  : "bg-gradient-to-b from-amber-400/60 via-amber-500/40 to-amber-400/60"
              )} />

              <div className="relative z-10 flex items-center justify-between pl-3">
                <div className="text-left">
                  <span className="text-base font-medium text-white">
                    {selectedMethod === "domestic" ? "月度会员" : "Monthly Plan"}
                  </span>
                  <p className="text-xs text-white/70 mt-1">
                    {selectedMethod === "domestic" ? "按月付费，随时取消" : "Billed monthly, cancel anytime"}
                  </p>
                </div>

                {/* 价格 */}
                <div className="text-right">
                  <span className="text-2xl font-serif font-semibold text-white">
                    {selectedMethod === "domestic" ? prices.domestic.month : prices.international.month}
                  </span>
                  <span className="text-sm text-white/70 ml-1">
                    {selectedMethod === "domestic" ? "/月" : "/mo"}
                  </span>
                </div>
              </div>
            </motion.button>

            {/* 年费按钮 */}
            <motion.button
              onClick={() => handleSelectPlan("year")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full relative overflow-hidden",
                "rounded-2xl p-5",
                "bg-white/40",
                "backdrop-blur-md",
                "border border-white/30",
                "shadow-sm hover:shadow-lg",
                "transition-all duration-500 ease-out",
                "group"
              )}
            >
              {/* 推荐标签 */}
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-xs rounded-full">
                {selectedMethod === "domestic" ? "推荐" : "Best Value"}
              </div>

              {/* 左侧边框点缀 */}
              <div className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-full opacity-60 group-hover:opacity-100 group-hover:h-12 transition-all duration-500",
                selectedMethod === "domestic" 
                  ? "bg-gradient-to-b from-emerald-400/60 via-emerald-500/40 to-emerald-400/60"
                  : "bg-gradient-to-b from-amber-400/60 via-amber-500/40 to-amber-400/60"
              )} />

              <div className="relative z-10 flex items-center justify-between pl-3">
                <div className="text-left">
                  <span className="text-base font-medium text-white">
                    {selectedMethod === "domestic" ? "年度会员" : "Yearly Plan"}
                  </span>
                  <p className="text-xs text-white/70 mt-1">
                    {selectedMethod === "domestic" ? "年付更优惠" : "Save with yearly billing"}
                  </p>
                </div>

                {/* 价格 */}
                <div className="text-right">
                  <span className="text-2xl font-serif font-semibold text-white">
                    {selectedMethod === "domestic" ? prices.domestic.year : prices.international.year}
                  </span>
                  <span className="text-sm text-white/70 ml-1">
                    {selectedMethod === "domestic" ? "/年" : "/yr"}
                  </span>
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/*
        ========================================
        温馨提示
        ========================================
      */}
      <div className={cn(
        "mt-6 p-4 rounded-2xl",
        "bg-[#D4AF37]/10",
        "backdrop-blur-sm",
        "border border-[#D4AF37]/20"
      )}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <p className="text-xs text-[#D4AF37]/80 leading-relaxed pt-1.5">
            {isChineseMode 
              ? "支付完成后，系统将在 1 分钟内自动为您点亮 Pro 状态。如有问题请联系客服。"
              : "After payment, your Pro status will be activated automatically within 1 minute. Contact support if you have any questions."
            }
          </p>
        </div>
      </div>
    </div>
  )
}

export default DualCheckoutPanel
