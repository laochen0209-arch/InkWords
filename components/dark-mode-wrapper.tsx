/**
 * @file dark-mode-wrapper.tsx
 * @description 深色模式包装组件 - 为子元素添加深色模式支持
 * @author InkWords Team
 * @date 2026-02-11
 */

"use client";

import { ReactNode } from "react";

interface DarkModeWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * 深色模式包装组件
 * 自动为常见背景色添加深色模式支持
 */
export function DarkModeWrapper({ children, className = "" }: DarkModeWrapperProps) {
  return (
    <div className={`dark-mode-wrapper ${className}`}>
      {children}
    </div>
  );
}
