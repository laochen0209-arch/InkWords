"use client"

import { motion, AnimatePresence } from "framer-motion"

/**
 * 墨迹渐现加载组件
 * 使用 framer-motion 实现墨滴从中心向四周轻微晕开的呼吸感动画
 * 加载结束时模糊度平滑降至0，而不是瞬间消失
 */
export function InkLoading() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ 
          opacity: 0,
          filter: "blur(0px)",
        }}
        transition={{ 
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFBF7]/80 backdrop-blur-sm"
      >
        <div className="relative">
          {/* 主墨滴 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0.3 }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.6, 0.3],
            }}
            exit={{
              scale: 0.5,
              opacity: 0,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-20 h-20 rounded-full bg-[#2B2B2B]/20"
            style={{
              filter: "blur(8px)",
            }}
          />
          
          {/* 外层墨晕 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0.1 }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            exit={{
              scale: 0.5,
              opacity: 0,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            className="absolute inset-0 rounded-full bg-[#2B2B2B]/10"
            style={{
              filter: "blur(12px)",
            }}
          />
          
          {/* 中心墨点 */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0.5 }}
            animate={{
              scale: [0.6, 0.9, 0.6],
              opacity: [0.5, 0.8, 0.5],
            }}
            exit={{
              scale: 0.3,
              opacity: 0,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.15,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#2B2B2B]/40"
            style={{
              filter: "blur(4px)",
            }}
          />
        </div>
        
        {/* 加载文字 */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="absolute bottom-20 font-serif text-sm text-[#787878] tracking-widest"
        >
          墨韵加载中...
        </motion.p>
      </motion.div>
    </AnimatePresence>
  )
}
