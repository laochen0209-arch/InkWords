"use client"

import { motion } from "framer-motion"
import { CreditCard, Globe, Heart, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * 双引擎收银台组件
 * 
 * 功能：
 * - 国内用户：跳转爱发电（微信/支付宝）
 * - 海外用户：跳转 Patreon（信用卡/PayPal）
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

/**
 * 双引擎收银台组件
 * 
 * 提供国内和海外两种支付方式：
 * - 国内：爱发电（微信/支付宝）
 * - 海外：Patreon（信用卡/PayPal）
 */
export function DualCheckoutPanel({ userId, planType, price }: DualCheckoutPanelProps) {
  /**
   * 处理国内支付（爱发电）
   */
  const handleDomesticPayment = () => {
    // TODO: 后续替换为真实的专属支付链接
    const afdianUrl = "https://afdian.net"
    window.open(afdianUrl, "_blank")
  }

  /**
   * 处理海外支付（Patreon）
   */
  const handleInternationalPayment = () => {
    // TODO: 后续替换为真实的 Patreon 链接
    const patreonUrl = "https://patreon.com"
    window.open(patreonUrl, "_blank")
  }

  // 根据套餐类型显示不同价格
  const domesticPrice = planType === "month" ? "￥28/月" : "￥268/年"
  const internationalPrice = planType === "month" ? "$3.99/mo" : "$39.9/yr"

  return (
    <div className="w-full space-y-4">
      {/* 国内支付选项 - 爱发电 */}
      <motion.button
        onClick={handleDomesticPayment}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full relative overflow-hidden rounded-xl p-5",
          "bg-gradient-to-r from-[#07C160] to-[#05a350]",
          "shadow-lg shadow-[#07C160]/20",
          "transition-all duration-300",
          "group"
        )}
      >
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 图标容器 */}
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>

            {/* 文字内容 */}
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">
                  微信 / 支付宝支付
                </span>
                <span className="text-sm text-white/80">({domesticPrice})</span>
              </div>
              <p className="text-xs text-white/70 mt-1">
                由爱发电提供技术支持
              </p>
            </div>
          </div>

          {/* 箭头图标 */}
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <ExternalLink className="w-5 h-5 text-white" />
          </div>
        </div>
      </motion.button>

      {/* 海外支付选项 - Patreon */}
      <motion.button
        onClick={handleInternationalPayment}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full relative overflow-hidden rounded-xl p-5",
          "bg-gradient-to-r from-[#FF424D] to-[#E03E48]",
          "shadow-lg shadow-[#FF424D]/20",
          "transition-all duration-300",
          "group"
        )}
      >
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 图标容器 */}
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>

            {/* 文字内容 */}
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">
                  Credit Card / PayPal
                </span>
                <span className="text-sm text-white/80">({internationalPrice})</span>
              </div>
              <p className="text-xs text-white/70 mt-1">
                Powered by Patreon
              </p>
            </div>
          </div>

          {/* 箭头图标 */}
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <ExternalLink className="w-5 h-5 text-white" />
          </div>
        </div>
      </motion.button>

      {/* 温馨提示 */}
      <div className="mt-4 p-4 rounded-lg bg-[#FDFBF7]/10 border border-[#FDFBF7]/20">
        <div className="flex items-start gap-3">
          <CreditCard className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#FDFBF7]/70 leading-relaxed">
            支付完成后，系统将在 1 分钟内自动为您点亮 Pro 状态。如有问题请联系客服。
          </p>
        </div>
      </div>
    </div>
  )
}

export default DualCheckoutPanel
