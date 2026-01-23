import React from "react"
import type { Metadata } from 'next'
import { Inter, Noto_Serif_SC } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { GlobalClickEffect } from '@/components/global-click-effect'
import { ToastProvider } from '@/components/ink-toast/toast-context'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

const notoSerifSC = Noto_Serif_SC({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: '--font-noto-serif-sc'
})

export const metadata: Metadata = {
  title: '墨语 InkWords - 静心修习，日积跬步',
  description: '墨语语言学习平台 - 新中式极简主义设计',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${notoSerifSC.variable} font-sans antialiased`}>
        <ToastProvider>
          <GlobalClickEffect />
          {children}
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  )
}
