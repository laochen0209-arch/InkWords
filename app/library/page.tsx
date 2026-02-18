import { Suspense } from "react"

/**
 * @file page.tsx
 * @description Library 页面 - 支持筛选功能
 * @author InkWords Team
 * @date 2026-02-19
 */

import LibraryContent from "./library-content"

// 加载状态组件
function LibraryLoading() {
  return (
    <div className="min-h-screen bg-ink-paper flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-[#C23E32] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-[#2b2b2b]/60">加载中...</p>
      </div>
    </div>
  )
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<LibraryLoading />}>
      <LibraryContent />
    </Suspense>
  )
}
