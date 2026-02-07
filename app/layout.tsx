import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ink-toast/toast-context"
import { GlobalClickEffect } from "@/components/global-click-effect"
import { LanguageProvider } from "@/lib/contexts/language-context"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { SpeedInsights } from "@vercel/speed-insights/next"
export const metadata: Metadata = {
  title: "墨语 InkWords",
  description: "极简东方美学语言学习",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <html lang="zh-CN">
          <body className="antialiased">
            <GlobalClickEffect />
              <ToastProvider>
                {children}
              </ToastProvider>
            <SpeedInsights />
          </body>
        </html>
      </LanguageProvider>
    </AuthProvider>
  )
}
