/**
 * @file page.tsx
 * @description 用户数据中心页面 - 展示用户学习数据统计和分析
 * @author InkWords Team
 * @date 2026-02-04
 */

'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, BarChart3, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDashboardData } from './hooks/use-dashboard-data'
import { StatCards } from './components/stat-cards'
import { ActivityCalendar } from './components/activity-calendar'
import { RecentTimeline } from './components/recent-timeline'
import { SkillRadar } from './components/skill-radar'
import { createBrowserClient } from '@/lib/supabase/client'

/**
 * 加载状态组件
 */
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-[#C23E32] border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-stone-600 font-serif">加载数据中...</p>
      </div>
    </div>
  )
}

/**
 * 错误状态组件
 */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-red-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold text-stone-800 mb-2">加载失败</h2>
        <p className="text-stone-500 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-[#C23E32] text-white rounded-lg hover:bg-[#A8352B] transition-colors flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          重新加载
        </button>
      </div>
    </div>
  )
}

/**
 * 支付成功加载状态组件
 */
function PaymentSuccessState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-paper ink-landscape-bg">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-600" strokeWidth={2} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-stone-800 mb-2 font-serif"
        >
          支付成功！
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-stone-500"
        >
          正在更新会员权益，即将跳转...
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <div className="w-48 h-1 bg-stone-200 rounded-full mx-auto overflow-hidden">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-1/2 h-full bg-[#C23E32] rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/**
 * Dashboard 内容组件
 */
function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 【修复】使用 ref 存储 supabase 客户端，避免重复创建
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null)
  
  // 初始化 supabase 客户端（只执行一次）
  if (!supabaseRef.current) {
    supabaseRef.current = createBrowserClient()
  }

  const isPaymentSuccess = searchParams.get('success') === 'true'
  const [isProcessingPayment, setIsProcessingPayment] = useState(isPaymentSuccess)

  useEffect(() => {
    // 【修复】添加标志位防止重复请求
    let isMounted = true
    
    const handlePaymentSuccess = async () => {
      if (isPaymentSuccess) {
        console.log('[Payment] 检测到支付成功，开始激活 VIP...')
        
        try {
          console.log('[Payment] 调用 activate-vip API...')
          const res = await fetch('/api/payment/activate-vip', { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error || 'Activation failed')
          }
          
          const result = await res.json()
          console.log('[Payment] VIP 激活成功:', result)
          
          if (isMounted) {
            console.log('[Payment] 刷新 Session 以更新前端状态...')
            await supabaseRef.current!.auth.refreshSession()
            
            setTimeout(() => {
              console.log('[Payment] 跳转到个人中心查看 VIP 状态')
              router.replace('/profile')
            }, 1500)
          }
          
        } catch (err: any) {
          console.error('[Payment] 自动开通失败:', err)
          if (isMounted) {
            alert('权益更新遇到延迟，请联系客服或稍后刷新。')
            setTimeout(() => {
              router.replace('/profile')
            }, 2000)
          }
        }
      }
    }

    handlePaymentSuccess()
    
    // 【修复】清理函数
    return () => {
      isMounted = false
    }
  // 【修复】移除 supabase 从依赖数组
  }, [isPaymentSuccess, router])

  const {
    stats,
    heatmapData,
    radarData,
    loading,
    error,
    getRecentActivities,
    refresh,
  } = useDashboardData()

  const recentActivities = getRecentActivities(10)

  useEffect(() => {
    document.title = '数据中心 - InkWords'
  }, [])

  if (isPaymentSuccess || isProcessingPayment) {
    return (
      <main className="min-h-screen bg-ink-paper ink-landscape-bg">
        <PaymentSuccessState />
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-ink-paper ink-landscape-bg">
        <LoadingState />
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-ink-paper ink-landscape-bg">
        <ErrorState message={error} onRetry={refresh} />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-ink-paper ink-landscape-bg">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200/50"
        >
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/home"
                className="flex items-center gap-2 text-stone-600 hover:text-[#C23E32] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-medium">返回首页</span>
              </Link>

              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-[#C23E32]" strokeWidth={1.5} />
                <h1 className="text-xl font-semibold text-stone-800 font-serif">
                  数据中心
                </h1>
              </div>

              <button
                onClick={refresh}
                className="flex items-center gap-2 text-stone-600 hover:text-[#C23E32] transition-colors"
              >
                <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm font-medium">刷新</span>
              </button>
            </div>
          </div>
        </motion.header>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-stone-800 font-serif">
              学习数据概览
            </h2>
            <p className="text-stone-500 mt-1">
              追踪你的学习进度，见证每一步成长
            </p>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="mb-8"
          >
            <StatCards stats={stats} />
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <ActivityCalendar data={heatmapData} />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <SkillRadar data={radarData} />
            </motion.section>
          </div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <RecentTimeline activities={recentActivities} />
          </motion.section>

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-stone-400">
              数据每小时自动更新 · 继续加油，保持学习！
            </p>
          </motion.footer>
        </div>
      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-ink-paper ink-landscape-bg">
        <LoadingState />
      </main>
    }>
      <DashboardContent />
    </Suspense>
  )
}
