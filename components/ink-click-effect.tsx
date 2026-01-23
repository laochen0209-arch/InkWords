"use client"

import { useEffect, useState } from "react"

export function InkClickEffect() {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const ripple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      }
      setRipples(prev => [...prev, ripple])

      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== ripple.id))
      }, 600)
    }

    document.addEventListener("click", handleClick)
    return () => {
      document.removeEventListener("click", handleClick)
    }
  }, [])

  return (
    <>
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="w-32 h-32 rounded-full bg-ink-black/20 animate-ink-spread"
            style={{
              animation: "ink-spread 0.6s ease-out forwards",
            }}
          />
        </div>
      ))}
    </>
  )
}
