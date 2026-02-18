/**
 * @file theme-init.tsx
 * @description 主题初始化组件 - 在应用启动时加载保存的外观设置
 * @author InkWords Team
 * @date 2026-02-11
 */

"use client";

import { useEffect } from "react";

/**
 * 主题初始化组件
 * 在应用启动时从 localStorage 加载保存的外观设置
 */
export function ThemeInit() {
  useEffect(() => {
    // 只在客户端执行
    if (typeof window === "undefined") return;

    try {
      // 加载字体大小设置
      const savedFontSize = localStorage.getItem("inkwords_font_size");
      if (savedFontSize) {
        const fontSizeMap: Record<string, string> = {
          small: "14px",
          medium: "16px",
          large: "18px",
          xlarge: "20px",
        };
        const fontSize = fontSizeMap[savedFontSize] || "16px";
        document.documentElement.style.fontSize = fontSize;
      }

      // 加载深色模式设置
      const savedDarkMode = localStorage.getItem("inkwords_dark_mode");
      if (savedDarkMode === "true") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (error) {
      console.error("[ThemeInit] 加载主题设置失败:", error);
    }
  }, []);

  // 这个组件不渲染任何内容
  return null;
}
