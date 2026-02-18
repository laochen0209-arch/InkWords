"use client"

import { Crown, Sparkles } from "lucide-react"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

interface VipBannerProps {
  isVip?: boolean
  expiryDate?: string | null
  onClick?: () => void
}

/**
 * VIP 横幅组件
 * 
 * 功能：
 * - 非 VIP 用户：显示开通会员入口
 * - VIP 用户：显示会员有效期
 * 
 * 注意：LEARN_ENGLISH = 中文界面（学英语的中文用户）
 *       LEARN_CHINESE = 英文界面（学中文的英文用户）
 */
export function VipBanner({ isVip = false, expiryDate, onClick }: VipBannerProps) {
  const { learningMode } = useLanguage()
  const t = TRANSLATIONS[learningMode].subscription
  
  // 判断是否为中文界面
  const isChineseUI = learningMode === "LEARN_ENGLISH"

  // 格式化到期时间
  const formatExpiryDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(
        isChineseUI ? "zh-CN" : "en-US"
      )
    } catch {
      return dateStr
    }
  }

  return (
    <div 
      className="relative overflow-hidden bg-[#2B2B2B] p-4 cursor-pointer"
      onClick={onClick}
    >
      {/* 云纹装饰 - 左上角 */}
      <div 
        className="absolute top-0 left-0 w-20 h-20 opacity-[0.08]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <path 
            d="M20 60 Q30 40 50 50 Q70 60 80 40 Q90 30 95 35" 
            stroke="#D4AF37" 
            strokeWidth="2" 
            fill="none"
          />
          <path 
            d="M10 75 Q25 55 45 65 Q65 75 85 55" 
            stroke="#D4AF37" 
            strokeWidth="1.5" 
            fill="none"
          />
        </svg>
      </div>
      
      {/* 云纹装饰 - 右下角 */}
      <div 
        className="absolute bottom-0 right-0 w-24 h-24 opacity-[0.06] rotate-180"
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <path 
            d="M20 60 Q30 40 50 50 Q70 60 80 40 Q90 30 95 35" 
            stroke="#D4AF37" 
            strokeWidth="2" 
            fill="none"
          />
          <path 
            d="M10 75 Q25 55 45 65 Q65 75 85 55" 
            stroke="#D4AF37" 
            strokeWidth="1.5" 
            fill="none"
          />
        </svg>
      </div>
      
      <div className="relative z-10 flex items-center justify-between">
        {/* 左侧内容 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            {isVip ? (
              <Sparkles 
                className="w-6 h-6" 
                style={{ color: '#D4AF37' }}
                strokeWidth={1.5}
              />
            ) : (
              <Crown 
                className="w-6 h-6" 
                style={{ color: '#D4AF37' }}
                strokeWidth={1.5}
              />
            )}
          </div>
          <div>
            <h3 className="text-[#FDFBF7] font-serif text-sm font-medium">
              {isVip 
                ? (isChineseUI ? "墨语会员" : "InkWords Premium")
                : t.title
              }
            </h3>
            <p className="text-[#FDFBF7]/60 text-xs font-sans mt-0.5">
              {isVip && expiryDate
                ? (isChineseUI 
                    ? `有效期至 ${formatExpiryDate(expiryDate)}` 
                    : `Valid until ${formatExpiryDate(expiryDate)}`)
                : t.subtitle
              }
            </p>
          </div>
        </div>
        
        {/* 右侧按钮 */}
        <button
          type="button"
          className="px-4 py-1.5 text-sm font-serif font-medium transition-all duration-200 hover:brightness-110"
          style={{
            backgroundColor: '#D4AF37',
            color: '#2B2B2B',
          }}
        >
          {isVip 
            ? (isChineseUI ? "管理" : "Manage")
            : t.subscribeBtn
          }
        </button>
      </div>
    </div>
  )
}
