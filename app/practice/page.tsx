/**
 * @file page.tsx
 * @description 练习中心页面 - 使用 Suspense 包裹客户端组件以支持 useSearchParams
 * @author InkWords Team
 * @date 2026-01-29
 */

import { Suspense } from "react";
import PracticeContent from "./PracticeContent";

/**
 * 加载状态组件
 * @returns JSX.Element
 */
function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C23E32]"></div>
      <p className="ml-2 text-gray-600 font-medium">Loading...</p>
    </div>
  );
}

/**
 * 练习中心页面组件
 * @returns JSX.Element
 */
export default function PracticePage() {
  return (
    <Suspense fallback={<Loading />}>
      <PracticeContent />
    </Suspense>
  );
}
