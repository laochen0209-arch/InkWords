"use client"

import { useState } from "react"
import { BottomNavBar } from "@/components/library/bottom-nav-bar"
import { ProfileHeader } from "@/components/profile/profile-header"
import { VipBanner } from "@/components/profile/vip-banner"
import { SettingsList } from "@/components/profile/settings-list"
import { useToast } from "@/components/ink-toast/toast-context"
import { useLanguage } from "@/lib/contexts/language-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { TRANSLATIONS } from "@/lib/i18n"
import PayPalCheckoutButton from "@/components/PayPalCheckoutButton"
import { Check } from "lucide-react"

type TabType = "home" | "practice" | "library" | "profile" | "study" | "checkin"
type PlanType = "monthly" | "yearly"

/**
 * 个人中心页面
 *
 * 功能：
 * - 显示用户头像、昵称、ID
 * - 显示学习统计数据
 * - VIP 状态显示和到期时间
 * - 设置列表
 * - 退出登录
 * - PayPal 支付开通 VIP（支持月度/年度套餐选择）
 */
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile")
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("monthly")
  const toast = useToast()
  const { learningMode } = useLanguage()
  const { user, isVip, isAuthenticated } = useAuth()

  const t = TRANSLATIONS[learningMode]

  // 套餐配置
  const plans = {
    monthly: {
      price: "3.99",
      label: "月度会员",
      subLabel: "$3.99/月",
      savings: null,
    },
    yearly: {
      price: "39.90",
      label: "年度会员",
      subLabel: "$39.9/年",
      savings: "省 $7.98",
    },
  }

  const handleLogout = () => {
    if (confirm(t.auth.logoutConfirm)) {
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("inkwords_token")
      localStorage.removeItem("inkwords_user")
      localStorage.removeItem("inkwords_email")
      toast.success(t.auth.logoutSuccess)
      setTimeout(() => {
        window.location.href = "/"
      }, 1000)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />

      <main className="relative z-10 min-h-screen overflow-y-auto">
        <div className="pb-24">
          <div className="w-full max-w-2xl mx-auto">
            <ProfileHeader />

            {/* VIP Banner - 已登录用户显示升级按钮或VIP状态 */}
            {user?.id && !isVip ? (
              <div className="w-full px-4 mb-4">
                {/* PayPal 支付按钮 - 开通 VIP */}
                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <h3 className="text-lg font-medium text-center mb-2">开通 Pro 会员</h3>
                  <p className="text-sm text-gray-500 text-center mb-4">选择适合您的套餐，享受全部 VIP 特权</p>
                  
                  {/* 套餐选择卡片 */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* 月度套餐 */}
                    <button
                      onClick={() => setSelectedPlan("monthly")}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        selectedPlan === "monthly"
                          ? "border-[#C23E32] bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{plans.monthly.label}</div>
                        <div className="text-lg font-bold text-[#C23E32] mt-1">{plans.monthly.subLabel}</div>
                      </div>
                      {selectedPlan === "monthly" && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-[#C23E32] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>

                    {/* 年度套餐 */}
                    <button
                      onClick={() => setSelectedPlan("yearly")}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        selectedPlan === "yearly"
                          ? "border-[#C23E32] bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{plans.yearly.label}</div>
                        <div className="text-lg font-bold text-[#C23E32] mt-1">{plans.yearly.subLabel}</div>
                        {plans.yearly.savings && (
                          <div className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                            🔥 {plans.yearly.savings}
                          </div>
                        )}
                      </div>
                      {selectedPlan === "yearly" && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-[#C23E32] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  </div>

                  {/* PayPal 支付按钮 */}
                  <PayPalCheckoutButton userId={user.id} price={plans[selectedPlan].price} />
                </div>
              </div>
            ) : (
              <div className="w-full cursor-pointer">
                <VipBanner
                  isVip={isVip}
                  expiryDate={user?.current_period_end}
                />
              </div>
            )}
            
            <div className="px-4 mt-6">
              <SettingsList />
            </div>
            
            <div className="px-4 mt-8 pb-4">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full mt-6 py-3.5 bg-white rounded-2xl shadow-sm font-medium text-center cursor-pointer transition-colors hover:bg-gray-50 outline-none focus:outline-none ring-0 focus:ring-0 !text-[#C23E32] !hover:text-[#C23E32] !active:text-[#C23E32] !focus:text-[#C23E32]"
              >
                {t.auth.logout}
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  )
}
