"use client"

import { useState, useEffect, use, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Type, ArrowLeft, Volume2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { InteractiveParagraph } from "@/components/reader/interactive-paragraph"

interface ArticleData {
  title_en: string
  title_zh: string
  category: string
  content_en: string
  content_zh: string
}

interface Para { en: string; zh: string }
interface Vocab { word: string; mean: string }

const speak = (text: string, lang = 'zh-CN') => {
  if (!text) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  const voices = window.speechSynthesis.getVoices()
  const bestVoice = voices.find(v => v.lang.includes(lang.replace('-', '_')) || v.lang.includes(lang))
  if (bestVoice) u.voice = bestVoice
  u.rate = lang === 'en-US' ? 1.0 : 0.9
  window.speechSynthesis.speak(u)
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

  const [article, setArticle] = useState<ArticleData | null>(null)
  const [paras, setParas] = useState<Para[]>([])
  const [vocabList, setVocabList] = useState<Vocab[]>([])
  const [loading, setLoading] = useState(true)
  const [size, setSize] = useState<"lg" | "xl">("lg")

  useEffect(() => {
    if (typeof window !== 'undefined') window.speechSynthesis.getVoices()
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
        
        console.log('原始数据:', { 
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
          console.error("JSON 解析失败:", e)
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
      } catch (e) {
        console.error(e)
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
    <div className="min-h-screen" style={{ backgroundImage: 'url("/去文字.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-[#FDFBF7]/25 backdrop-blur-md border-b border-stone-200/50 flex items-center justify-between px-4">
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
              className="bg-[#FDFBF7]/60 backdrop-blur-sm rounded-2xl shadow-sm border border-stone-200/50 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6 pb-4">
                <RenderEnglish text={p.en} vocabMap={vocabMap} fontSize={size} />
              </div>
              {p.en && p.zh && <div className="h-px bg-stone-200 mx-6" />}
              {p.zh && (
                <div className="p-6 pt-4 bg-[#FDFBF7]/40">
                  <RenderChinese text={p.zh} fontSize={zhTextSize} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {paras.length === 0 && (
          <div className="p-8 text-center bg-[#FDFBF7]/60 rounded-2xl shadow-sm border border-stone-200/50">
            <p className="text-stone-400 mb-2">Generating Content...</p>
            <p className="text-xs text-stone-300">Please wait for N8N to finish story.</p>
          </div>
        )}
      </main>
    </div>
  )
}
