"use client"

/**
 * @file page.tsx
 * @description 新闻文章阅读页面
 * @author InkWords Team
 * @date 2026-02-08
 * @version 2.1.0 - 修复背景图重叠问题
 */

import { useState, useEffect, use, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Type, ArrowLeft, Volume2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { recordRead } from "@/lib/user-stats"
import { useAuth } from "@/lib/contexts/auth-context"
import { logger } from "@/lib/logger"

interface ArticleData {
  title_en: string
  title_zh: string
  category: string
  content_en: string
  content_zh: string
}

interface Para { en: string; zh: string }
interface Vocab { word: string; mean: string }

// 【关键修复】全局语音状态，确保所有组件共享
let globalVoicesLoaded = false
let globalVoices: SpeechSynthesisVoice[] = []

/**
 * 【关键修复】获取最佳语音
 */
const getBestVoice = (lang: string): SpeechSynthesisVoice | null => {
  if (!globalVoicesLoaded || globalVoices.length === 0) {
    globalVoices = window.speechSynthesis.getVoices()
  }
  
  if (globalVoices.length === 0) return null
  
  // 优先 Google/Microsoft 语音
  const googleVoice = globalVoices.find(v => 
    v.lang === lang && v.name.toLowerCase().includes("google")
  )
  if (googleVoice) return googleVoice
  
  const microsoftVoice = globalVoices.find(v => 
    v.lang === lang && v.name.toLowerCase().includes("microsoft")
  )
  if (microsoftVoice) return microsoftVoice
  
  // 回退到第一个匹配的语音
  return globalVoices.find(v => v.lang === lang) || null
}

/**
 * 【关键修复】语音播放函数，添加预加载和错误处理
 */
const speak = (text: string, lang = 'zh-CN') => {
  if (!text || typeof window === 'undefined') return
  
  try {
    // 【关键修复】停止之前的播放
    window.speechSynthesis.cancel()
    
    // 【关键修复】Chrome 浏览器需要 resume
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
    
    // 【关键修复】确保语音列表已加载
    if (!globalVoicesLoaded) {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        globalVoices = voices
        globalVoicesLoaded = true
      }
    }
    
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    
    // 【关键修复】设置最佳语音
    const bestVoice = getBestVoice(lang)
    if (bestVoice) {
      u.voice = bestVoice
      logger.log('[News Speak] 使用语音:', bestVoice.name)
    }
    
    u.rate = lang === 'en-US' ? 1.0 : 0.9
    u.pitch = 1.0
    u.volume = 1.0
    
    // 错误处理
    u.onerror = (event) => {
      if (event.error === 'interrupted' || event.error === 'canceled') {
        logger.log('[News Speak] 播放被中断（正常）')
      } else {
        logger.error('[News Speak] 播放错误:', event.error)
      }
    }
    
    // 【关键修复】使用 setTimeout 确保在用户交互上下文中执行
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(u)
        logger.log('[News Speak] 播放:', text.substring(0, 30) + '...')
      } catch (error) {
        logger.error('[News Speak] 播放失败:', error)
      }
    }, 10)
  } catch (error) {
    logger.error('[News Speak] 播放失败:', error)
  }
}

/**
 * 【关键修复】预加载语音列表
 */
const preloadVoices = () => {
  if (typeof window === 'undefined') return
  
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      globalVoices = voices
      globalVoicesLoaded = true
      logger.log('[News Speak] 语音列表已加载:', voices.length)
    }
  }
  
  loadVoices()
  
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    const originalHandler = window.speechSynthesis.onvoiceschanged
    window.speechSynthesis.onvoiceschanged = (ev) => {
      loadVoices()
      if (originalHandler) originalHandler.call(window.speechSynthesis, ev)
    }
  }
}

const RenderEnglish = ({ text, vocabMap, fontSize }: { text: string, vocabMap: Map<string, string>, fontSize: string }) => {
  if (!text) return null
  const parts = text.split(/([a-zA-Z0-9-']+)/)
  return (
    <div className="flex gap-4 items-start">
      <p className={`flex-1 font-serif leading-relaxed text-stone-800 ${fontSize === 'xl' ? 'text-2xl' : 'text-xl'}`}>
        {parts.map((part, i) => {
          const word = part.toLowerCase().replace(/[^a-z]/g, '')
          const mean = vocabMap.get(word)
          if (!word) return <span key={i}>{part}</span>
          if (mean) {
            return (
              <span key={i} className="group relative inline-block mx-0.5">
                <span 
                  className="cursor-help border-b-2 border-[#C23E32]/30 text-[#C23E32]/90 font-medium group-hover:bg-[#C23E32]/10 group-hover:border-[#C23E32] transition-colors rounded-sm px-0.5"
                  onClick={(e) => { e.stopPropagation(); speak(part, 'en-US') }}
                >
                  {part}
                </span>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-stone-900 text-white text-sm rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 flex flex-col items-center gap-1 min-w-[80px]">
                  <span className="flex items-center gap-1 font-bold text-yellow-400 text-xs uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Key Word
                  </span>
                  <span className="font-serif text-base">{mean}</span>
                  <span className="text-[10px] text-stone-400 bg-white/10 px-2 py-0.5 rounded-full mt-1 flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> Click to listen
                  </span>
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900"></span>
                </span>
              </span>
            )
          }
          return (
            <span 
              key={i} 
              className="hover:bg-stone-100 hover:text-stone-600 rounded-sm transition-colors cursor-pointer active:scale-95 active:text-blue-600 select-none"
              onClick={(e) => { e.stopPropagation(); speak(part, 'en-US') }}
              title="Click to pronounce"
            >
              {part}
            </span>
          )
        })}
      </p>
      <button
        onClick={(e) => { e.stopPropagation(); speak(text, 'en-US') }}
        className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white border border-stone-200 text-stone-400 hover:border-[#C23E32] hover:text-[#C23E32] active:scale-95 transition-all"
        title="朗读整句"
      >
        <Volume2 className="w-5 h-5" />
      </button>
    </div>
  )
}

const RenderChinese = ({ text, fontSize }: { text: string, fontSize: string }) => {
  if (!text) return null
  const parts = text.split(/([\u4e00-\u9fa5]+)/)
  return (
    <div className="flex gap-4 items-start">
      <p className={`flex-1 font-serif leading-loose text-stone-600 ${fontSize}`}>
        {parts.map((part, i) => {
          if (/[\u4e00-\u9fa5]/.test(part)) {
            return (
              <span
                key={i}
                className="hover:bg-stone-200 hover:text-stone-800 rounded-sm transition-colors cursor-pointer select-none inline-block mx-0.5"
                onClick={(e) => { e.stopPropagation(); speak(part, 'zh-CN') }}
                title="点击朗读"
              >
                {part}
              </span>
            )
          }
          return <span key={i}>{part}</span>
        })}
      </p>
      <button
        onClick={(e) => { e.stopPropagation(); speak(text, 'zh-CN') }}
        className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white border border-stone-200 text-stone-400 hover:border-[#C23E32] hover:text-[#C23E32] active:scale-95 transition-all"
        title="朗读整句"
      >
        <Volume2 className="w-5 h-5" />
      </button>
    </div>
  )
}

const Loading = () => (
  <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-[#C23E32] mx-auto mb-4" />
      <p className="text-stone-600 font-serif">Loading...</p>
    </div>
  </div>
)

export default function UnifiedReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { user } = useAuth()

  const [article, setArticle] = useState<ArticleData | null>(null)
  const [paras, setParas] = useState<Para[]>([])
  const [vocabList, setVocabList] = useState<Vocab[]>([])
  const [loading, setLoading] = useState(true)
  const [size, setSize] = useState<"lg" | "xl">("lg")

  useEffect(() => {
    // 【关键修复】预加载语音列表
    preloadVoices()
  }, [])

  const vocabMap = useMemo(() => {
    const map = new Map<string, string>()
    vocabList.forEach(v => {
      if (v.word && v.mean) map.set(v.word.toLowerCase(), v.mean)
    })
    return map
  }, [vocabList])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/articles/${resolvedParams.id}`)
        if (!res.ok) throw new Error("Fetch failed")
        const raw: any = await res.json()
        
        if (!raw) {
          setLoading(false)
          setArticle({
            title_en: "Content Not Found",
            title_zh: "内容不存在",
            content_en: "",
            content_zh: "",
            category: "ERROR"
          })
          return
        }
        const cEn = raw.contentEn || raw.content_en || ""
        const cZh = raw.contentZh || raw.content_zh || ""
        const tEn = raw.titleEn || raw.title_en || "Untitled"
        const tZh = raw.titleZh || raw.title_zh || ""
        const cat = raw.category || "STORY"
        
        logger.log('原始数据:', { 
          contentEn: cEn.substring(0, 200), 
          contentZh: cZh.substring(0, 200),
          titleEn: tEn,
          titleZh: tZh,
          category: cat
        })
        
        let pList: Para[] = []
        let vList: Vocab[] = []
        
        try {
          if (cEn.trim().startsWith('{')) {
            const json = JSON.parse(cEn)
            if (json.paragraphs?.length) {
              pList = json.paragraphs
              if (json.vocab_data) vList = json.vocab_data
            }
          }
        } catch (e) {
          logger.error("JSON 解析失败:", e)
          // JSON 解析失败，使用备用方案
        }
        
        if (pList.length === 0) {
          const split = (t: string) => t.split(/\r?\n/).filter((x: string) => x.trim()) || []
          let enTxt = cEn.trim().startsWith('{') ? "" : cEn
          let en = split(enTxt)
          let zh = split(cZh.replace(/【.*?】/g, '').trim())
          
          if (enTxt.length > 100) {
            en = enTxt.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g)?.map((s: string) => s.trim()) || []
          }
          if (cZh.length > 100) {
            zh = cZh.match(/[^。！？]+[。！？]+["']?|[^。！？]+$/g)?.map((s: string) => s.trim()) || []
          }
          
          for (let i = 0; i < Math.min(en.length, zh.length); i++) {
            const enPara = en[i] || ""
            const zhPara = zh[i] || ""
            
            pList.push({ en: enPara, zh: zhPara })
            
            const enWords = enPara.match(/[a-zA-Z]+/g) || []
            enWords.forEach((word: string) => {
              if (!vList.find(v => v.word.toLowerCase() === word.toLowerCase())) {
                vList.push({ word: word, mean: "" })
              }
            })
          }
        }
        
        setParas(pList)
        setVocabList(vList)
        setArticle({
          title_en: tEn,
          title_zh: tZh,
          content_en: cEn,
          content_zh: cZh,
          category: cat
        })

        // 记录阅读活动
        try {
          if (user?.id) {
            await recordRead(1, user.id)
            logger.log('[News] 阅读记录已更新')
          }
        } catch (error) {
          logger.error('[News] 更新阅读记录失败:', error)
        }
      } catch (e) {
        logger.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [resolvedParams.id])

  if (loading) return <Loading />
  if (!article) return <div className="p-8 text-center text-stone-600">Content Not Found</div>

  const zhTextSize = size === 'xl' ? 'text-xl' : 'text-lg'

  return (
    <div className="min-h-screen bg-[#FDFBF7] ink-landscape-bg">
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-stone-200/50 flex items-center justify-between px-4">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-stone-100 transition-colors"><ArrowLeft className="w-6 h-6 text-stone-600" /></button>
        <div className="text-center">
          <div className="font-serif font-bold text-stone-800 max-w-[200px] truncate">{article.title_en}</div>
          <div className="text-[10px] text-stone-400 uppercase tracking-widest">{article.category}</div>
        </div>
        <button onClick={() => setSize(s => s === 'lg' ? 'xl' : 'lg')} className="p-2 rounded-full hover:bg-stone-100 transition-colors"><Type className="w-5 h-5 text-stone-600" /></button>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-24">
        <div className="text-center mb-10">
          <h1 className={`font-serif font-bold text-stone-900 mb-3 leading-tight ${size === 'xl' ? 'text-4xl' : 'text-3xl'}`}>
            {article.title_en}
          </h1>
          <h2 className="text-stone-500 font-serif text-lg">
            {article.title_zh}
          </h2>
        </div>

        <div className="space-y-6">
          {paras.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-stone-200/50 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6 pb-4">
                <RenderEnglish text={p.en} vocabMap={vocabMap} fontSize={size} />
              </div>
              {p.en && p.zh && <div className="h-px bg-stone-200 mx-6" />}
              {p.zh && (
                <div className="p-6 pt-4 bg-stone-50/50">
                  <RenderChinese text={p.zh} fontSize={zhTextSize} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {paras.length === 0 && (
          <div className="p-8 text-center bg-white/70 rounded-2xl shadow-sm border border-stone-200/50">
            <p className="text-stone-400 mb-2">Generating Content...</p>
            <p className="text-xs text-stone-300">Please wait for N8N to finish story.</p>
          </div>
        )}
      </main>
    </div>
  )
}
