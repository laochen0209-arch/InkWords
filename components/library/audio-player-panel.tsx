"use client"

import { useState, useEffect, useRef } from "react"
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Gauge } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AudioPlayerPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AudioPlayerPanel({ isOpen, onClose }: AudioPlayerPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(180)
  const [volume, setVolume] = useState(80)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    setCurrentTime(newTime)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value))
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
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
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col max-h-[70vh]">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5 text-ink-vermilion" strokeWidth={1.5} />
                  <h2 className="font-serif text-xl font-semibold text-ink-black">
                    音频播放器
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
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-ink-vermilion to-ink-vermilion/80 shadow-2xl flex items-center justify-center">
                        <button
                          type="button"
                          onClick={handlePlayPause}
                          className="w-16 h-16 rounded-full bg-white text-ink-vermilion hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg"
                        >
                          {isPlaying ? (
                            <Pause className="w-8 h-8" strokeWidth={2} />
                          ) : (
                            <Play className="w-8 h-8 ml-1" strokeWidth={2} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleSkip(-15)}
                        className="p-3 rounded-full bg-gray-100 text-ink-gray hover:bg-gray-200 transition-colors"
                      >
                        <SkipBack className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSkip(15)}
                        className="p-3 rounded-full bg-gray-100 text-ink-gray hover:bg-gray-200 transition-colors"
                      >
                        <SkipForward className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-ink-gray/60">
                        <span>进度</span>
                        <span className="font-mono">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink-vermilion [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-ink-gray/60">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4" strokeWidth={1.5} />
                          <span>音量</span>
                        </div>
                        <span className="font-mono">{volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink-vermilion [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-ink-gray/60">
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4" strokeWidth={1.5} />
                          <span>播放速度</span>
                        </div>
                        <span className="font-mono">{playbackSpeed}x</span>
                      </div>
                      <div className="flex gap-2">
                        {[0.5, 0.75, 1.0, 1.25, 1.5].map((speed) => (
                          <button
                            key={speed}
                            type="button"
                            onClick={() => handleSpeedChange(speed)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                              playbackSpeed === speed
                                ? 'bg-ink-vermilion text-white shadow-md'
                                : 'bg-gray-100 text-ink-gray hover:bg-gray-200'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
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
