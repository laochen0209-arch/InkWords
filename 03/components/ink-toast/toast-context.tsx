"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Toast 类型定义
type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// 图标组件
function SuccessIcon() {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      className="stroke-[#FDFBF7]"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      className="stroke-[#FDFBF7]"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      className="stroke-[#FDFBF7]"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5V5.5M8 7.5V11" />
    </svg>
  )
}

// 单个 Toast 组件
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const icons = {
    success: <SuccessIcon />,
    error: <ErrorIcon />,
    info: <InfoIcon />,
  }

  const backgrounds = {
    success: "bg-[#2b2b2b]/90",
    error: "bg-[#4a0e0e]/90",
    info: "bg-[#2b2b2b]/90",
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, 2500)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <motion.div
      layout
      initial={{ y: -20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -20, opacity: 0, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      className={cn(
        "flex items-center gap-3",
        "px-5 py-3",
        "rounded-full",
        "shadow-lg shadow-black/20",
        "backdrop-blur-sm",
        "border border-white/5",
        backgrounds[toast.type]
      )}
      style={{
        // 墨迹晕染效果
        boxShadow: `
          0 4px 20px rgba(0, 0, 0, 0.15),
          inset 0 0 20px rgba(255, 255, 255, 0.02)
        `
      }}
    >
      {/* 图标 */}
      <span className="flex-shrink-0 opacity-80">
        {icons[toast.type]}
      </span>
      
      {/* 消息文字 */}
      <span className="text-sm font-serif text-[#FDFBF7] tracking-wide">
        {toast.message}
      </span>
    </motion.div>
  )
}

// Provider 组件
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const toast: ToastContextValue = {
    success: (message: string) => addToast(message, "success"),
    error: (message: string) => addToast(message, "error"),
    info: (message: string) => addToast(message, "info"),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast 容器 */}
      <div 
        className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2"
        aria-live="polite"
        aria-label="通知"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// useToast Hook
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast 必须在 ToastProvider 内部使用")
  }
  return context
}
