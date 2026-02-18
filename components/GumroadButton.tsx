/**
 * @fileoverview Gumroad 购买按钮组件
 *
 * 该组件用于在页面上渲染一个 Gumroad 购买按钮，支持加载 Gumroad JavaScript SDK
 * 并打开 Gumroad 的覆盖式结账界面。按钮采用金色渐变样式，与 VIP/Pro 会员主题相匹配。
 *
 * @author InkWords Team
 * @since 2024
 *
 * @example
 * ```tsx
 * <GumroadButton userId="user_123" className="custom-class">
 *   升级 Pro 会员
 * </GumroadButton>
 * ```
 */

"use client";

import Script from "next/script";
import { Crown } from "lucide-react";

/**
 * Gumroad 按钮组件的属性接口
 *
 * @interface GumroadButtonProps
 */
interface GumroadButtonProps {
  /**
   * 用户唯一标识符，将传递给 Gumroad 用于关联购买记录
   */
  userId: string;

  /**
   * 可选的自定义 CSS 类名，用于扩展或覆盖默认样式
   */
  className?: string;

  /**
   * 按钮显示的子元素内容，默认为 "开通 Pro 会员"
   */
  children?: React.ReactNode;
}

/**
 * Gumroad 购买按钮组件
 *
 * 该组件会加载 Gumroad JavaScript SDK，并渲染一个带有金色渐变样式的购买按钮。
 * 点击按钮后会打开 Gumroad 的覆盖式结账界面。
 *
 * **重要提示**: 请将 href 中的链接替换为您实际的 Gumroad 产品链接。
 *
 * @param {GumroadButtonProps} props - 组件属性
 * @returns {JSX.Element} 渲染的 Gumroad 按钮组件
 */
export default function GumroadButton({
  userId,
  className = "",
  children,
}: GumroadButtonProps): JSX.Element {
  return (
    <>
      {/* 加载 Gumroad JavaScript SDK */}
      <Script
        src="https://gumroad.com/js/gumroad.js"
        strategy="lazyOnload"
      />

      {/* Gumroad 购买链接按钮 */}
      <a
        href={`https://inkwords.gumroad.com/l/member?user_id=${userId}`}
        data-gumroad-overlay-checkout="true"
        className={`
          inline-flex
          items-center
          justify-center
          gap-2
          px-6
          py-3
          font-semibold
          text-white
          transition-all
          duration-200
          bg-gradient-to-r
          from-yellow-500
          via-amber-500
          to-yellow-600
          hover:from-yellow-400
          hover:via-amber-400
          hover:to-yellow-500
          rounded-xl
          shadow-lg
          hover:shadow-xl
          hover:shadow-amber-500/25
          hover:-translate-y-0.5
          active:translate-y-0
          ${className}
        `}
      >
        {/* 皇冠图标 */}
        <Crown className="w-5 h-5" />

        {/* 按钮文本内容 */}
        {children || "开通 Pro 会员"}
      </a>
    </>
  );
}
