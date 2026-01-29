"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { User, Settings, Bell, Moon, Sun, LogOut, ChevronRight } from "lucide-react"
import { BottomNavBar } from "@/components/library/bottom-nav-bar"

const settingsItems = [
  {
    id: "account",
    icon: User,
    title: "账号设置",
    description: "管理个人信息、绑定手机号",
  },
  {
    id: "notification",
    icon: Bell,
    title: "通知设置",
    description: "推送提醒、签到通知",
  },
  {
    id: "study",
    icon: Settings,
    title: "学习设置",
    description: "每日目标、复习频率",
  },
  {
    id: "appearance",
    icon: Moon,
    title: "外观设置",
    description: "主题切换、字体大小",
  },
  {
    id: "about",
    icon: User,
    title: "关于墨语",
    description: "版本信息、用户协议",
  },
]

type TabType = "home" | "practice" | "library" | "profile" | "study" | "check-in"

export default function SettingsPage() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("profile")

  const handleLogout = () => {
    if (confirm("确定要退出登录吗？")) {
      localStorage.removeItem("isLoggedIn")
      router.push("/login")
    }
  }

  const handleSettingClick = (id: string) => {
    if (id === "home" || id === "practice" || id === "library" || id === "profile") {
      setActiveTab(id as "home" | "practice" | "library" | "profile")
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      
      <main className="relative z-10 min-h-screen overflow-y-auto">
        <div className="w-full min-h-screen bg-[#FDFBF7]/70 pt-14 pb-8 md:bg-transparent md:min-h-0 md:max-w-2xl md:mx-auto md:my-8 md:rounded-xl md:shadow-[0_4px_20px_rgba(43,43,43,0.08)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="px-4 py-8"
          >
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl text-ink-black mb-2">
                设置
              </h1>
              <p className="text-sm text-ink-gray/70 font-serif">
                个性化你的墨语体验
              </p>
            </div>

            <div className="space-y-3">
              {settingsItems.map((item) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  onClick={() => handleSettingClick(item.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4",
                    "bg-[#FDFBF7]/90 backdrop-blur-sm",
                    "border border-stone-200/30",
                    "rounded-xl",
                    "transition-all duration-300",
                    "hover:border-stone-300/50 hover:shadow-md",
                    activeTab === item.id && "border-[#C23E32] shadow-[0_4px_20px_rgba(194,62,50,0.15)]"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 flex items-center justify-center",
                    "rounded-full",
                    "bg-gradient-to-br from-stone-100/60 to-stone-200/80",
                    "transition-all duration-300",
                    activeTab === item.id && "bg-[#C23E32]/20"
                  )}
                  >
                    <item.icon className="w-6 h-6 text-ink-gray/70" strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h3 className="font-serif text-lg text-ink-black font-semibold mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-ink-gray/70 font-serif">
                      {item.description}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-ink-gray/40" strokeWidth={1.5} />
                </motion.button>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 pt-6 border-t border-stone-200/30"
            >
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-ink-gray hover:text-ink-vermilion transition-colors"
              >
                <LogOut className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-serif text-base">
                  退出登录
                </span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </main>
      
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  )
}
