"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ReaderHeader } from "@/components/reader/reader-header"
import { ReaderContent } from "@/components/reader/reader-content"
import { ReaderToolbar } from "@/components/reader/reader-toolbar"
import { useParams } from "next/navigation"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"

const classicsContent: Record<string, {
  title: string
  titleEn: string
  author: string
  authorEn: string
  content: Array<{ id: number; zh: string; en: string }>
}> = {
  "1": {
    title: "静夜思",
    titleEn: "Quiet Night Thought",
    author: "李白",
    authorEn: "Li Bai",
    content: [
      {
        id: 1,
        zh: "床前明月光，",
        en: "Before my bed a pool of light,",
      },
      {
        id: 2,
        zh: "疑是地上霜。",
        en: "Can it be hoarfrost on ground?",
      },
      {
        id: 3,
        zh: "举头望明月，",
        en: "Looking up, I find's moon bright,",
      },
      {
        id: 4,
        zh: "低头思故乡。",
        en: "Bowing my head, my homesickness drowns.",
      },
    ],
  },
  "2": {
    title: "春晓",
    titleEn: "Spring Dawn",
    author: "孟浩然",
    authorEn: "Meng Haoran",
    content: [
      {
        id: 1,
        zh: "春眠不觉晓，",
        en: "This spring morning in bed I'm lying,",
      },
      {
        id: 2,
        zh: "处处闻啼鸟。",
        en: "Not to awake till birds are crying.",
      },
      {
        id: 3,
        zh: "夜来风雨声，",
        en: "After one night of wind and showers,",
      },
      {
        id: 4,
        zh: "花落知多少。",
        en: "How many are the fallen flowers!",
      },
    ],
  },
  "3": {
    title: "登鹳雀楼",
    titleEn: "Climbing Stork Tower",
    author: "王之涣",
    authorEn: "Wang Zhihuan",
    content: [
      {
        id: 1,
        zh: "白日依山尽，",
        en: "The sun beyond the mountain glows;",
      },
      {
        id: 2,
        zh: "黄河入海流。",
        en: "The Yellow River seaward flows.",
      },
      {
        id: 3,
        zh: "欲穷千里目，",
        en: "You can enjoy a grander sight,",
      },
      {
        id: 4,
        zh: "更上一层楼。",
        en: "By climbing to a greater height.",
      },
    ],
  },
  "4": {
    title: "相思",
    titleEn: "Love Seeds",
    author: "王维",
    authorEn: "Wang Wei",
    content: [
      {
        id: 1,
        zh: "红豆生南国，",
        en: "Red berries grow in southern land.",
      },
      {
        id: 2,
        zh: "春来发几枝。",
        en: "In spring how many load in trees?",
      },
      {
        id: 3,
        zh: "愿君多采撷，",
        en: "Gather them till full is your hand,",
      },
      {
        id: 4,
        zh: "此物最相思。",
        en: "They would revive fond memories.",
      },
    ],
  },
  "5": {
    title: "望庐山瀑布",
    titleEn: "Waterfall at Mount Lu",
    author: "李白",
    authorEn: "Li Bai",
    content: [
      {
        id: 1,
        zh: "日照香炉生紫烟，",
        en: "Sunlight lights up incense burner, creating purple smoke.",
      },
      {
        id: 2,
        zh: "遥看瀑布挂前川。",
        en: "From a distance, the waterfall hangs like a river.",
      },
      {
        id: 3,
        zh: "飞流直下三千尺，",
        en: "Flying down three thousand feet,",
      },
      {
        id: 4,
        zh: "疑是银河落九天。",
        en: "I wonder if it's the Milky Way falling from nine heavens.",
      },
    ],
  },
  "6": {
    title: "江雪",
    titleEn: "River Snow",
    author: "柳宗元",
    authorEn: "Liu Zongyuan",
    content: [
      {
        id: 1,
        zh: "千山鸟飞绝，",
        en: "From hill to hill no bird in flight;",
      },
      {
        id: 2,
        zh: "万径人踪灭。",
        en: "From path to path no man in sight.",
      },
      {
        id: 3,
        zh: "孤舟蓑笠翁，",
        en: "A straw-cloaked old man in a boat,",
      },
      {
        id: 4,
        zh: "独钓寒江雪。",
        en: "Alone fishing snow on a cold river.",
      },
    ],
  },
  "7": {
    title: "早发白帝城",
    titleEn: "Leaving White Emperor City at Dawn",
    author: "李白",
    authorEn: "Li Bai",
    content: [
      {
        id: 1,
        zh: "朝辞白帝彩云间，",
        en: "Leaving at dawn's White Emperor crowned with cloud,",
      },
      {
        id: 2,
        zh: "千里江陵一日还。",
        en: "I've journeyed a thousand li to Jiangling in a day.",
      },
      {
        id: 3,
        zh: "两岸猿声啼不住，",
        en: "The monkeys on the river banks keep crying,",
      },
      {
        id: 4,
        zh: "轻舟已过万重山。",
        en: "My light boat has passed ten thousand mountains.",
      },
    ],
  },
}

export default function ReaderPage() {
  const params = useParams()
  const articleId = params.id as string
  const [fontSize, setFontSize] = useState<"base" | "lg" | "xl">("base")
  const [fontFamily, setFontFamily] = useState<"serif" | "kaiti">("serif")
  const [displayMode, setDisplayMode] = useState<"cn" | "en" | "both">("both")
  const [isPlaying, setIsPlaying] = useState<number | null>(null)
  const [currentContent, setCurrentContent] = useState<{
    title: string
    titleEn: string
    author: string
    authorEn: string
    content: Array<{ id: number; zh: string; en: string }>
  } | null>(null)

  const { learningMode, nativeLang, targetLang } = useLanguage()

  const t = TRANSLATIONS[learningMode]

  useEffect(() => {
    if (classicsContent[articleId]) {
      setCurrentContent(classicsContent[articleId])
    }
  }, [articleId])

  const handlePlay = (id: number) => {
    setIsPlaying(id)
    if (currentContent) {
      const text = targetLang === "zh" ? currentContent.content[id - 1].zh : currentContent.content[id - 1].en
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = targetLang === "zh" ? 'zh-CN' : 'en-US'
        speechSynthesis.speak(utterance)
      }
    }
  }

  if (!currentContent) {
    return null
  }

  return (
    <>
      {/* Layer 1: 固定背景层 - 水墨山水 */}
      <div 
        className="fixed inset-0 z-0 bg-ink-paper ink-landscape-bg"
        aria-hidden="true"
      />
      
      {/* Layer 2: 可滚动内容区 - 平滑入场动画 */}
      <motion.main 
        className="relative z-10 min-h-screen overflow-y-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.4, 
          ease: [0.4, 0, 0.2, 1] 
        }}
      >
        {/* 顶部导航栏 */}
        <ReaderHeader 
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
        />
        
        {/* 阅读内容区 - pt-20 避开顶部栏，pb-32 避开底部工具栏 */}
        <motion.div 
          className="pt-20 pb-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.1,
            ease: [0.4, 0, 0.2, 1] 
          }}
        >
          <ReaderContent 
            fontSize={fontSize}
            fontFamily={fontFamily}
            displayMode={displayMode}
            english={currentContent.content.map(p => p.en).join('\n')}
            chinese={currentContent.content.map(p => p.zh).join('\n')}
            isPlaying={isPlaying}
          />
        </motion.div>
      </motion.main>
      
      {/* Layer 3: 固定底部工具栏 */}
      <ReaderToolbar 
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        fontFamily={fontFamily}
        onFontFamilyChange={setFontFamily}
      />
    </>
  )
}
