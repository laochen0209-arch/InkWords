/**
 * @file logger.ts
 * @description 日志工具 - 开发环境输出，生产环境静默
 * @author InkWords Team
 */

const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args)
    }
  },
  error: (...args: any[]) => {
    // 错误日志始终输出，但生产环境可以发送到监控服务
    console.error(...args)
  },
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args)
    }
  },
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args)
    }
  }
}
