/**
 * @file page.tsx
 * @description 模拟考试页面 - 使用 Suspense 包裹客户端组件以支持 useSearchParams
 * @author InkWords Team
 * @date 2026-01-29
 */

import { Suspense } from "react";
import MockContent from "./MockContent";

/**
 * 加载状态组件
 * @returns JSX.Element
 */
function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="ml-2 text-slate-600 font-medium">Loading...</p>
    </div>
  );
}

/**
 * 模拟考试页面组件
 * @returns JSX.Element
 */
export default function MockPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MockContent />
    </Suspense>
  );
}
