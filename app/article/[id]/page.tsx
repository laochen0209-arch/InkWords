"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2, Type, Volume2 } from "lucide-react"
import { motion } from "framer-motion"
import { InteractiveParagraph } from "@/components/reader/interactive-paragraph"
import { Article } from "@/lib/types/article"

function LoadingScreen({ text }: { text: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#C23E32] mx-auto mb-4" />
        <p className="text-stone-600 font-serif">{text}</p>
      </div>
    </div>
  )
}

export default function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [fontSize, setFontSize] = useState<"base" | "lg" | "xl">("lg")
  const [viewMode, setViewMode] = useState<"EN" | "CN" | "BOTH">("EN")

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/articles/${resolvedParams.id}`)
        if (!response.ok) throw new Error("Failed")
        const data = await response.json()
        console.log("Fetched Article Data:", data)
        setArticle(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [resolvedParams.id])

  if (loading) return <LoadingScreen text="Loading..." />
  if (!article) return <div className="p-8 text-center text-stone-600">Article not found</div>

  const getTextSize = () => fontSize === 'xl' ? 'text-2xl' : fontSize === 'lg' ? 'text-xl' : 'text-lg'

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#FDFBF7]/95 backdrop-blur border-b border-stone-200/50 flex items-center justify-between px-4">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 active:scale-95" 
        >
          <ChevronLeft className="w-6 h-6 text-stone-600" /> 
        </button>
        <div className="flex flex-col items-center">
          <span className="font-serif font-bold text-stone-800 max-w-[200px] truncate">
            {viewMode === 'CN' ? article.title_zh : article.title_en}
          </span>
          <span className="text-[10px] text-stone-400 uppercase tracking-widest">Reader View</span>
        </div>
        <button 
          onClick={() => setFontSize(prev => prev === 'lg' ? 'xl' : 'lg')} 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100" 
        >
          <Type className="w-5 h-5 text-stone-600" /> 
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-24">
        <div className="text-center mb-10">
          <h1 className={`font-serif font-bold text-stone-900 leading-tight mb-4 ${fontSize === 'xl' ? 'text-4xl' : 'text-3xl'}`}>
            {viewMode === 'CN' ? article.title_zh : article.title_en}
          </h1>
          
          <div className="inline-flex bg-stone-100 p-1 rounded-full border border-stone-200">
            {['EN', 'BOTH', 'CN'].map((m) => (
              <button 
                key={m} 
                onClick={() => setViewMode(m as any)} 
                className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
                  viewMode === m ? 'bg-white text-[#C23E32] shadow-sm' : 'text-stone-400'
                }`}
              >
                {m === 'EN' ? 'English' : m === 'CN' ? '中文' : '双语'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {(viewMode === 'EN' || viewMode === 'BOTH') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
              <InteractiveParagraph 
                text={article.content_en} 
                lang="en-US" 
                fontSize={fontSize} 
              />
            </motion.div>
          )}

          {(viewMode === 'CN' || viewMode === 'BOTH') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-2">
              <div className={`text-stone-600 leading-loose font-serif ${getTextSize()}`}>
                {article.content_zh.split('\n').map((p, i) => (
                  <p key={i} className="mb-4">{p}</p>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
