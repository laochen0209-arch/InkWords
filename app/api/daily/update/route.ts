import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

interface WordData {
  english: string
  chinese: string
  pinyin: string
  exampleEn: string
  exampleZh: string
  difficulty: number
}

interface SentenceData {
  contentEn: string
  contentZh: string
  pinyin: string
  author: string
}

interface UpdateRequest {
  secret: string
  category: string
  words: WordData[]
  sentences: SentenceData[]
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateRequest = await request.json()
    
    if (body.secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { category, words, sentences } = body

    if (!category || !Array.isArray(words) || !Array.isArray(sentences)) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    const createdWords = await Promise.all(
      words.map((word) =>
        prisma.vocabulary.create({
          data: {
            english: word.english,
            chinese: word.chinese,
            pinyin: word.pinyin,
            exampleEn: word.exampleEn,
            exampleZh: word.exampleZh,
            difficulty: word.difficulty,
          },
        })
      )
    )

    const createdSentences = await Promise.all(
      sentences.map((sentence) =>
        prisma.sentence.create({
          data: {
            contentEn: sentence.contentEn,
            contentZh: sentence.contentZh,
            pinyin: sentence.pinyin,
            author: sentence.author,
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      wordsCreated: createdWords.length,
      sentencesCreated: createdSentences.length,
      category,
    })
  } catch (error: any) {
    console.error('[DAILY UPDATE] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
