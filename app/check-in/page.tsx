"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Calendar, Check, Flame, Target } from "lucide-react"
import { useRouter } from "next/navigation"

const checkInData = [
  { date: "1月1日", checked: true, streak: 12 },
  { date: "1月2日", checked: true, streak: 12 },
  { date: "1月3日", checked: true, streak: 12 },
  { date: "1月4日", checked: false, streak: 11 },
  { date: "1月5日", checked: true, streak: 12 },
  { date: "1月6日", checked: true, streak: 12 },
  { date: "1月7日", checked: true, streak: 12 },
  { date: "1月8日", checked: false, streak: 11 },
  { date: "1月9日", checked: true, streak: 12 },
  { date: "1月10日", checked: true, streak: 12 },
  { date: "1月11日", checked: true, streak: 12 },
  { date: "1月12日", checked: true, streak: 12 },
  { date: "1月13日", checked: true, streak: 12 },
  { date: "1月14日", checked: false, streak: 11 },
  { date: "1月15日", checked: true, streak: 12 },
  { date: "1月16日", checked: true, streak: 12 },
  { date: "1月17日", checked: true, streak: 12 },
  { date: "1月18日", checked: false, streak: 11 },
  { date: "1月19日", checked: true, streak: 12 },
  { date: "1月20日", checked: true, streak: 12 },
  { date: "1月21日", checked: true, streak: 12 },
  { date: "1月22日", checked: true, streak: 12 },
  { date: "1月23日", checked: false, streak: 11 },
  { date: "1月24日", checked: true, streak: 12 },
  { date: "1月25日", checked: true, streak: 12 },
  { date: "1月26日", checked: true, streak: 12 },
  { date: "1月27日", checked: true, streak: 12 },
  { date: "1月28日", checked: false, streak: 11 },
  { date: "1月29日", checked: true, streak: 12 },
  { date: "1月30日", checked: true, streak: 12 },
  { date: "1月31日", checked: true, streak: 12 },
]

export default function CheckInPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleBack = () => {
    router.back()
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
  }

  const checkedDays = checkInData.filter(d => d.checked).length
  const currentStreak = checkInData[0]?.streak || 0

  return (
    <main className="min-h-screen bg-ink-paper ink-landscape-bg">
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />
      
      <div className="relative z-10 min-h-screen overflow-y-auto scrollbar-hide">
        <div className="w-full min-h-screen bg-[#FDFBF7]/70 pt-14 pb-8 md:bg-transparent md:min-h-0 md:max-w-2xl md:mx-auto md:my-8 md:rounded-xl md:shadow-[0_4px_20px_rgba(43,43,43,0.08)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="px-4 py-8"
          >
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl text-ink-black mb-2">
                签到日历
              </h1>
              <p className="text-sm text-ink-gray/70 font-serif">
                连续签到 {currentStreak} 天
              </p>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-8">
              {["日", "一", "二", "三", "四", "五", "六"].map((day, index) => (
                <div key={day} className="text-center">
                  <div className="text-xs text-ink-gray/60 font-sans py-1">
                    {day}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {checkInData.map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDateClick(item.date)}
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-300",
                    item.checked 
                      ? "bg-[#D4AF37]/20 border-2 border-[#D4AF37] text-ink-black shadow-[0_4px_20px_rgba(212,175,55,0.15)]" 
                      : "bg-[#FDFBF7]/50 border-2 border-stone-200/30 text-ink-gray/70 hover:border-stone-300/50 hover:shadow-md"
                  )}
                >
                  <span className="text-sm md:text-base font-serif">
                    {item.date.replace("1月", "").replace("日", "")}
                  </span>
                  {item.checked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-[#D4AF37] rounded-lg"
                    >
                      <Check className="w-6 h-6 text-white" strokeWidth={2} />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-8 p-6 bg-[#FDFBF7]/90 backdrop-blur-sm border border-stone-200/30 rounded-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-xl text-ink-black font-semibold">
                      {selectedDate}
                    </h3>
                    <p className="text-sm text-ink-gray/70 font-serif">
                      已签到
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-ink-gray/60 hover:text-ink-gray transition-colors"
                  >
                    关闭
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                      <Flame className="w-6 h-6 text-white" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-ink-gray/70 font-serif">
                      连续签到
                    </p>
                    <p className="font-serif text-3xl text-[#D4AF37] font-bold">
                      {currentStreak} 天
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-[#2B2B2B]/10 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-ink-gray/70 font-serif">
                      本月签到
                    </p>
                    <p className="font-serif text-3xl text-[#2B2B2B] font-bold">
                      {checkedDays} 天
                    </p>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <p className="text-sm text-ink-gray/60 font-serif">
                    坚持签到，解锁更多权益
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  )
}
