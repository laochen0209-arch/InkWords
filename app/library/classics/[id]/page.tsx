"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, Heart, Share2, Volume2 } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/contexts/language-context"
import { TRANSLATIONS } from "@/lib/i18n"
import { useTTS } from "@/lib/hooks/use-tts"

const CLASSICS_DATA = [
  { 
    id: 1, 
    title_zh: "静夜思", 
    title_en: "Quiet Night Thought", 
    author: "李白", 
    author_zh: "李白",
    author_en: "Li Bai",
    dynasty_zh: "唐代",
    dynasty_en: "Tang Dynasty",
    content_zh: "床前明月光，\n疑是地上霜。\n举头望明月，\n低头思故乡。",
    content_en: "Before my bed a pool of light,\nIs it hoarfrost on the ground?\nI lift my head and look at the bright moon,\nI lower my head and think of my hometown.",
    translation_zh: "明亮的月光洒在床前的窗户纸上，好像地上泛起了一层霜。我禁不住抬起头，看那天窗外空中的明月，不由得低头沉思，想起远方的家乡。",
    translation_en: "The bright moonlight shines on the window paper before the bed, as if a layer of frost has risen on the ground. I can't help but lift my head to look at the bright moon in the sky outside the window, and involuntarily lower my head in deep thought, thinking of my hometown far away.",
    type: "五言绝句",
    tags_zh: ["思乡", "月亮", "经典"],
    tags_en: ["Homesickness", "Moon", "Classic"]
  },
  { 
    id: 2, 
    title_zh: "春晓", 
    title_en: "Spring Dawn", 
    author: "孟浩然", 
    author_zh: "孟浩然",
    author_en: "Meng Haoran",
    dynasty_zh: "唐代",
    dynasty_en: "Tang Dynasty",
    content_zh: "春眠不觉晓，\n处处闻啼鸟。\n夜来风雨声，\n花落知多少。",
    content_en: "I slumbered this spring morning,\nAnd missed the dawn.\nFrom everywhere I heard the cry of birds,\nThe sound of wind and rain came in the night,\nHow many flowers fell?",
    translation_zh: "春夜酣睡，不知不觉已经到了早晨。到处都能听到鸟儿的啼鸣。回想昨夜的阵阵风雨声，不知道吹落了多少花儿。",
    translation_en: "I slept soundly this spring night, unaware that morning had arrived. Everywhere I could hear the crying of birds. Recalling the sound of wind and rain from last night, I wonder how many flowers fell.",
    type: "五言绝句",
    tags_zh: ["春天", "自然", "写景"],
    tags_en: ["Spring", "Nature", "Scenery"]
  },
  { 
    id: 3, 
    title_zh: "登鹳雀楼", 
    title_en: "Climbing Stork Tower", 
    author: "王之涣", 
    author_zh: "王之涣",
    author_en: "Wang Zhihuan",
    dynasty_zh: "唐代",
    dynasty_en: "Tang Dynasty",
    content_zh: "白日依山尽，\n黄河入海流。\n欲穷千里目，\n更上一层楼。",
    content_en: "The white sun sets behind the mountains,\nThe Yellow River flows into the sea.\nTo see a thousand miles further,\nGo up one more story.",
    translation_zh: "太阳依傍着西边的山峦渐渐落下，滚滚的黄河向着东海奔流而去。如果要想把千里的风光景物看够，那就要登上更高的一层城楼。",
    translation_en: "The sun sets behind the western mountains, and the rolling Yellow River flows toward the East Sea. If you want to see enough of the thousand-mile scenery, you must climb one more story of the tower.",
    type: "五言绝句",
    tags_zh: ["登高", "黄河", "壮志"],
    tags_en: ["Climbing", "Yellow River", "Ambition"]
  },
  { 
    id: 4, 
    title_zh: "江雪", 
    title_en: "River Snow", 
    author: "柳宗元", 
    author_zh: "柳宗元",
    author_en: "Liu Zongyuan",
    dynasty_zh: "唐代",
    dynasty_en: "Tang Dynasty",
    content_zh: "千山鸟飞绝，\n万径人踪灭。\n孤舟蓑笠翁，\n独钓寒江雪。",
    content_en: "A thousand mountains, birds fly no more.\nTen thousand paths, human traces are gone.\nA lone boat, straw cloak and hat,\nAn old man fishes alone in the cold river snow.",
    translation_zh: "所有的山上，都看不到飞鸟的影子，所有的小路，都没有人的足迹。江面上孤舟上有一个披着蓑衣、戴着斗笠的老翁，独自在寒冷的江雪中垂钓。",
    translation_en: "On all the mountains, no shadows of flying birds can be seen. On all the small paths, no human footprints remain. On the lone boat on the river, an old man in a straw cloak and hat fishes alone in the cold river snow.",
    type: "五言绝句",
    tags_zh: ["冬天", "孤独", "江雪"],
    tags_en: ["Winter", "Solitude", "River Snow"]
  }
]

export default function ClassicsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { learningMode } = useLanguage()
  const t = TRANSLATIONS[learningMode === "LEARN_CHINESE" ? "LEARN_CHINESE" : "LEARN_ENGLISH"]
  const [isLiked, setIsLiked] = useState(false)
  const poemId = params.id as string
  const poem = CLASSICS_DATA.find(p => p.id === parseInt(poemId))
  const { isPlaying, speak } = useTTS({ learningMode })

  useEffect(() => {
    if (!poem) {
      router.push("/library")
    }
  }, [poem, router])

  if (!poem) {
    return null
  }

  const getDisplayTitle = () => {
    return learningMode === "LEARN_CHINESE" ? poem.title_zh : poem.title_en
  }

  const getDisplayAuthor = () => {
    return learningMode === "LEARN_CHINESE" ? poem.author_zh : poem.author_en
  }

  const getDisplayDynasty = () => {
    return learningMode === "LEARN_CHINESE" ? poem.dynasty_zh : poem.dynasty_en
  }

  const getDisplayContent = () => {
    return learningMode === "LEARN_CHINESE" ? poem.content_zh : poem.content_en
  }

  const getDisplayTranslation = () => {
    return learningMode === "LEARN_CHINESE" ? poem.translation_en : poem.translation_zh
  }

  const getDisplayTags = () => {
    return learningMode === "LEARN_CHINESE" ? poem.tags_en : poem.tags_zh
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: getDisplayTitle(),
        text: `${getDisplayAuthor()} - ${getDisplayTitle()}`,
        url: window.location.href
      })
    }
  }

  return (
    <main className="min-h-screen bg-ink-paper">
      <div 
        className="fixed inset-0 z-0 pointer-events-none ink-landscape-bg"
        aria-hidden="true"
      />

      <div className="relative z-10 min-h-screen px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/library"
              className="inline-flex items-center gap-2 text-ink-gray hover:text-ink-black transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-serif text-sm">
                {learningMode === "LEARN_CHINESE" ? "返回文库" : "Back to Library"}
              </span>
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl p-8 shadow-lg"
              >
              <div className="text-center mb-8">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="font-serif text-3xl md:text-4xl text-ink-black font-bold mb-3"
                >
                  {getDisplayTitle()}
                </motion.h1>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="flex items-center justify-center gap-3 mb-6"
                >
                  <button
                    type="button"
                    onClick={() => speak(getDisplayContent())}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#C23E32] text-white hover:bg-[#A8352B] transition-all duration-300 shadow-md"
                  >
                    <Volume2 
                      className={`w-5 h-5 transition-all duration-300 ${
                        isPlaying ? "animate-pulse" : ""
                      }`}
                    />
                    <span className="font-serif text-sm font-medium">
                      {learningMode === "LEARN_CHINESE" ? "朗读" : "Read"}
                    </span>
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex items-center justify-center gap-3 mb-6"
                >
                  <span className="font-serif text-sm text-ink-gray/60">
                    {learningMode === "LEARN_CHINESE" ? "朝代" : "Dynasty"}
                  </span>
                  <span className="font-serif text-base text-ink-black font-medium">
                    {getDisplayDynasty()}
                  </span>
                  <span className="w-1 h-1 bg-ink-gray/30 rounded-full" />
                  <span className="font-serif text-sm text-ink-gray/60">
                    {learningMode === "LEARN_CHINESE" ? "作者" : "Author"}
                  </span>
                  <span className="font-serif text-base text-ink-black font-medium">
                    {getDisplayAuthor()}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-center justify-center gap-2 mb-8"
                >
                  <div className="flex items-center gap-2">
                    {getDisplayTags().map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#C23E32]/10 text-[#C23E32] rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="border-t border-ink-gray/20 pt-8 mb-8"
              >
                <h2 className="font-serif text-lg text-ink-black font-semibold mb-6 text-center">
                  {learningMode === "LEARN_CHINESE" ? "原文" : "Original Text"}
                </h2>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-[#FDFBF7]/50 rounded-xl p-6 mb-6"
                >
                  <p className="font-serif text-xl md:text-2xl text-ink-black leading-loose text-center whitespace-pre-line">
                    {getDisplayContent()}
                  </p>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="border-t border-ink-gray/20 pt-8"
              >
                <h2 className="font-serif text-lg text-ink-black font-semibold mb-6 text-center">
                  {learningMode === "LEARN_CHINESE" ? "译文" : "Translation"}
                </h2>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="bg-gradient-to-br from-[#C23E32]/5 to-[#A8352B]/5 rounded-xl p-6"
                >
                  <p className="font-serif text-base text-ink-gray/80 leading-relaxed">
                    {getDisplayTranslation()}
                  </p>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="flex items-center justify-center gap-4 pt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl font-serif text-base transition-all duration-300
                    ${isLiked
                      ? "bg-[#C23E32] text-white"
                      : "bg-stone-100 text-ink-gray hover:bg-stone-200"
                    }
                  `}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} strokeWidth={1.5} />
                  {isLiked
                    ? (learningMode === "LEARN_CHINESE" ? "已收藏" : "Liked")
                    : (learningMode === "LEARN_CHINESE" ? "收藏" : "Like")
                  }
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-serif text-base bg-stone-100 text-ink-gray hover:bg-stone-200 transition-all duration-300"
                >
                  <Share2 className="w-5 h-5" strokeWidth={1.5} />
                  {learningMode === "LEARN_CHINESE" ? "分享" : "Share"}
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-8"
            >
              <h3 className="font-serif text-lg text-ink-black font-semibold mb-4">
                {learningMode === "LEARN_CHINESE" ? "相关诗词" : "Related Poems"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CLASSICS_DATA.filter(p => p.id !== poem.id).slice(0, 2).map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/library/classics/${item.id}`}
                    className="block"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/60 backdrop-blur-md border border-white/40 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-[#C23E32] pl-4"
                    >
                      <h4 className="font-serif text-base font-bold text-gray-900 mb-2">
                        {learningMode === "LEARN_CHINESE" ? item.title_zh : item.title_en}
                      </h4>
                      <div className="text-sm text-gray-600 mb-2">
                        {learningMode === "LEARN_CHINESE" ? item.author_zh : item.author_en}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                        {learningMode === "LEARN_CHINESE" ? item.content_zh.replace(/\n/g, '') : item.content_en.replace(/\n/g, '')}
                      </p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
