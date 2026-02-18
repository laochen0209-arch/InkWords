/**
 * @fileoverview 修习数据API
 * @description 通用分类数据查询，包含配额检查，支持随机排序
 * @author InkWords Team
 * @version 5.3.0
 * 
 * 修改说明：
 * - 添加随机排序，确保每次获取不同题目
 * - 禁用缓存，避免重复内容
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { checkStudyQuota } from '@/lib/quotas/check-quotas'

// 禁用缓存，确保每次请求都获取新数据
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  // 创建 Supabase 客户端
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const userId = request.headers.get('x-user-id')

  console.log("📥 API收到请求，分类:", category, "用户:", userId)

  if (!category) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 })
  }

  // 检查配额（如果提供了用户ID）
  if (userId) {
    const quotaCheck = await checkStudyQuota(userId)
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: quotaCheck.error,
          code: quotaCheck.code,
          remaining: quotaCheck.remaining
        },
        { status: 403 }
      )
    }
  }

  try {
    // 1. 并行查询单词和句子，使用随机排序
    // 使用 ilike 进行不区分大小写的匹配
    const [wordsResult, sentencesResult] = await Promise.all([
      supabase
        .from('study_words')
        .select('*')
        .ilike('category', category)
        .order('id', { ascending: false }) // 按ID倒序，配合随机偏移实现随机效果
        .limit(200),

      supabase
        .from('study_sentences')
        .select('*')
        .ilike('category', category)
        .order('id', { ascending: false })
        .limit(100)
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

    // 3. 随机打乱数据，确保每次获取不同内容
    const shuffleArray = <T,>(array: T[]): T[] => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }

    const shuffledWords = shuffleArray(wordsResult.data || [])
    const shuffledSentences = shuffleArray(sentencesResult.data || [])

    console.log(`✅ 查询成功: ${shuffledWords.length} Words, ${shuffledSentences.length} Sentences`)

    // 调试：打印第一条数据
    if (shuffledWords.length > 0) {
      console.log('📋 第一条单词数据:', shuffledWords[0])
    }
    if (shuffledSentences.length > 0) {
      console.log('📋 第一条句子数据:', shuffledSentences[0])
    }

    // 4. 映射单词数据字段
    const mappedWords = shuffledWords.map((word: any) => ({
      id: word.id,
      word: word.word,
      meaning: word.meaning,
      pronunciation: word.pronunciation,
      example: word.example,
      example_sentence: word.example,
      exampleZh: word.example_zh,
      category: word.category
    }))

    // 5. 映射句子数据字段
    const mappedSentences = shuffledSentences.map((sentence: any) => ({
      id: sentence.id,
      zh: sentence.zh,
      en: sentence.en,
      pinyin: sentence.pinyin,
      category: sentence.category
    }))

    // 6. 返回数据（禁用缓存）
    return NextResponse.json({
      words: mappedWords,
      sentences: mappedSentences,
      wordsCount: mappedWords.length,
      sentencesCount: mappedSentences.length,
      success: true
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })

  } catch (error: any) {
    console.error("❌ API Critical Error:", error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
