/**
 * @file UpgradeButton.tsx
 * @description Lemon Squeezy 支付按钮组件
 * @author InkWords Team
 * @date 2026-02-13
 * @version 1.0.0
 */

import { Crown } from "lucide-react";

interface UpgradeButtonProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Lemon Squeezy 支付按钮组件
 * 使用 embed 模式弹出支付窗口
 */
export default function UpgradeButton({ className, children }: UpgradeButtonProps) {
  // Lemon Squeezy 结账链接（embed 模式）
  const CHECKOUT_URL = "https://inkwords.lemonsqueezy.com/checkout/buy/a0f8f35b-80dd-4ead-b0d6-7d2b29cd7423?embed=1";

  return (
    <a
      href={CHECKOUT_URL}
      className={`
        lemonsqueezy-button
        inline-flex items-center gap-2
        bg-gradient-to-r from-[#D4AF37] to-[#B8960C]
        text-white px-6 py-3 rounded-xl
        font-serif font-semibold
        shadow-lg hover:shadow-xl
        hover:scale-[1.02] active:scale-[0.98]
        transition-all duration-300
        ${className || ""}
      `}
    >
      <Crown className="w-5 h-5" />
      {children || "开通 Pro 会员"}
    </a>
  );
}

/**
 * 月度会员按钮
 */
export function UpgradeButtonMonthly({ className, children }: UpgradeButtonProps) {
  const CHECKOUT_URL = "https://inkwords.lemonsqueezy.com/checkout/buy/a0f8f35b-80dd-4ead-b0d6-7d2b29cd7423?embed=1";

  return (
    <a
      href={CHECKOUT_URL}
      className={`
        lemonsqueezy-button
        inline-flex items-center gap-2
        bg-gradient-to-r from-[#C23E32] to-[#A8352B]
        text-white px-6 py-3 rounded-xl
        font-serif font-semibold
        shadow-lg hover:shadow-xl
        hover:scale-[1.02] active:scale-[0.98]
        transition-all duration-300
        ${className || ""}
      `}
    >
      <Crown className="w-5 h-5" />
      {children || "月度会员"}
    </a>
  );
}

/**
 * 年度会员按钮
 */
export function UpgradeButtonYearly({ className, children }: UpgradeButtonProps) {
  // 年度会员结账链接（需要替换为实际的年度产品链接）
  const CHECKOUT_URL = "https://inkwords.lemonsqueezy.com/checkout/buy/YEARLY_PRODUCT_ID?embed=1";

  return (
    <a
      href={CHECKOUT_URL}
      className={`
        lemonsqueezy-button
        inline-flex items-center gap-2
        bg-gradient-to-r from-[#D4AF37] to-[#B8960C]
        text-white px-6 py-3 rounded-xl
        font-serif font-semibold
        shadow-lg hover:shadow-xl
        hover:scale-[1.02] active:scale-[0.98]
        transition-all duration-300
        ${className || ""}
      `}
    >
      <Crown className="w-5 h-5" />
      {children || "年度会员"}
    </a>
  );
}
