"use client"

import { motion } from "framer-motion"
import { CreditCard, Globe, Heart, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * 双引擎收银台组件 - 水墨融合风格
 * 
 * 设计理念：
 * - 采用半透明毛玻璃效果，融入水墨背景
 * - 低饱和度品牌色点缀，不喧宾夺主
 * - 极简排版，呼吸感十足
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
    <div className="w-full space-y-5">
      {/* 
        ========================================
        国内支付选项 - 爱发电
        风格：竹青/水墨绿点缀，极简素雅
        ========================================
      */}
      <motion.button
        onClick={handleDomesticPayment}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full relative overflow-hidden",
          "rounded-2xl p-6",
          "bg-white/40 dark:bg-black/40",
          "backdrop-blur-md",
          "border border-white/30 dark:border-white/10",
          "shadow-sm hover:shadow-lg",
          "transition-all duration-500 ease-out",
          "group"
        )}
      >
        {/* 水墨晕染背景装饰 */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all duration-700" />

        {/* 左侧边框点缀 - 竹青色 */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-emerald-400/60 via-emerald-500/40 to-emerald-400/60 rounded-full opacity-60 group-hover:opacity-100 group-hover:h-16 transition-all duration-500" />

        <div className="relative z-10 flex items-center justify-between pl-3">
          <div className="flex items-center gap-5">
            {/* 图标容器 - 极简圆形 */}
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center",
              "bg-emerald-50/80 dark:bg-emerald-950/30",
              "border border-emerald-200/50 dark:border-emerald-800/30",
              "group-hover:bg-emerald-100/80 dark:group-hover:bg-emerald-900/40",
              "transition-all duration-500"
            )}>
              <Heart className="w-6 h-6 text-emerald-700/80 dark:text-emerald-400/80 group-hover:scale-110 transition-transform duration-500" />
            </div>

            {/* 文字内容 */}
            <div className="text-left">
              {/* 主标题 */}
              <div className="flex items-baseline gap-3">
                <span className="text-base font-medium text-stone-800 dark:text-stone-200 tracking-wide">
                  微信 / 支付宝
                </span>
                <span className="text-xs text-emerald-700/60 dark:text-emerald-400/60 font-light">
                  爱发电
                </span>
              </div>

              {/* 价格 - 精致清晰 */}
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-serif font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                  {domesticPrice}
                </span>
              </div>

              {/* 副标题 - 淡雅 */}
              <p className="text-xs text-stone-500/70 dark:text-stone-400/60 mt-1.5 font-light tracking-wide">
                由爱发电提供技术支持
              </p>
            </div>
          </div>

          {/* 箭头图标 - 极简 */}
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "bg-stone-100/80 dark:bg-stone-800/50",
            "border border-stone-200/50 dark:border-stone-700/30",
            "group-hover:bg-emerald-50/80 dark:group-hover:bg-emerald-900/30",
            "group-hover:border-emerald-200/50 dark:group-hover:border-emerald-800/30",
            "transition-all duration-500"
          )}>
            <ArrowUpRight className="w-4 h-4 text-stone-500/70 dark:text-stone-400/60 group-hover:text-emerald-600/80 dark:group-hover:text-emerald-400/80 transition-colors duration-500" />
          </div>
        </div>
      </motion.button>

      {/* 
        ========================================
        海外支付选项 - Patreon
        风格：暗橙/咖色点缀，温润雅致
        ========================================
      */}
      <motion.button
        onClick={handleInternationalPayment}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full relative overflow-hidden",
          "rounded-2xl p-6",
          "bg-white/40 dark:bg-black/40",
          "backdrop-blur-md",
          "border border-white/30 dark:border-white/10",
          "shadow-sm hover:shadow-lg",
          "transition-all duration-500 ease-out",
          "group"
        )}
      >
        {/* 水墨晕染背景装饰 */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-700" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all duration-700" />

        {/* 左侧边框点缀 - 暗橙色 */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-amber-400/60 via-amber-500/40 to-amber-400/60 rounded-full opacity-60 group-hover:opacity-100 group-hover:h-16 transition-all duration-500" />

        <div className="relative z-10 flex items-center justify-between pl-3">
          <div className="flex items-center gap-5">
            {/* 图标容器 - 极简圆形 */}
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center",
              "bg-amber-50/80 dark:bg-amber-950/30",
              "border border-amber-200/50 dark:border-amber-800/30",
              "group-hover:bg-amber-100/80 dark:group-hover:bg-amber-900/40",
              "transition-all duration-500"
            )}>
              <Globe className="w-6 h-6 text-amber-700/80 dark:text-amber-400/80 group-hover:scale-110 transition-transform duration-500" />
            </div>

            {/* 文字内容 */}
            <div className="text-left">
              {/* 主标题 */}
              <div className="flex items-baseline gap-3">
                <span className="text-base font-medium text-stone-800 dark:text-stone-200 tracking-wide">
                  Credit Card / PayPal
                </span>
                <span className="text-xs text-amber-700/60 dark:text-amber-400/60 font-light">
                  Patreon
                </span>
              </div>

              {/* 价格 - 精致清晰 */}
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-serif font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                  {internationalPrice}
                </span>
              </div>

              {/* 副标题 - 淡雅 */}
              <p className="text-xs text-stone-500/70 dark:text-stone-400/60 mt-1.5 font-light tracking-wide">
                Powered by Patreon
              </p>
            </div>
          </div>

          {/* 箭头图标 - 极简 */}
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "bg-stone-100/80 dark:bg-stone-800/50",
            "border border-stone-200/50 dark:border-stone-700/30",
            "group-hover:bg-amber-50/80 dark:group-hover:bg-amber-900/30",
            "group-hover:border-amber-200/50 dark:group-hover:border-amber-800/30",
            "transition-all duration-500"
          )}>
            <ArrowUpRight className="w-4 h-4 text-stone-500/70 dark:text-stone-400/60 group-hover:text-amber-600/80 dark:group-hover:text-amber-400/80 transition-colors duration-500" />
          </div>
        </div>
      </motion.button>

      {/* 
        ========================================
        温馨提示
        风格：极简淡雅，融入整体
        ========================================
      */}
      <div className={cn(
        "mt-6 p-5 rounded-2xl",
        "bg-stone-100/30 dark:bg-stone-900/30",
        "backdrop-blur-sm",
        "border border-stone-200/30 dark:border-stone-700/20"
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            "bg-stone-200/50 dark:bg-stone-700/30"
          )}>
            <CreditCard className="w-3.5 h-3.5 text-stone-500/70 dark:text-stone-400/60" />
          </div>
          <p className="text-xs text-stone-500/80 dark:text-stone-400/70 leading-relaxed pt-1.5 font-light">
            支付完成后，系统将在 1 分钟内自动为您点亮 Pro 状态。如有问题请联系客服。
          </p>
        </div>
      </div>
    </div>
  )
}

export default DualCheckoutPanel
