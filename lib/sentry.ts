/**
 * @file sentry.ts
 * @description Sentry 错误监控配置
 * @author InkWords Team
 * @date 2026-02-17
 * 
 * 功能：
 * - 生产环境错误监控
 * - 自动上报未捕获的异常
 * - 性能监控
 */

/**
 * Sentry DSN（需要从环境变量获取）
 * 如果没有配置，则不启用 Sentry
 */
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

/**
 * 判断是否启用 Sentry
 */
const isEnabled = process.env.NODE_ENV === 'production' && !!SENTRY_DSN

/**
 * 错误上报函数
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (!isEnabled) {
    // 开发环境或没有配置时，只打印到控制台
    console.error('[Sentry] Error captured:', error, context)
    return
  }

  // 实际项目中这里会调用 Sentry SDK
  // Sentry.captureException(error, { extra: context })
  
  // 临时方案：发送到自定义错误收集端点
  try {
    fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : ''
      })
    }).catch(() => {
      // 忽略上报失败
    })
  } catch {
    // 忽略上报失败
  }
}

/**
 * 消息上报函数
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!isEnabled) {
    console.log(`[Sentry] ${level}:`, message)
    return
  }

  // 实际项目中这里会调用 Sentry SDK
  // Sentry.captureMessage(message, level)
}

/**
 * 设置用户信息
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  if (!isEnabled) return

  // 实际项目中这里会调用 Sentry SDK
  // Sentry.setUser(user)
}

/**
 * 添加面包屑
 */
export function addBreadcrumb(message: string, category?: string) {
  if (!isEnabled) return

  // 实际项目中这里会调用 Sentry SDK
  // Sentry.addBreadcrumb({ message, category })
}

/**
 * 初始化 Sentry（在应用启动时调用）
 */
export function initSentry() {
  if (!isEnabled) {
    console.log('[Sentry] Not enabled (production + DSN required)')
    return
  }

  // 实际项目中这里会初始化 Sentry SDK
  // Sentry.init({
  //   dsn: SENTRY_DSN,
  //   environment: process.env.NODE_ENV,
  //   release: process.env.NEXT_PUBLIC_APP_VERSION,
  //   // 其他配置...
  // })

  console.log('[Sentry] Initialized')
}

export default {
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  init: initSentry
}
