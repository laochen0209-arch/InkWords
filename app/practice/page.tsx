/**
 * @file page.tsx
 * @description 练习中心页面 - 使用 Suspense 包裹客户端组件以支持 useSearchParams
 * @author InkWords Team
 * @date 2026-01-29
 */

import { Suspense } from "react";
import PracticeContent from "./PracticeContent";

/**
 * 练习页面骨架屏组件
 * 显示页面结构占位符，提升加载体验
 * @returns JSX.Element
 */
function PracticeSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5]">
      {/* 顶部导航栏骨架 */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 考试类型选择器占位 */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
              <div className="w-24 h-6 rounded bg-gray-200 animate-pulse" />
            </div>
            {/* 学习模式切换占位 */}
            <div className="w-32 h-8 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 主内容区域骨架 */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* 欢迎区域骨架 */}
        <div className="mb-6">
          <div className="w-48 h-8 rounded bg-gray-200 animate-pulse mb-2" />
          <div className="w-64 h-4 rounded bg-gray-200 animate-pulse" />
        </div>

        {/* 统计卡片区域骨架 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/90 backdrop-blur rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
                <div>
                  <div className="w-12 h-6 rounded bg-gray-200 animate-pulse mb-1" />
                  <div className="w-16 h-3 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 能力雷达图骨架 */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
          <div className="w-32 h-6 rounded bg-gray-200 animate-pulse mb-4" />
          <div className="flex justify-center">
            <div className="w-[280px] h-[280px] rounded-full bg-gray-100 animate-pulse" />
          </div>
        </div>

        {/* 功能卡片区域骨架 */}
        <div className="space-y-4">
          <div className="w-32 h-6 rounded bg-gray-200 animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 智能刷题卡片骨架 */}
            <div className="bg-[#2B2B2B]/95 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-600 animate-pulse" />
              </div>
              <div className="w-24 h-6 rounded bg-gray-600 animate-pulse mb-2" />
              <div className="w-16 h-3 rounded bg-gray-600 animate-pulse mb-4" />
              <div className="w-full h-12 rounded bg-gray-600 animate-pulse" />
            </div>
            {/* 全真模考卡片骨架 */}
            <div className="bg-white/90 backdrop-blur rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse" />
              </div>
              <div className="w-24 h-6 rounded bg-gray-200 animate-pulse mb-2" />
              <div className="w-16 h-3 rounded bg-gray-200 animate-pulse mb-4" />
              <div className="w-full h-12 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>

        {/* 历史记录区域骨架 */}
        <div className="mt-8">
          <div className="w-32 h-6 rounded bg-gray-200 animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/90 backdrop-blur rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
                    <div>
                      <div className="w-24 h-4 rounded bg-gray-200 animate-pulse mb-1" />
                      <div className="w-16 h-3 rounded bg-gray-200 animate-pulse" />
                    </div>
                  </div>
                  <div className="w-12 h-6 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 底部导航栏骨架 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 rounded bg-gray-200 animate-pulse" />
                <div className="w-8 h-3 rounded bg-gray-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 练习中心页面组件
 * @returns JSX.Element
 */
export default function PracticePage() {
  return (
    <Suspense fallback={<PracticeSkeleton />}>
      <PracticeContent />
    </Suspense>
  );
}
