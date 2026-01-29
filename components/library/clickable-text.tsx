"use client"

import { VocabularyWord } from "@/lib/types/article"

/**
 * 可点击文本组件属性
 */
interface ClickableTextProps {
  text: string
  vocabData: VocabularyWord[]
  onWordClick: (word: VocabularyWord) => void
  className?: string
}

/**
 * 单词标记接口
 */
interface WordToken {
  text: string
  isWord: boolean
  isClickable: boolean
}

/**
 * 可点击文本组件
 * 将英文文本分割为单词，并为每个单词添加点击事件
 * 点击时从 vocab_data 中查找对应的单词解释
 */
export function ClickableText({ text, vocabData, onWordClick, className = "" }: ClickableTextProps) {
  const parseTextToTokens = (content: string): WordToken[] => {
    const tokens: WordToken[] = []

    const wordRegex = /([a-zA-Z]+(?:'[a-zA-Z]+)?)|([^a-zA-Z]+)/g
    let match

    while ((match = wordRegex.exec(content)) !== null) {
      const word = match[1]
      const nonWord = match[2]

      if (word) {
        const cleanWord = word.toLowerCase()
        const hasDefinition = vocabData.some(
          (v) => v.word.toLowerCase() === cleanWord
        )

        tokens.push({
          text: word,
          isWord: true,
          isClickable: hasDefinition
        })
      } else if (nonWord) {
        tokens.push({
          text: nonWord,
          isWord: false,
          isClickable: false
        })
      }
    }

    return tokens
  }

  const handleWordClick = (wordText: string) => {
    const cleanWord = wordText.toLowerCase()
    const wordData = vocabData.find(
      (v) => v.word.toLowerCase() === cleanWord
    )

    if (wordData) {
      onWordClick(wordData)
    }
  }

  const tokens = parseTextToTokens(text)

  return (
    <span className={className}>
      {tokens.map((token, index) => {
        if (token.isWord && token.isClickable) {
          return (
            <span
              key={index}
              onClick={() => handleWordClick(token.text)}
              className="cursor-pointer hover:text-ink-vermilion hover:underline decoration-ink-vermilion/30 underline-offset-2 transition-all duration-150"
            >
              {token.text}
            </span>
          )
        }

        return <span key={index}>{token.text}</span>
      })}
    </span>
  )
}
