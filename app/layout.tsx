import type { Metadata, Viewport } from "next";
import { Noto_Serif_SC, Noto_Sans_SC } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import PreloadResources from "@/components/preload-resources";
import { ToastProvider } from "@/components/ink-toast/toast-context"
import { GlobalClickEffect } from "@/components/global-click-effect"
import { LanguageProvider } from "@/lib/contexts/language-context"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { ThemeInit } from "@/components/theme-init"
import { TidioProvider } from "@/components/tidio-provider"
import { ErrorBoundary } from "@/components/error-boundary"

/**
 * 中文字体配置 - 思源宋体
 * 用于标题和强调文字
 * 【优化】使用 optional 避免字体加载阻塞首屏
 */
const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "optional",
  preload: false,
});

/**
 * 中文字体配置 - 思源黑体
 * 用于正文和 UI 文字
 * 【优化】使用 optional 避免字体加载阻塞首屏
 */
const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "optional",
  preload: false,
});

/**
 * 网站元数据配置
 */
export const metadata: Metadata = {
  title: {
    default: "墨语 InkWords - 极简东方美学语言学习",
    template: "%s - 墨语 InkWords",
  },
  description: "墨语 InkWords 是一款融合东方美学与现代语言学习理念的应用，提供中文和英文学习体验，让学习成为一种享受。",
  keywords: ["语言学习", "中文学习", "英文学习", "墨语", "InkWords", "东方美学"],
  authors: [{ name: "InkWords Team" }],
  creator: "InkWords Team",
  publisher: "InkWords",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://inkwords.app",
    siteName: "墨语 InkWords",
    title: "墨语 InkWords - 极简东方美学语言学习",
    description: "墨语 InkWords 是一款融合东方美学与现代语言学习理念的应用",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "墨语 InkWords",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "墨语 InkWords - 极简东方美学语言学习",
    description: "墨语 InkWords 是一款融合东方美学与现代语言学习理念的应用",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-icon-180x180.png", sizes: "180x180" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#C23E32",
      },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "墨语 InkWords",
  },
  applicationName: "墨语 InkWords",
  formatDetection: {
    telephone: false,
  },
};

/**
 * 视口配置
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDFBF7" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${notoSerifSC.variable} ${notoSansSC.variable}`}
      suppressHydrationWarning
    >
      <head>
        <PreloadResources />
      </head>
      <body className="antialiased font-sans">
        <ErrorBoundary>
          <AuthProvider>
            <LanguageProvider>
              <ThemeInit />
              <GlobalClickEffect />
              <TidioProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </TidioProvider>
            </LanguageProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
