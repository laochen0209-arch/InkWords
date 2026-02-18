"use client"

/**
 * @file tidio-provider.tsx
 * @description Tidio 在线客服系统集成组件
 * @author InkWords Team
 * @date 2026-02-13
 * @version 1.0.0
 */

import { useEffect } from "react"

// 扩展 Window 接口以支持 Tidio API
declare global {
  interface Window {
    tidioChatApi?: {
      open: () => void
      close: () => void
      isOpen: () => boolean
      setVisitorData: (data: { name?: string; email?: string }) => void
    }
    tidioChat?: {
      open: () => void
      close: () => void
      isOpen: () => boolean
      setVisitorData: (data: { name?: string; email?: string }) => void
    }
  }
}

interface TidioProviderProps {
  children: React.ReactNode
}

/**
 * Tidio 在线客服 Provider 组件
 * 自动加载 Tidio Widget 脚本并提供全局访问
 */
export function TidioProvider({ children }: TidioProviderProps) {
  useEffect(() => {
    // 从环境变量获取 Tidio Public Key
    const tidioPublicKey = process.env.NEXT_PUBLIC_TIDIO_PUBLIC_KEY

    // 如果没有配置 Key，则不加载脚本
    if (!tidioPublicKey) {
      console.warn("[Tidio] NEXT_PUBLIC_TIDIO_PUBLIC_KEY 未配置，在线客服功能未启用")
      return
    }

    // 避免重复加载脚本
    if (document.getElementById("tidio-chat-script")) {
      return
    }

    // 创建并加载 Tidio 脚本
    const script = document.createElement("script")
    script.id = "tidio-chat-script"
    script.src = `//code.tidio.co/${tidioPublicKey}.js`
    script.async = true
    script.defer = true

    // 脚本加载完成后的回调
    script.onload = () => {
      console.log("[Tidio] 在线客服脚本加载成功")
    }

    // 脚本加载失败的回调
    script.onerror = () => {
      console.error("[Tidio] 在线客服脚本加载失败")
    }

    document.body.appendChild(script)

    // 清理函数
    return () => {
      // 组件卸载时不移除脚本，因为 Tidio 是全局服务
      // 如果需要完全清理，可以在这里移除
    }
  }, [])

  return <>{children}</>
}

/**
 * 打开 Tidio 聊天窗口的辅助函数
 * 可在任何客户端组件中调用
 */
export function openTidioChat(): void {
  if (typeof window === "undefined") return

  // 尝试使用 tidioChatApi（新版）或 tidioChat（旧版）
  const chatApi = window.tidioChatApi || window.tidioChat

  if (chatApi?.open) {
    chatApi.open()
    console.log("[Tidio] 打开聊天窗口")
  } else {
    console.warn("[Tidio] 聊天 API 未就绪，请稍后重试")
    // 如果脚本还在加载中，可以显示提示
    alert("客服系统加载中，请稍后再试")
  }
}

/**
 * 关闭 Tidio 聊天窗口的辅助函数
 */
export function closeTidioChat(): void {
  if (typeof window === "undefined") return

  const chatApi = window.tidioChatApi || window.tidioChat

  if (chatApi?.close) {
    chatApi.close()
  }
}

/**
 * 检查聊天窗口是否打开的辅助函数
 */
export function isTidioChatOpen(): boolean {
  if (typeof window === "undefined") return false

  const chatApi = window.tidioChatApi || window.tidioChat

  return chatApi?.isOpen ? chatApi.isOpen() : false
}

/**
 * 设置访客信息的辅助函数
 * 可用于传递用户姓名、邮箱等信息给客服
 */
export function setTidioVisitorData(data: { name?: string; email?: string }): void {
  if (typeof window === "undefined") return

  const chatApi = window.tidioChatApi || window.tidioChat

  if (chatApi?.setVisitorData) {
    chatApi.setVisitorData(data)
  }
}
