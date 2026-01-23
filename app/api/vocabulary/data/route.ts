import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  let userStr: string | undefined
  
  try {
    userStr = request.headers.get('x-user-id') as string | undefined
    
    if (!userStr) {
      return NextResponse.json(
        { words: [] },
        { status: 200 }
      )
    }

    const userId = userStr

    const [words, sentences] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId }
      }).then((user: any) => {
        if (!user) return []
        return []
      }),
      prisma.practiceLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }).then((logs: any) => {
        return logs.map((log: any) => ({
          id: log.id,
          zh: log.mode === 'word' ? '示例单词' : '示例句子',
          en: log.mode === 'word' ? 'Sample Word' : 'Sample Sentence',
          pinyin: log.mode === 'word' ? 'shìlì' : 'shìlì',
          meaning: log.mode === 'word' ? '示例含义' : '示例含义',
          en_hint: log.mode === 'word' ? 'S______' : 'S______',
          py_hint: log.mode === 'word' ? 's_ l_' : 's_ l_',
          example: log.mode === 'word' ? '示例例句' : '示例例句',
          examplePinyin: log.mode === 'word' ? 'shìlì jù' : 'shìlì jù',
          exampleMeaning: log.mode === 'word' ? '示例含义' : '示例含义'
        }))
      })
    ])

    return NextResponse.json(
      { 
        words,
        sentences,
        userId
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get vocabulary data error:', error)
    return NextResponse.json(
      { 
        words: [],
        sentences: [],
        userId: userStr || ''
      },
      { status: 200 }
    )
  }
}
