"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

// 自定义水墨风格滑块组件
function InkSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  leftLabel,
  rightLabel,
}: {
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  leftLabel?: string
  rightLabel?: string
}) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="flex items-center gap-3 w-full">
      {leftLabel && (
        <span className="text-xs text-ink-gray font-serif shrink-0">{leftLabel}</span>
      )}
      <div className="relative flex-1 h-8 flex items-center">
        {/* 轨道背景 - 墨迹肌理 */}
        <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-stone-300 via-stone-400 to-stone-300 rounded-full" />
        {/* 已填充部分 - 朱砂红 */}
        <div
          className="absolute left-0 h-[2px] bg-[#C23E32] rounded-full transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
        {/* 滑块输入 */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
        />
        {/* 滑块头 - 朱砂红圆点 */}
        <div
          className="absolute w-4 h-4 bg-[#C23E32] rounded-full shadow-md shadow-red-900/30 transition-all duration-150 pointer-events-none"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
      {rightLabel && (
        <span className="text-xs text-ink-gray font-serif shrink-0">{rightLabel}</span>
      )}
    </div>
  )
}

// 自定义水墨风格单选按钮组（胶囊样式）
function InkRadioGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[]
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-serif transition-all duration-300",
            value === opt.value
              ? "bg-[#C23E32] text-white shadow-md shadow-red-900/20"
              : "bg-stone-100/80 text-ink-gray hover:bg-stone-200/80"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// 自定义水墨风格圆形单选框
function InkRadioCircle({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[]
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="flex gap-4">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="flex items-center gap-2 group"
        >
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
              value === opt.value
                ? "border-[#C23E32] bg-[#C23E32]"
                : "border-stone-400 bg-transparent group-hover:border-stone-500"
            )}
          >
            {value === opt.value && (
              <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in-50 duration-200" />
            )}
          </div>
          <span
            className={cn(
              "text-sm font-serif transition-colors duration-300",
              value === opt.value ? "text-ink-black" : "text-ink-gray"
            )}
          >
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// 自定义水墨风格开关组件
function InkSwitch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-12 h-7 rounded-full transition-all duration-300",
        checked
          ? "bg-[#C23E32] shadow-inner shadow-red-900/30"
          : "bg-stone-300 shadow-inner shadow-stone-400/30"
      )}
    >
      <div
        className={cn(
          "absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300",
          checked ? "left-6" : "left-1"
        )}
      />
    </button>
  )
}

// 设置项行组件
function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1">
        <span className="text-base font-serif text-ink-black">{label}</span>
        {description && (
          <p className="text-xs text-ink-gray mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0 ml-4">{children}</div>
    </div>
  )
}

// 设置分组组件
function SettingSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="py-4">
      <h2 className="text-sm font-serif text-ink-gray mb-2 tracking-wider">
        {title}
      </h2>
      <div className="divide-y divide-stone-200/60">{children}</div>
    </section>
  )
}

export default function SettingsPage() {
  // 状态管理
  const [fontSize, setFontSize] = useState(50)
  const [dailyGoal, setDailyGoal] = useState("20")
  const [accent, setAccent] = useState("us")
  const [darkMode, setDarkMode] = useState(false)

  const dailyGoalOptions = [
    { label: "10词", value: "10" },
    { label: "20词", value: "20" },
    { label: "50词", value: "50" },
  ]

  const accentOptions = [
    { label: "美音", value: "us" },
    { label: "英音", value: "uk" },
  ]

  return (
    <main className="relative min-h-screen bg-ink-paper">
      {/* 水墨背景 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 blur-sm pointer-events-none"
        style={{ backgroundImage: "url('/images/ink-landscape-bg.jpg')" }}
        aria-hidden="true"
      />

      {/* 内容层 */}
      <div className="relative z-10">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-20 bg-ink-paper/80 backdrop-blur-md border-b border-stone-200/60">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
            <Link
              href="/"
              className="p-2 -ml-2 text-ink-gray hover:text-ink-black transition-colors"
              aria-label="返回"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <h1 className="flex-1 text-center font-serif text-lg text-ink-black tracking-wider">
              设置
            </h1>
            {/* 占位元素保持标题居中 */}
            <div className="w-9" />
          </div>
        </header>

        {/* 主内容区 */}
        <div className="max-w-2xl mx-auto px-4 pb-12">
          {/* 分组一：阅读体验 */}
          <SettingSection title="阅读体验">
            <div className="py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-serif text-ink-black">字号</span>
                <span className="text-sm text-ink-gray font-mono">{fontSize}%</span>
              </div>
              <InkSlider
                value={fontSize}
                onChange={setFontSize}
                min={50}
                max={150}
                leftLabel="小"
                rightLabel="大"
              />
            </div>
          </SettingSection>

          <div className="border-b border-stone-200/60" />

          {/* 分组二：修习偏好 */}
          <SettingSection title="修习偏好">
            <div className="py-4">
              <span className="text-base font-serif text-ink-black block mb-3">
                每日新词
              </span>
              <InkRadioGroup
                options={dailyGoalOptions}
                value={dailyGoal}
                onChange={setDailyGoal}
              />
            </div>

            <SettingRow label="发音偏好">
              <InkRadioCircle
                options={accentOptions}
                value={accent}
                onChange={setAccent}
              />
            </SettingRow>
          </SettingSection>

          <div className="border-b border-stone-200/60" />

          {/* 分组三：通用 */}
          <SettingSection title="通用">
            <SettingRow
              label="墨色模式"
              description="开启后界面将切换为深色主题"
            >
              <InkSwitch checked={darkMode} onChange={setDarkMode} />
            </SettingRow>
          </SettingSection>

          {/* 底部版本信息 */}
          <div className="mt-12 text-center">
            <p className="text-xs text-ink-gray/60 font-serif">
              墨语 InkWords v1.0.0
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
