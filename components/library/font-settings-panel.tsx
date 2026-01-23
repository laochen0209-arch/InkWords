"use client"

import { useState } from "react"
import { X, Type, Check, Sun, Moon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FontSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function FontSettingsPanel({ isOpen, onClose }: FontSettingsPanelProps) {
  const [fontSize, setFontSize] = useState(16)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [fontFamily, setFontFamily] = useState("serif")
  const [darkMode, setDarkMode] = useState(false)

  const fontFamilies = [
    { id: "serif", name: "衬线体", preview: "Aa" },
    { id: "sans", name: "无衬线体", preview: "Aa" },
    { id: "mono", name: "等宽字体", preview: "Aa" }
  ]

  const fontSizes = [14, 16, 18, 20, 22, 26]

  const lineHeights = [1.4, 1.6, 1.8, 2.0, 2.2]

  const handleFontSizeChange = (size: number) => {
    setFontSize(size)
  }

  const handleLineHeightChange = (height: number) => {
    setLineHeight(height)
  }

  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family)
  }

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode)
  }

  const getFontFamilyClass = (family: string) => {
    switch (family) {
      case "serif":
        return "font-serif"
      case "sans":
        return "font-sans"
      case "mono":
        return "font-mono"
      default:
        return "font-serif"
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-ink-vermilion" strokeWidth={1.5} />
                  <h2 className="font-serif text-xl font-semibold text-ink-black">
                    字体设置
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-ink-gray" strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-md mx-auto space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-ink-gray/60 uppercase tracking-wider">
                      字体大小
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {fontSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleFontSizeChange(size)}
                          className={`py-3 rounded-xl text-sm font-medium transition-all ${
                            fontSize === size
                              ? 'bg-ink-vermilion text-white shadow-md'
                              : 'bg-gray-100 text-ink-gray hover:bg-gray-200'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-ink-gray/60 uppercase tracking-wider">
                      字体样式
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {fontFamilies.map((font) => (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => handleFontFamilyChange(font.id)}
                          className={`py-3 rounded-xl transition-all ${
                            fontFamily === font.id
                              ? 'bg-ink-vermilion text-white shadow-md'
                              : 'bg-gray-100 text-ink-gray hover:bg-gray-200'
                          }`}
                        >
                          <div className={`text-lg ${getFontFamilyClass(font.id)}`}>
                            {font.preview}
                          </div>
                          <div className="text-xs mt-1">
                            {font.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-ink-gray/60 uppercase tracking-wider">
                      行高
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      {lineHeights.map((height) => (
                        <button
                          key={height}
                          type="button"
                          onClick={() => handleLineHeightChange(height)}
                          className={`py-2 rounded-xl text-sm font-medium transition-all ${
                            lineHeight === height
                              ? 'bg-ink-vermilion text-white shadow-md'
                              : 'bg-gray-100 text-ink-gray hover:bg-gray-200'
                          }`}
                        >
                          {height}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-ink-gray/60 uppercase tracking-wider">
                      预览效果
                    </h3>
                    <div className="bg-ink-paper/50 rounded-2xl p-6">
                      <div
                        className={`${getFontFamilyClass(fontFamily)}`}
                        style={{
                          fontSize: `${fontSize}px`,
                          lineHeight: lineHeight
                        }}
                      >
                        <p className="text-ink-black/90 mb-3">
                          The quick brown fox jumps over the lazy dog.
                        </p>
                        <p className="text-ink-gray/70">
                          快速的棕色狐狸跳过懒狗。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {darkMode ? (
                          <Moon className="w-5 h-5 text-ink-gray" strokeWidth={1.5} />
                        ) : (
                          <Sun className="w-5 h-5 text-ink-gray" strokeWidth={1.5} />
                        )}
                        <span className="text-sm font-medium text-ink-gray">
                          {darkMode ? '深色模式' : '浅色模式'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDarkModeToggle}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          darkMode
                            ? 'bg-ink-vermilion text-white shadow-md'
                            : 'bg-gray-100 text-ink-gray hover:bg-gray-200'
                        }`}
                      >
                        {darkMode ? (
                          <Moon className="w-4 h-4" strokeWidth={1.5} />
                        ) : (
                          <Sun className="w-4 h-4" strokeWidth={1.5} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
