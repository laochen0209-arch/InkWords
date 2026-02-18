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
import { Check, Crown, Sparkles, BookOpen, Library, Award } from "lucide-react"

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

  // VIP 特权列表
  const vipBenefits = [
    { icon: BookOpen, text: "无限学习单词和句子" },
    { icon: Library, text: "解锁所有图书馆资源" },
    { icon: Award, text: "专属练习模式和考试" },
    { icon: Sparkles, text: "优先客服支持" },
  ]

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
                {/* VIP 开通区域 - 水墨风格 */}
                <div className="relative overflow-hidden rounded-2xl shadow-lg">
                  {/* 背景装饰 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2B2B2B] via-[#3D3D3D] to-[#2B2B2B]" />
                  
                  {/* 云纹装饰 */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                      <path d="M20 60 Q30 40 50 50 Q70 60 80 40" stroke="#D4AF37" strokeWidth="2" fill="none" />
                      <path d="M10 75 Q25 55 45 65" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
                    </svg>
                  </div>

                  <div className="relative z-10 p-6">
                    {/* 标题区域 */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/20 mb-3">
                        <Crown className="w-8 h-8 text-[#D4AF37]" />
                      </div>
                      <h3 className="text-xl font-serif font-medium text-[#FDFBF7] mb-1">
                        开通 Pro 会员
                      </h3>
                      <p className="text-sm text-[#FDFBF7]/60">
                        解锁全部特权，畅享学习之旅
                      </p>
                    </div>

                    {/* VIP 特权列表 */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {vipBenefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2 text-[#FDFBF7]/80 text-sm">
                          <benefit.icon className="w-4 h-4 text-[#D4AF37]" />
                          <span>{benefit.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* 套餐选择卡片 */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {/* 月度套餐 */}
                      <button
                        onClick={() => setSelectedPlan("monthly")}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                          selectedPlan === "monthly"
                            ? "border-[#D4AF37] bg-[#D4AF37]/10"
                            : "border-[#FDFBF7]/20 hover:border-[#FDFBF7]/40 bg-[#FDFBF7]/5"
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-medium text-[#FDFBF7] text-sm mb-1">{plans.monthly.label}</div>
                          <div className="text-2xl font-bold text-[#D4AF37]">{plans.monthly.price}</div>
                          <div className="text-xs text-[#FDFBF7]/60">USD/月</div>
                        </div>
                        {selectedPlan === "monthly" && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-[#2B2B2B]" />
                          </div>
                        )}
                      </button>

                      {/* 年度套餐 */}
                      <button
                        onClick={() => setSelectedPlan("yearly")}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                          selectedPlan === "yearly"
                            ? "border-[#D4AF37] bg-[#D4AF37]/10"
                            : "border-[#FDFBF7]/20 hover:border-[#FDFBF7]/40 bg-[#FDFBF7]/5"
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-medium text-[#FDFBF7] text-sm mb-1">{plans.yearly.label}</div>
                          <div className="text-2xl font-bold text-[#D4AF37]">{plans.yearly.price}</div>
                          <div className="text-xs text-[#FDFBF7]/60">USD/年</div>
                          {plans.yearly.savings && (
                            <div className="inline-block mt-2 px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-xs rounded-full font-medium">
                              🔥 {plans.yearly.savings}
                            </div>
                          )}
                        </div>
                        {selectedPlan === "yearly" && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[#D4AF37] rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-[#2B2B2B]" />
                          </div>
                        )}
                      </button>
                    </div>

                    {/* PayPal 支付按钮 */}
                    <div className="bg-white/5 rounded-xl p-4">
                      <PayPalCheckoutButton userId={user.id} price={plans[selectedPlan].price} />
                    </div>

                    {/* 安全提示 */}
                    <p className="text-center text-xs text-[#FDFBF7]/40 mt-4">
                      安全支付 · 随时取消 · 7天无理由退款
                    </p>
                  </div>
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
