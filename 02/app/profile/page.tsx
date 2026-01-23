"use client"

import { BottomNavBar } from "@/components/library/bottom-nav-bar"
import { ProfileHeader } from "@/components/profile/profile-header"
import { VipBanner } from "@/components/profile/vip-banner"
import { SettingsList } from "@/components/profile/settings-list"

export default function ProfilePage() {
  return (
    <>
      {/* Layer 1: 固定背景层 - 水墨山水 */}
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      
      {/* Layer 2: 可滚动内容区 */}
      <main className="relative z-10 min-h-screen overflow-y-auto">
        {/* 内容区 - pb-24 避开底部导航 */}
        <div className="pb-24">
          {/* 居中限制容器 - 电脑端居中显示，手机端占满宽度 */}
          <div className="w-full max-w-2xl mx-auto">
            {/* 头部用户信息 */}
            <ProfileHeader />
            
            {/* VIP 入口卡片 */}
            <div className="px-4 mt-6">
              <VipBanner />
            </div>
            
            {/* 功能列表 */}
            <div className="px-4 mt-6">
              <SettingsList />
            </div>
            
            {/* 退出登录按钮 */}
            <div className="mt-8 pb-4 flex justify-center">
              <button
                type="button"
                className="text-ink-gray text-sm font-serif hover:text-ink-vermilion transition-colors duration-200"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Layer 3: 固定底部导航栏 */}
      <BottomNavBar activeTab="profile" />
    </>
  )
}
