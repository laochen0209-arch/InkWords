"use client"

import { useState, useEffect } from "react"
import { StudyCard } from "@/components/study/study-card"
import { SentenceCard } from "@/components/study/sentence-card"
import { ControlButtons } from "@/components/study/control-buttons"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BottomNavBar } from "@/components/library/bottom-nav-bar"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

interface WordItem {
  id: string
  zh: string
  en: string
  pinyin: string
  meaning: string
  en_hint?: string
  py_hint?: string
  example: string
  examplePinyin: string
  exampleMeaning: string
}

interface SentenceItem {
  id: string
  zh: string
  en: string
  pinyin: string
  en_hint?: string
  py_hint?: string
  audio?: string
}

interface StudyData {
  words: WordItem[]
  sentences: SentenceItem[]
  practiceLogs: Array<{
    id: string
    zh: string
    en: string
    pinyin: string
    meaning: string
    en_hint?: string
    py_hint?: string
    example: string
    examplePinyin: string
    exampleMeaning: string
    createdAt: Date
  }>
}

export default function StudyPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mode, setMode] = useState<"A" | "B">("B")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isInputError, setIsInputError] = useState(false)
  const [activeTab, setActiveTab] = useState<"home" | "practice" | "library" | "profile">("home")
  const [practiceMode, setPracticeMode] = useState<"word" | "sentence">("word")
  const [showHint, setShowHint] = useState(false)
  const [studyData, setStudyData] = useState<StudyData>({
    words: [],
    sentences: [],
    practiceLogs: []
  })
  const [isLoading, setIsLoading] = useState(true)
  
  const { learningMode, nativeLang, targetLang } = useLanguage()
  const t = TRANSLATIONS[learningMode]
  const router = useRouter()

  useEffect(() => {
    const fetchStudyData = async () => {
      try {
        const response = await fetch('/api/study/data', {
          method: 'GET',
          headers: {
            'x-user-id': localStorage.getItem('inkwords_user') || '',
          },
        })

        if (response.ok) {
          const data = await response.json()
          setStudyData(data)
        } else {
          console.error('Failed to fetch study data')
        }
      } catch (error) {
        console.error('Error fetching study data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudyData()
  }, [])

  const currentWord = studyData.words[currentIndex]
  const currentSentence = studyData.sentences[currentIndex]
  const progress = studyData.words.length > 0 
    ? ((currentIndex + 1) / studyData.words.length) * 100 
    : studyData.sentences.length > 0 
      ? ((currentIndex + 1) / studyData.sentences.length) * 100 
      : 0

  const handleNext = () => {
    if (mode === "B" && isInputError) {
      return
    }
    
    if (currentIndex < (practiceMode === "word" ? studyData.words.length - 1 : studyData.sentences.length - 1)) {
      setCurrentIndex(prev => prev + 1)
      setIsInputError(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setIsInputError(false)
    }
  }

  const handlePlay = () => {
    setIsPlaying(true)
    if ('speechSynthesis' in window) {
      let text: string
      let lang: string
      
      if (practiceMode === "word") {
        if (targetLang === "en") {
          text = currentWord?.en || ''
          lang = 'en-US'
        } else {
          text = currentWord?.zh || ''
          lang = 'zh-CN'
        }
      } else {
        if (targetLang === "en") {
          text = currentSentence?.en || ''
          lang = 'en-US'
        } else {
          text = currentSentence?.zh || ''
          lang = 'zh-CN'
        }
      }
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.onend = () => setIsPlaying(false)
      speechSynthesis.speak(utterance)
    }
    setTimeout(() => setIsPlaying(false), 1000)
  }

  const handleCorrectInput = () => {
    setTimeout(() => {
      if (currentIndex < (practiceMode === "word" ? studyData.words.length - 1 : studyData.sentences.length - 1)) {
        setCurrentIndex(prev => prev + 1)
        setIsInputError(false)
      }
    }, 500)
  }

  const handleInputError = () => {
    setIsInputError(true)
  }

  const handleInputStateChange = (isError: boolean) => {
    setIsInputError(isError)
  }

  const handleModeChange = (newMode: "A" | "B") => {
    setMode(newMode)
    setIsInputError(false)
    setShowHint(false)
  }

  const handlePracticeModeChange = (newMode: "word" | "sentence") => {
    setPracticeMode(newMode)
    setCurrentIndex(0)
    setIsInputError(false)
    setShowHint(false)
  }

  const handleHintToggle = () => {
    setShowHint(!showHint)
  }

  const handlePracticeSubmit = async () => {
    try {
      const response = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('inkwords_user') || '',
        },
        body: JSON.stringify({
          userId: localStorage.getItem('inkwords_user') || '',
          score: 100,
          mode: practiceMode,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Practice submitted:', data)
      } else {
        console.error('Failed to submit practice')
      }
    } catch (error) {
      console.error('Error submitting practice:', error)
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      
      <main className="relative z-10 min-h-screen overflow-y-auto">
        <header className="fixed top-0 left-0 right-0 z-40 w-full h-14 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200/50">
          <div className="h-full w-full max-w-2xl mx-auto px-4 flex items-center">
            <Link 
              href="/"
              className="w-10 h-10 flex items-center justify-center text-ink-black hover:text-ink-vermilion transition-colors"
              aria-label="返回"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            
            <h1 className="flex-1 text-center font-serif text-lg text-ink-black pr-10">
              {t.practice.title}
            </h1>
          </div>
        </header>

        <div className="w-full min-h-screen bg-[#FDFBF7]/70 pt-14 pb-8 md:bg-transparent md:min-h-0 md:max-w-2xl md:mx-auto md:my-8 md:rounded-xl md:shadow-[0_4px_20px_rgba(43,43,43,0.08)]">
          <div className="px-4 py-4">
            <div className="bg-[#FDFBF7]/80 backdrop-blur-sm px-4 py-3 border border-stone-200/30 md:bg-stone-100/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 font-serif">
                  {t.practice.progress}: {currentIndex + 1} / {practiceMode === "word" ? studyData.words.length : studyData.sentences.length}
                </span>
                <span className="text-sm text-ink-vermilion font-serif">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isInputError ? "bg-[#C23E32]" : "bg-ink-vermilion"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="px-4 py-6 flex flex-col items-center space-y-6">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handlePracticeModeChange("word")}
                  className={`px-6 py-2 rounded-full font-serif text-sm transition-all ${
                    practiceMode === "word"
                      ? "bg-[#C23E32] text-white"
                      : "bg-transparent border border-gray-500 text-gray-600 hover:bg-gray-500/10"
                  }`}
                >
                  {t.practice.tabs.word}
                </button>
                <button
                  type="button"
                  onClick={() => handlePracticeModeChange("sentence")}
                  className={`px-6 py-2 rounded-full font-serif text-sm transition-all ${
                    practiceMode === "sentence"
                      ? "bg-[#C23E32] text-white"
                      : "bg-transparent border border-gray-500 text-gray-600 hover:bg-gray-500/10"
                  }`}
                >
                  {t.practice.tabs.sentence}
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setMode("A")}
                  className={`px-6 py-2 rounded-full font-serif text-sm transition-all ${
                    mode === "A"
                      ? "bg-[#C23E32] text-white"
                      : "bg-transparent border border-gray-500 text-gray-600 hover:bg-gray-500/10"
                  }`}
                >
                  {t.practice.observe}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("B")}
                  className={`px-6 py-2 rounded-full font-serif text-sm transition-all ${
                    mode === "B"
                      ? "bg-[#C23E32] text-white"
                      : "bg-transparent border border-gray-500 text-gray-600 hover:bg-gray-500/10"
                  }`}
                >
                  {t.practice.write}
                </button>
              </div>

              <div className="flex items-center justify-center">
                {practiceMode === "word" ? (
                  <StudyCard
                    zh={currentWord?.zh || ''}
                    en={currentWord?.en || ''}
                    pinyin={currentWord?.pinyin || ''}
                    meaning={currentWord?.meaning || ''}
                    en_hint={currentWord?.en_hint}
                    py_hint={currentWord?.py_hint}
                    example={currentWord?.example}
                    examplePinyin={currentWord?.examplePinyin}
                    exampleMeaning={currentWord?.exampleMeaning}
                    mode={mode}
                    nativeLang={nativeLang}
                    targetLang={targetLang}
                    learningMode={learningMode}
                    showHint={showHint}
                    onHintToggle={handleHintToggle}
                    onCorrectInput={handleCorrectInput}
                    onError={handleInputError}
                    onInputStateChange={handleInputStateChange}
                  />
                ) : (
                  <SentenceCard
                    zh={currentSentence?.zh || ''}
                    en={currentSentence?.en || ''}
                    pinyin={currentSentence?.pinyin || ''}
                    en_hint={currentSentence?.en_hint}
                    py_hint={currentSentence?.py_hint}
                    mode={mode}
                    nativeLang={nativeLang}
                    targetLang={targetLang}
                    learningMode={learningMode}
                    onCorrectInput={handleCorrectInput}
                    onError={handleInputError}
                    onInputStateChange={handleInputStateChange}
                  />
                )}
              </div>

              <ControlButtons
                onUnknown={handlePrevious}
                onConfirm={handlePlay}
                onKnown={handleNext}
                isPlaying={isPlaying}
                isLocked={mode === "B" && isInputError}
              />
            </div>
          </div>
        </div>
      </main>
      
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  )
}
