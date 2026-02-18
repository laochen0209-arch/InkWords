/**
 * @file middleware.ts
 * @description Next.js Middleware - API 限流保护
 * @author InkWords Team
 * @date 2026-02-17
 * 
 * 功能：
 * - API 路由速率限制（基于 IP）
 * - 防止恶意攻击和滥用
 * - 安全响应头设置
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 简单的内存存储限流器
 * 生产环境建议使用 Redis
 */
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private readonly limit: number
  private readonly windowMs: number

  constructor(limit: number = 100, windowMs: number = 60000) {
    this.limit = limit
    this.windowMs = windowMs
  }

  /**
   * 检查是否允许请求
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || now > record.resetTime) {
      // 新窗口或窗口已过期
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (record.count < this.limit) {
      record.count++
      return true
    }

    return false
  }

  /**
   * 获取剩余请求数
   */
  getRemaining(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record) return this.limit
    return Math.max(0, this.limit - record.count)
  }

  /**
   * 清理过期的记录
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

// 创建限流器实例
// API 路由：每分钟 60 次请求
const apiLimiter = new RateLimiter(60, 60000)

// 认证路由：每分钟 10 次请求（更严格）
const authLimiter = new RateLimiter(10, 60000)

// 每 5 分钟清理一次过期记录
setInterval(() => {
  apiLimiter.cleanup()
  authLimiter.cleanup()
}, 300000)

/**
 * 获取客户端标识符（IP + User-Agent）
 */
function getClientIdentifier(request: NextRequest): string {
  // @ts-ignore - NextRequest 类型定义可能不包含 ip 属性
  const ip = (request as any).ip ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return `${ip}:${userAgent.slice(0, 50)}`
}

/**
 * Middleware 主函数
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 获取客户端标识
  const clientId = getClientIdentifier(request)

  // API 路由限流
  if (pathname.startsWith('/api/')) {
    // 认证相关路由使用更严格的限流
    if (pathname.startsWith('/api/auth/') || 
        pathname.includes('/login') || 
        pathname.includes('/register') ||
        pathname.includes('/reset-password')) {
      if (!authLimiter.isAllowed(clientId)) {
        return new NextResponse(
          JSON.stringify({
            error: 'Too many requests',
            message: '请稍后再试',
            retryAfter: 60
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
              'X-RateLimit-Limit': '10',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + 60)
            }
          }
        )
      }
    } else {
      // 普通 API 路由限流
      if (!apiLimiter.isAllowed(clientId)) {
        return new NextResponse(
          JSON.stringify({
            error: 'Too many requests',
            message: '请求过于频繁，请稍后再试',
            retryAfter: 60
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
              'X-RateLimit-Limit': '60',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + 60)
            }
          }
        )
      }
    }
  }

  // 创建响应
  const response = NextResponse.next()

  // 添加安全响应头
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-RateLimit-Limit', pathname.startsWith('/api/auth/') ? '10' : '60')
  response.headers.set('X-RateLimit-Remaining', String(
    pathname.startsWith('/api/auth/') 
      ? authLimiter.getRemaining(clientId)
      : apiLimiter.getRemaining(clientId)
  ))

  return response
}

/**
 * 匹配规则
 */
export const config = {
  matcher: [
    /*
     * 匹配所有 API 路由
     * 排除静态文件和 _next 内部路由
     */
    '/api/:path*',
  ],
}
