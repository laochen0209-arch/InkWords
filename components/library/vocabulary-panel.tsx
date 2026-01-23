"use client"

import { useState } from "react"
import { X, BookOpen, Trash2, Volume2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface VocabularyWord {
  id: string
  word: string
  pronunciation: string
  meaning: string
  example: string
  exampleTranslation: string
  addedAt: string
}

interface VocabularyPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function VocabularyPanel({ isOpen, onClose }: VocabularyPanelProps) {
  const [words, setWords] = useState<VocabularyWord[]>([
    {
      id: "1",
      word: "serendipity",
      pronunciation: "/ˌser.ənˈdɪp.ə.ti/",
      meaning: "意外发现珍奇事物的本领",
      example: "Finding this book was pure serendipity.",
      exampleTranslation: "发现这本书纯属意外之喜。",
      addedAt: "2024-01-15"
    },
    {
      id: "2",
      word: "ephemeral",
      pronunciation: "/ɪˈfem.ər.əl/",
      meaning: "短暂的，转瞬即逝的",
      example: "The ephemeral beauty of cherry blossoms.",
      exampleTranslation: "樱花短暂的美。",
      addedAt: "2024-01-14"
    },
    {
      id: "3",
      word: "petrichor",
      pronunciation: "/ˈpet.rɪ.kɔːr/",
      meaning: "雨后泥土的芬芳",
      example: "I love the petrichor after summer rain.",
      exampleTranslation: "我喜欢夏雨后的泥土芬芳。",
      addedAt: "2024-01-13"
    },
    {
      id: "4",
      word: "luminescence",
      pronunciation: "/ˌluː.mɪˈnes.əns/",
      meaning: "冷光，发光",
      example: "The luminescence of fireflies at night.",
      exampleTranslation: "夜晚萤火虫的冷光。",
      addedAt: "2024-01-12"
    },
    {
      id: "5",
      word: "sonder",
      pronunciation: "/ˈsɒn.dər/",
      meaning: "意识到每个人都有复杂生活的感觉",
      example: "I had a moment of sonder on the crowded train.",
      exampleTranslation: "在拥挤的火车上，我有一刻意识到每个人都有复杂的生活。",
      addedAt: "2024-01-11"
    }
  ])

  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredWords = words.filter(word =>
    word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.meaning.includes(searchQuery)
  )

  const handleDelete = (id: string) => {
    setWords(words.filter(w => w.id !== id))
    if (selectedWord?.id === id) {
      setSelectedWord(null)
    }
  }

  const handlePlayPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
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
                  <BookOpen className="w-5 h-5 text-ink-vermilion" strokeWidth={1.5} />
                  <h2 className="font-serif text-xl font-semibold text-ink-black">
                    生词本
                  </h2>
                  <span className="text-sm text-ink-gray/60 ml-2">
                    ({words.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-ink-gray" strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索生词..."
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 outline-none focus:ring-2 focus:ring-ink-vermilion/20 text-ink-black placeholder:text-ink-gray/40"
                  />
                </div>

                <div className="px-4 space-y-3 pb-4">
                  {filteredWords.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-ink-gray/30 mx-auto mb-4" strokeWidth={1} />
                      <p className="text-ink-gray/60 font-serif">
                        没有找到相关生词
                      </p>
                    </div>
                  ) : (
                    filteredWords.map((word) => (
                      <motion.div
                        key={word.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-ink-vermilion/30 transition-all cursor-pointer"
                        onClick={() => setSelectedWord(word)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-serif text-lg font-semibold text-ink-black mb-1">
                              {word.word}
                            </h3>
                            <p className="text-sm text-ink-gray/60 font-mono">
                              {word.pronunciation}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePlayPronunciation(word.word)
                              }}
                              className="p-2 rounded-full bg-ink-vermilion/10 text-ink-vermilion hover:bg-ink-vermilion/20 transition-colors"
                            >
                              <Volume2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(word.id)
                              }}
                              className="p-2 rounded-full hover:bg-red-50 text-ink-gray/40 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>

                        <p className="text-base text-ink-black/80 mb-2">
                          {word.meaning}
                        </p>

                        <div className="bg-ink-paper/50 rounded-xl p-3">
                          <p className="text-sm text-ink-gray/70 mb-1 font-medium">
                            {word.example}
                          </p>
                          <p className="text-sm text-ink-gray/60 font-serif">
                            {word.exampleTranslation}
                          </p>
                        </div>

                        <p className="text-xs text-ink-gray/40 mt-2">
                          添加于 {word.addedAt}
                        </p>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
