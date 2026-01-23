"use client"

import { useToast } from "@/components/ink-toast/toast-context"

export default function ToastDemoPage() {
  const toast = useToast()

  return (
    <div className="min-h-screen relative">
      {/* 水墨背景 */}
      <div 
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ 
          backgroundImage: "url('/images/ink-landscape-bg.jpg')",
          filter: "blur(2px)"
        }}
      />
      <div className="fixed inset-0 -z-10 bg-[#FDFBF7]/80" />

      {/* 内容 */}
      <main className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="bg-[#FDFBF7]/90 backdrop-blur-md rounded-2xl p-8 shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-serif text-[#2B2B2B] text-center mb-2">
            墨语提示组件
          </h1>
          <p className="text-sm text-[#787878] text-center mb-8 font-serif">
            点击按钮测试不同类型的 Toast 通知
          </p>

          <div className="flex flex-col gap-4">
            {/* 成功提示 */}
            <button
              onClick={() => toast.success("登录成功，欢迎回来")}
              className="w-full py-3 rounded-full bg-[#7A9078] text-white font-serif tracking-wide
                         hover:bg-[#6a8068] transition-colors shadow-md"
            >
              成功提示
            </button>

            {/* 错误提示 */}
            <button
              onClick={() => toast.error("操作失败，请重试")}
              className="w-full py-3 rounded-full bg-[#C23E32] text-white font-serif tracking-wide
                         hover:bg-[#A33428] transition-colors shadow-md"
            >
              错误提示
            </button>

            {/* 信息提示 */}
            <button
              onClick={() => toast.info("已复制到剪贴板")}
              className="w-full py-3 rounded-full bg-[#2B2B2B] text-white font-serif tracking-wide
                         hover:bg-[#1a1a1a] transition-colors shadow-md"
            >
              信息提示
            </button>
          </div>

          {/* 使用说明 */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <p className="text-xs text-[#787878] font-mono leading-relaxed">
              {`import { useToast } from '@/components/ink-toast/toast-context'`}
              <br /><br />
              {`const toast = useToast()`}
              <br />
              {`toast.success('消息内容')`}
              <br />
              {`toast.error('消息内容')`}
              <br />
              {`toast.info('消息内容')`}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
