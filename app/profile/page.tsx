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
import GumroadButton from "@/components/GumroadButton"

type TabType = "home" | "practice" | "library" | "profile" | "study" | "checkin"

/**
 * 个人中心页面
 *
 * 功能：
 * - 显示用户头像、昵称、ID
 * - 显示学习统计数据
 * - VIP 状态显示和到期时间
 * - 设置列表
 * - 退出登录
 */
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile")
  const toast = useToast()
  const { learningMode } = useLanguage()
  const { user, isVip, isAuthenticated } = useAuth()

  const t = TRANSLATIONS[learningMode]

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
                {/* TODO: 请替换为实际的 Gumroad 产品链接 */}
                <GumroadButton userId={user.id} className="w-full">
                  开通 Pro 会员
                </GumroadButton>
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
