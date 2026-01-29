/**
 * @fileoverview 修习数据API
 * @description 通用分类数据查询
 * @author InkWords Team
 * @version 5.1.0
 */

import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  console.log("📥 API收到请求，分类:", category)

  if (!category) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 })
  }

  try {
    // 1. 并行查询单词和句子 (使用 exact match 精确匹配，因为数据库已清洗)
    const [wordsResult, sentencesResult] = await Promise.all([
      supabase
        .from('StudyWord')
        .select('*')
        .eq('category', category)
        .limit(200), // ✅ 修改：从 50 提升到 200

      supabase
        .from('StudySentence')
        .select('*')
        .eq('category', category)
        .limit(100) // ✅ 修改：从 20 提升到 100
    ])

    // 2. 检查数据库错误
    if (wordsResult.error) {
      console.error("❌ Words Query Error:", wordsResult.error)
      throw new Error(`Words query failed: ${wordsResult.error.message}`)
    }

    if (sentencesResult.error) {
      console.error("❌ Sentences Query Error:", sentencesResult.error)
      throw new Error(`Sentences query failed: ${sentencesResult.error.message}`)
    }

    console.log(`✅ 查询成功: ${wordsResult.data?.length || 0} Words, ${sentencesResult.data?.length || 0} Sentences`)

    // 3. 映射句子数据字段 - 将数据库字段映射为前端期望的格式
    const mappedSentences = (sentencesResult.data || []).map((sentence: any) => ({
      id: sentence.id,
      zh: sentence.contentZh || sentence.content_zh || '',
      en: sentence.contentEn || sentence.content_en || '',
      pinyin: sentence.pinyin || '',
      category: sentence.category,
      createdAt: sentence.createdAt,
      updatedAt: sentence.updatedAt
    }))

    // 4. 返回数据
    return NextResponse.json({
      words: wordsResult.data || [],
      sentences: mappedSentences,
      wordsCount: wordsResult.data?.length || 0,
      sentencesCount: mappedSentences.length,
      success: true
    })

  } catch (error: any) {
    console.error("❌ API Critical Error:", error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
