"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Crown, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { DualCheckoutPanel } from "./DualCheckoutPanel"
import { useAuth } from "@/lib/contexts/auth-context"

/**
 * @file upgrade-modal.tsx
 * @description 升级弹窗组件 - 显示 VIP 升级提示和支付选项
 * @author InkWords Team
 * @date 2026-02-20
 *
 * 功能说明：
 * - 显示升级提示信息
 * - 集成 DualCheckoutPanel 支付组件
 * - 支持自定义消息
 * - 优雅的动画效果
 */

interface UpgradeModalProps {
  /** 是否显示弹窗 */
  isOpen: boolean
  /** 关闭弹窗回调 */
  onClose: () => void
  /** 自定义提示消息 */
  message?: string
  /** 剩余配额（可选） */
  remaining?: number
}

/**
 * 升级弹窗组件
 *
 * @param isOpen - 是否显示弹窗
 * @param onClose - 关闭弹窗回调
 * @param message - 自定义提示消息
 * @param remaining - 剩余配额
 */
export function UpgradeModal({
  isOpen,
  onClose,
  message,
  remaining
}: UpgradeModalProps) {
  const { user } = useAuth()

  const defaultMessage = "您已达到免费用户的使用上限，升级会员解锁全部功能！"

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* 弹窗内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full max-w-md",
              "rounded-3xl overflow-hidden",
              "bg-gradient-to-br from-[#2D2A26] to-[#1A1816]",
              "shadow-2xl",
              "border border-[#D4AF37]/20"
            )}
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>

            {/* 头部区域 */}
            <div className="relative p-6 pb-4">
              {/* 装饰背景 */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl" />

              {/* 图标 */}
              <div className="relative flex justify-center mb-4">
                <div className={cn(
                  "w-16 h-16 rounded-full",
                  "bg-gradient-to-br from-[#D4AF37] to-[#B8941F]",
                  "flex items-center justify-center",
                  "shadow-lg shadow-[#D4AF37]/20"
                )}>
                  <Crown className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* 标题 */}
              <h2 className="relative text-center text-xl font-bold text-white mb-2">
                升级墨语会员
              </h2>

              {/* 提示消息 */}
              <p className="relative text-center text-sm text-white/60 mb-4">
                {message || defaultMessage}
              </p>

              {/* 剩余配额提示 */}
              {remaining !== undefined && remaining >= 0 && (
                <div className="relative flex items-center justify-center gap-2 text-sm text-[#D4AF37]">
                  <Sparkles className="w-4 h-4" />
                  <span>今日剩余次数: {remaining}</span>
                </div>
              )}
            </div>

            {/* VIP 特权列表 */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "📚", text: "无限学习" },
                  { icon: "📖", text: "无限阅读" },
                  { icon: "📝", text: "无限练习" },
                  { icon: "🎯", text: "专属题库" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-sm text-white/80">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 支付区域 */}
            <div className="p-6 pt-2">
              <DualCheckoutPanel
                userId={user?.id || ""}
                planType="month"
                price="9.9"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UpgradeModal
