"use client"

import React, { useState } from "react"
import { InkModal } from "@/components/ink-modal/ink-modal"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

// 词书数据
const courses = [
  { id: 1, name: "大学四级", subtitle: "CET-4 核心词汇", words: 4500, active: true },
  { id: 2, name: "雅思核心", subtitle: "IELTS 高频词汇", words: 3500, active: false },
  { id: 3, name: "考研英语", subtitle: "研究生入学词汇", words: 5500, active: false },
  { id: 4, name: "托福精选", subtitle: "TOEFL 必备词汇", words: 4000, active: false },
]

// 签到数据 (模拟当月)
const checkInDays = [1, 2, 3, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 18, 19]
const today = 20
const streakDays = 12

export default function ModalDemoPage() {
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(1)

  // 生成日历数据
  const daysInMonth = 31
  const firstDayOffset = 2 // 假设本月第一天是周三 (0=周日)
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"]

  const calendarDays = []
  for (let i = 0; i < firstDayOffset; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  return (
    <div className="min-h-screen relative">
      {/* 背景 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/ink-landscape-bg.jpg')",
          opacity: 0.15,
        }}
      />
      <div className="fixed inset-0 bg-[#FDFBF7]/80" />

      {/* 内容 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-6 p-8">
        <h1 className="font-serif text-2xl text-[#2B2B2B] mb-4">
          通用弹窗组件演示
        </h1>

        {/* 触发按钮 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowCourseModal(true)}
            className={cn(
              "px-8 py-3 rounded-full",
              "bg-[#C23E32] text-white",
              "font-serif tracking-wider",
              "shadow-lg shadow-red-900/20",
              "hover:bg-[#A33428] hover:shadow-xl",
              "transition-all duration-300"
            )}
          >
            选择修习内容
          </button>

          <button
            onClick={() => setShowCalendarModal(true)}
            className={cn(
              "px-8 py-3 rounded-full",
              "border-2 border-[#2B2B2B] text-[#2B2B2B]",
              "font-serif tracking-wider",
              "hover:bg-[#2B2B2B] hover:text-white",
              "transition-all duration-300",
              "bg-transparent"
            )}
          >
            查看修习足迹
          </button>
        </div>
      </div>

      {/* 弹窗 A：词书切换 */}
      <InkModal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        title="选择修习内容"
        subtitle="心静自然凉，书山有路勤为径"
      >
        <div className="grid grid-cols-2 gap-4">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(course.id)}
              className={cn(
                "relative aspect-[3/4] rounded-lg",
                "border-2 transition-all duration-300",
                "flex flex-col items-center justify-center p-4",
                "group bg-transparent",
                selectedCourse === course.id
                  ? "border-[#C23E32] bg-red-50/30"
                  : "border-stone-300 hover:border-stone-400 hover:bg-stone-50/50"
              )}
            >
              {/* 进行中标签 */}
              {selectedCourse === course.id && (
                <div
                  className={cn(
                    "absolute -top-2 -right-2",
                    "px-2 py-0.5 rounded-full",
                    "bg-[#C23E32] text-white",
                    "text-[10px] font-sans",
                    "flex items-center gap-1"
                  )}
                >
                  <Check className="w-3 h-3" />
                  进行中
                </div>
              )}

              {/* 古籍封面装饰 */}
              <div
                className={cn(
                  "w-full h-full rounded",
                  "border border-dashed",
                  "flex flex-col items-center justify-center gap-2",
                  selectedCourse === course.id
                    ? "border-[#C23E32]/40"
                    : "border-stone-300 group-hover:border-stone-400"
                )}
              >
                {/* 竖排书名 */}
                <div className="flex flex-col items-center">
                  {course.name.split("").map((char, i) => (
                    <span
                      key={i}
                      className={cn(
                        "font-serif text-lg leading-tight",
                        selectedCourse === course.id
                          ? "text-[#C23E32]"
                          : "text-[#2B2B2B]"
                      )}
                    >
                      {char}
                    </span>
                  ))}
                </div>

                {/* 词汇量 */}
                <span className="mt-2 text-[10px] text-[#787878] font-sans">
                  {course.words.toLocaleString()} 词
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* 确认按钮 */}
        <button
          onClick={() => setShowCourseModal(false)}
          className={cn(
            "w-full mt-6 py-3 rounded-full",
            "bg-[#2B2B2B] text-white",
            "font-serif tracking-wider",
            "hover:bg-[#1a1a1a]",
            "transition-all duration-300"
          )}
        >
          确认选择
        </button>
      </InkModal>

      {/* 弹窗 B：签到日历 */}
      <InkModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        title="修习足迹"
        subtitle={`连续签到 ${streakDays} 天`}
      >
        {/* 月份标题 */}
        <div className="flex items-center justify-center mb-4">
          <span className="font-serif text-lg text-[#2B2B2B]">一月</span>
          <span className="ml-2 text-sm text-[#787878]">2026</span>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs text-[#787878] font-sans py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className="aspect-square flex flex-col items-center justify-center relative"
            >
              {day !== null && (
                <>
                  {/* 日期数字 */}
                  <span
                    className={cn(
                      "text-sm font-sans relative z-10",
                      "w-7 h-7 flex items-center justify-center rounded-full",
                      day === today
                        ? "text-[#C23E32] border-2 border-[#C23E32] font-medium"
                        : day > today
                          ? "text-stone-300"
                          : "text-[#2B2B2B]"
                    )}
                  >
                    {day}
                  </span>

                  {/* 签到墨点 */}
                  {checkInDays.includes(day) && (
                    <div
                      className={cn(
                        "absolute bottom-0.5",
                        "w-1.5 h-1.5 rounded-full",
                        "bg-[#C23E32]"
                      )}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* 统计信息 */}
        <div className="mt-6 pt-4 border-t border-stone-200">
          <div className="flex justify-around text-center">
            <div>
              <div className="font-serif text-2xl text-[#C23E32]">
                {checkInDays.length}
              </div>
              <div className="text-xs text-[#787878] mt-1">本月签到</div>
            </div>
            <div className="w-px bg-stone-200" />
            <div>
              <div className="font-serif text-2xl text-[#2B2B2B]">
                {streakDays}
              </div>
              <div className="text-xs text-[#787878] mt-1">连续天数</div>
            </div>
            <div className="w-px bg-stone-200" />
            <div>
              <div className="font-serif text-2xl text-[#2B2B2B]">89</div>
              <div className="text-xs text-[#787878] mt-1">累计签到</div>
            </div>
          </div>
        </div>
      </InkModal>
    </div>
  )
}
