"use client"

import { cn } from "@/lib/utils"

// 基础墨迹骨架组件
function InkSkeleton({ 
  className 
}: { 
  className?: string 
}) {
  return (
    <div
      className={cn(
        "bg-stone-200/80 animate-pulse rounded-md",
        className
      )}
    />
  )
}

// 1. 文章列表骨架 (For Library)
function ArticleListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div 
          key={i}
          className={cn(
            "bg-[#FDFBF7]/70 backdrop-blur-sm",
            "rounded-xl p-5",
            "border border-stone-200/50"
          )}
          style={{ animationDelay: `${i * 150}ms` }}
        >
          <div className="flex items-start gap-4">
            {/* 左侧：竖线标题 */}
            <div className="flex flex-col gap-2">
              <InkSkeleton className="w-1 h-16 rounded-full bg-stone-300/60" />
            </div>
            
            {/* 中间：正文预览 */}
            <div className="flex-1 space-y-3 pt-1">
              <InkSkeleton className="h-4 w-3/4 rounded-full" />
              <InkSkeleton className="h-3 w-full rounded-full bg-stone-200/60" />
              <InkSkeleton className="h-3 w-2/3 rounded-full bg-stone-200/60" />
            </div>
            
            {/* 右侧：圆形印记 */}
            <div className="flex-shrink-0">
              <InkSkeleton className="w-10 h-10 rounded-full bg-stone-200/70" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// 2. 单词卡片骨架 (For Home/Study)
function WordCardSkeleton() {
  return (
    <div 
      className={cn(
        "bg-[#FDFBF7]/80 backdrop-blur-sm",
        "rounded-2xl p-8",
        "border border-stone-200/50",
        "shadow-sm"
      )}
    >
      {/* 顶部装饰 */}
      <div className="flex justify-between items-center mb-6">
        <InkSkeleton className="w-16 h-3 rounded-full bg-stone-200/50" />
        <InkSkeleton className="w-6 h-6 rounded-full bg-stone-200/60" />
      </div>
      
      {/* 中间：大汉字区域 */}
      <div className="flex justify-center py-8">
        <InkSkeleton className="w-24 h-24 rounded-xl bg-stone-200/70" />
      </div>
      
      {/* 底部：释义区域 */}
      <div className="space-y-3 mt-6">
        <InkSkeleton className="h-4 w-1/2 mx-auto rounded-full" />
        <div className="flex justify-center gap-2 pt-2">
          <InkSkeleton className="h-3 w-16 rounded-full bg-stone-200/60" />
          <InkSkeleton className="h-3 w-20 rounded-full bg-stone-200/60" />
          <InkSkeleton className="h-3 w-14 rounded-full bg-stone-200/60" />
        </div>
      </div>
      
      {/* 底部按钮占位 */}
      <div className="flex justify-center gap-4 mt-8">
        <InkSkeleton className="w-12 h-12 rounded-full bg-stone-200/50" />
        <InkSkeleton className="w-12 h-12 rounded-full bg-stone-200/50" />
      </div>
    </div>
  )
}

// 3. 圆形头像骨架 (For Profile)
function AvatarSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  }
  
  return (
    <InkSkeleton 
      className={cn(
        sizeClasses[size],
        "rounded-full bg-stone-200/80"
      )} 
    />
  )
}

// 个人资料卡片骨架
function ProfileCardSkeleton() {
  return (
    <div 
      className={cn(
        "bg-[#FDFBF7]/80 backdrop-blur-sm",
        "rounded-2xl p-6",
        "border border-stone-200/50",
        "text-center"
      )}
    >
      {/* 头像 */}
      <div className="flex justify-center mb-4">
        <AvatarSkeleton size="lg" />
      </div>
      
      {/* 用户名 */}
      <InkSkeleton className="h-5 w-24 mx-auto rounded-full mb-2" />
      
      {/* 签名 */}
      <InkSkeleton className="h-3 w-32 mx-auto rounded-full bg-stone-200/60 mb-6" />
      
      {/* 统计数据 */}
      <div className="flex justify-center gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <InkSkeleton className="h-6 w-10 rounded-md" />
            <InkSkeleton className="h-2 w-8 rounded-full bg-stone-200/50" />
          </div>
        ))}
      </div>
    </div>
  )
}

// 演示页面
export default function SkeletonDemoPage() {
  return (
    <div className="relative min-h-screen">
      {/* 水墨山水背景 */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/images/ink-landscape-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="absolute inset-0 bg-[#FDFBF7]/20" />
      </div>

      {/* 内容区域 */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* 页面标题 */}
        <header className="text-center mb-12">
          <h1 className="font-serif text-3xl text-ink-black tracking-wider mb-3">
            墨迹骨架屏
          </h1>
          <p className="text-ink-gray text-sm font-serif">
            墨正晕染，静候片刻
          </p>
        </header>

        {/* 骨架屏展示区域 */}
        <div className="space-y-12">
          
          {/* 1. 文章列表骨架 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-5 bg-[#C23E32] rounded-full" />
              <h2 className="font-serif text-lg text-ink-black">
                文库列表
              </h2>
              <span className="text-xs text-ink-gray font-serif">Library</span>
            </div>
            <ArticleListSkeleton />
          </section>

          {/* 2. 单词卡片骨架 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-5 bg-[#C23E32] rounded-full" />
              <h2 className="font-serif text-lg text-ink-black">
                学习卡片
              </h2>
              <span className="text-xs text-ink-gray font-serif">Study Card</span>
            </div>
            <WordCardSkeleton />
          </section>

          {/* 3. 个人资料骨架 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-5 bg-[#C23E32] rounded-full" />
              <h2 className="font-serif text-lg text-ink-black">
                个人资料
              </h2>
              <span className="text-xs text-ink-gray font-serif">Profile</span>
            </div>
            <ProfileCardSkeleton />
          </section>

          {/* 头像尺寸展示 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-5 bg-[#7A9078] rounded-full" />
              <h2 className="font-serif text-lg text-ink-black">
                头像变体
              </h2>
              <span className="text-xs text-ink-gray font-serif">Avatar Sizes</span>
            </div>
            <div 
              className={cn(
                "bg-[#FDFBF7]/80 backdrop-blur-sm",
                "rounded-2xl p-6",
                "border border-stone-200/50",
                "flex items-end justify-center gap-8"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <AvatarSkeleton size="sm" />
                <span className="text-xs text-ink-gray font-serif">小</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AvatarSkeleton size="md" />
                <span className="text-xs text-ink-gray font-serif">中</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AvatarSkeleton size="lg" />
                <span className="text-xs text-ink-gray font-serif">大</span>
              </div>
            </div>
          </section>

        </div>

        {/* 底部说明 */}
        <footer className="mt-16 text-center">
          <p className="text-sm text-ink-gray/60 font-serif">
            「 墨迹未干，意境已成 」
          </p>
        </footer>
      </main>
    </div>
  )
}
