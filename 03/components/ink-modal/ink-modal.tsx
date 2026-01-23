"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface InkModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export function InkModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className,
}: InkModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 毛玻璃背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-stone-900/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 弹窗主体 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
              "w-[90vw] max-w-md",
              "bg-[#FDFBF7] rounded-2xl",
              "shadow-xl shadow-stone-900/10",
              "overflow-hidden",
              className
            )}
          >
            {/* 头部 */}
            <div className="relative px-6 pt-6 pb-4">
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className={cn(
                  "absolute top-4 right-4",
                  "w-8 h-8 rounded-full",
                  "flex items-center justify-center",
                  "text-stone-400 hover:text-stone-600",
                  "hover:bg-stone-100",
                  "transition-all duration-200"
                )}
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>

              {/* 标题 */}
              <h2 className="font-serif text-xl text-[#2B2B2B] tracking-wide">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm text-[#787878] font-serif">
                  {subtitle}
                </p>
              )}
            </div>

            {/* 内容区 */}
            <div className="px-6 pb-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
