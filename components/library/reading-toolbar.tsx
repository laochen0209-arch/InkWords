"use client"

import { useState } from "react"
import { BookOpen, Play, Type } from "lucide-react"
import { VocabularyPanel } from "./vocabulary-panel"
import { AudioPlayerPanel } from "./audio-player-panel"
import { FontSettingsPanel } from "./font-settings-panel"

interface ReadingToolbarProps {
  onVocabularyClick?: () => void
  onPlayClick?: () => void
  onFontClick?: () => void
}

export function ReadingToolbar({
  onVocabularyClick,
  onPlayClick,
  onFontClick
}: ReadingToolbarProps) {
  const [showVocabulary, setShowVocabulary] = useState(false)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [showFontSettings, setShowFontSettings] = useState(false)

  const handleVocabularyClick = () => {
    setShowVocabulary(true)
    onVocabularyClick?.()
  }

  const handlePlayClick = () => {
    setShowAudioPlayer(true)
    onPlayClick?.()
  }

  const handleFontClick = () => {
    setShowFontSettings(true)
    onFontClick?.()
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-sm z-50 border-t border-gray-100 flex justify-between items-center px-8 py-3 pb-6">
        <button
          type="button"
          onClick={handleVocabularyClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-ink-paper/50 text-ink-gray rounded-xl hover:bg-ink-paper hover:text-ink-black transition-colors"
        >
          <BookOpen className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-sm font-medium">生词本</span>
        </button>

        <button
          type="button"
          onClick={handlePlayClick}
          className="w-14 h-14 flex items-center justify-center bg-[#C23E32] text-white rounded-full shadow-lg hover:bg-[#C23E32]/90 transition-colors"
        >
          <Play className="w-6 h-6" strokeWidth={1.5} />
        </button>

        <button
          type="button"
          onClick={handleFontClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-ink-paper/50 text-ink-gray rounded-xl hover:bg-ink-paper hover:text-ink-black transition-colors"
        >
          <Type className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-sm font-medium">字体</span>
        </button>
      </div>

      <VocabularyPanel
        isOpen={showVocabulary}
        onClose={() => setShowVocabulary(false)}
      />

      <AudioPlayerPanel
        isOpen={showAudioPlayer}
        onClose={() => setShowAudioPlayer(false)}
      />

      <FontSettingsPanel
        isOpen={showFontSettings}
        onClose={() => setShowFontSettings(false)}
      />
    </>
  )
}
