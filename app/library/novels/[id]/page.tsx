"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Type, ArrowLeft, Volume2 } from "lucide-react"
import { motion } from "framer-motion"
import { InteractiveParagraph } from "@/components/reader/interactive-paragraph"

interface ArticleData {
  title_en: string
  title_zh: string
  content_en: string
  content_zh: string
  category: string
}

interface Para { en: string; zh: string }

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
  const [loading, setLoading] = useState(true)
  const [size, setSize] = useState<"lg" | "xl">("lg")
  const [mode, setMode] = useState<"EN" | "CN" | "BOTH">("EN")

  const playZh = (text: string) => {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-CN'
    u.rate = 0.9
    window.speechSynthesis.speak(u)
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/articles/${resolvedParams.id}`)
        if (!res.ok) throw new Error("Fetch failed")
        const raw: any = await res.json()
        
        if (!raw) {
          setLoading(false)
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
        
        try {
          if (cEn.trim().startsWith('{')) {
            const json = JSON.parse(cEn)
            console.log('解析 JSON 成功:', { hasParagraphs: !!json.paragraphs, paragraphsCount: json.paragraphs?.length, firstPara: json.paragraphs?.[0] })
            if (json.paragraphs?.length) {
              pList = json.paragraphs
              console.log('使用 JSON 段落:', pList.length)
            }
          }
        } catch (e) {
          console.error('JSON 解析失败:', e)
        }
        
        if (pList.length === 0) {
          const split = (t: any) => t?.split(/\r?\n/).filter((x: string) => x.trim()) || []
          let enTxt = cEn.trim().startsWith('{') ? "" : cEn
          let en = split(enTxt)
          let zh = split(cZh.replace(/【.*?】/g, '').trim())
          
          console.log('novels 解析前数据:', { enTxt: enTxt.substring(0, 100), cZh: cZh.substring(0, 100) })
          console.log('novels 初始分割:', { en: en.length, zh: zh.length })
          
          if (en.length <= 1 && enTxt.length > 100) {
            en = enTxt.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g)?.map((s: string) => s.trim()) || []
            console.log('novels 英文分段后:', en.length, en)
          }
          if (zh.length <= 1 && cZh.length > 100) {
            zh = cZh.match(/[^。！？]+[。！？]+["']?|[^。！？]+$/g)?.map((s: string) => s.trim()) || []
            console.log('novels 中文分段后:', zh.length, zh)
          }
          
          for (let i = 0; i < Math.min(en.length, zh.length); i++) {
            pList.push({ en: en[i] || "", zh: zh[i] || "" })
          }
          
          console.log('novels 最终段落列表:', pList.map((p, i) => ({ i, en: p.en?.substring(0, 50), zh: p.zh?.substring(0, 50) })))
        }
        
        setParas(pList)
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
    <div className="min-h-screen bg-[#FDFBF7]">
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-[#FDFBF7]/90 backdrop-blur border-b border-stone-200/50 flex items-center justify-between px-4">
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
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-stone-100/50 overflow-hidden hover:shadow-md transition-shadow"
            >
              {p.en && <div className="p-6 pb-4"><InteractiveParagraph text={p.en} lang="en-US" fontSize={size} /></div>}
              {p.en && p.zh && <div className="h-px bg-stone-100 mx-6" />}
              {p.zh && (
                <div className="p-6 pt-4 bg-stone-50/50 flex gap-4 items-start">
                  <p className={`flex-1 text-stone-600 font-serif leading-loose ${zhTextSize}`}>{p.zh}</p>
                  <button onClick={() => playZh(p.zh)} className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white border border-stone-200 text-stone-400 hover:text-[#C23E32] active:scale-95 transition-all"><Volume2 className="w-5 h-5" /></button>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {paras.length === 0 && (
          <div className="p-8 text-center text-stone-400 border border-dashed rounded-xl">Generating...</div>
        )}
      </main>
    </div>
  )
}
