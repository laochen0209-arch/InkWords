"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface InkDrop {
  id: number
  x: number
  y: number
  color: string
}

const INK_COLORS = [
  "#2b2b2b",
  "#2b2b2b",
  "#2b2b2b",
  "#4a0e0e",
]

export function GlobalClickEffect() {
  const [inkDrops, setInkDrops] = useState<InkDrop[]>([])

  const handleClick = useCallback((e: MouseEvent) => {
    const color = INK_COLORS[Math.floor(Math.random() * INK_COLORS.length)]
    
    const newDrop: InkDrop = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      color,
    }

    setInkDrops(prev => [...prev, newDrop])

    setTimeout(() => {
      setInkDrops(prev => prev.filter(drop => drop.id !== newDrop.id))
    }, 300)
  }, [])

  useEffect(() => {
    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [handleClick])

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    >
      <AnimatePresence>
        {inkDrops.map(drop => (
          <motion.div
            key={drop.id}
            initial={{ 
              scale: 0.3, 
              opacity: 0.6,
              x: drop.x - 20,
              y: drop.y - 20,
            }}
            animate={{ 
              scale: 1.2, 
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeOut" 
            }}
            style={{
              position: "absolute",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${drop.color}40 0%, ${drop.color}20 40%, transparent 70%)`,
              filter: "blur(2px)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
