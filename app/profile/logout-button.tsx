"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    if (confirm("确定要退出登录吗？")) {
      // 调用 Supabase 官方登出方法
      await supabase.auth.signOut()
      
      // 注意：不再手动操作 localStorage，Supabase 会自动清理会话
      
      // 跳转到首页
      router.push("/")
      router.refresh()
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="w-full mt-6 py-3.5 bg-white rounded-2xl shadow-sm font-medium text-center cursor-pointer transition-colors hover:bg-gray-50 outline-none focus:outline-none ring-0 focus:ring-0 text-[#C23E32]"
    >
      退出登录
    </button>
  )
}
