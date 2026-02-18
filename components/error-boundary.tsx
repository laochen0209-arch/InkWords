/**
 * @file error-boundary.tsx
 * @description 错误边界组件 - 捕获子组件错误，防止应用崩溃
 * @author InkWords Team
 */

'use client'

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 可以在这里发送错误到监控服务
    console.error('ErrorBoundary 捕获到错误:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-ink-paper p-4">
          <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-serif font-semibold text-ink-black mb-2">
              出错了
            </h2>
            <p className="text-ink-gray/70 mb-6 text-sm">
              页面加载出现问题，请尝试刷新
            </p>
            {this.state.error && (
              <p className="text-xs text-red-500/70 mb-4 bg-red-50 p-2 rounded">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-ink-vermilion text-white rounded-lg hover:bg-ink-vermilion/90 transition-colors font-serif"
            >
              <RefreshCw className="w-4 h-4" />
              刷新页面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
