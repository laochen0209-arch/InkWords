"use client"

import { Crown } from "lucide-react"

export function VipBanner() {
  return (
    <div className="relative overflow-hidden bg-[#2B2B2B] p-4">
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
            <Crown 
              className="w-6 h-6" 
              style={{ color: '#D4AF37' }}
              strokeWidth={1.5}
            />
          </div>
          <div>
            <h3 className="text-[#FDFBF7] font-serif text-sm font-medium">
              开通墨语会员
            </h3>
            <p className="text-[#FDFBF7]/60 text-xs font-sans mt-0.5">
              畅享无限修习
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
          立即开通
        </button>
      </div>
    </div>
  )
}
