"use client"

import { useState, useEffect, use } from "react"
import { Loader2 } from "lucide-react"
import { ArticleReader } from "@/components/reader/article-reader"
import { Article } from "@/lib/types/article"

export default function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const resolvedParams = use(params)

  const mode = "LEARN_ENGLISH"

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/articles/${resolvedParams.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch article")
        }

        const data: Article = await response.json()
        setArticle(data)
      } catch (err) {
        console.error("获取文章失败:", err)
        setError(err instanceof Error ? err.message : "未知错误")
      } finally {
        setLoading(false)
      }
    }

    if (resolvedParams.id) {
      fetchArticle()
    }
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg" aria-hidden="true">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-ink-vermilion mx-auto mb-4" />
            <p className="text-ink-gray">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg" aria-hidden="true">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-ink-vermilion mb-4">加载失败</p>
            <p className="text-ink-gray">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return <ArticleReader article={article} mode={mode} />
}
