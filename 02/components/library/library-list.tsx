"use client"

import { ArticleCard } from "./article-card"

// 模拟数据
const libraryData = [
  {
    date: "二月 · 廿四",
    articles: [
      {
        id: "1",
        title: "静夜思",
        author: "李白",
        excerpt: "床前明月光，疑是地上霜。举头望明月，低头思故乡。",
        isRead: false,
        watermark: "bamboo" as const,
      },
      {
        id: "2",
        title: "春晓",
        author: "孟浩然",
        excerpt: "春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。",
        isRead: true,
        watermark: "plum" as const,
      },
    ],
  },
  {
    date: "二月 · 廿三",
    articles: [
      {
        id: "3",
        title: "登鹳雀楼",
        author: "王之涣",
        excerpt: "白日依山尽，黄河入海流。欲穷千里目，更上一层楼。",
        isRead: false,
        watermark: "orchid" as const,
      },
      {
        id: "4",
        title: "相思",
        author: "王维",
        excerpt: "红豆生南国，春来发几枝。愿君多采撷，此物最相思。",
        isRead: true,
        watermark: "chrysanthemum" as const,
      },
      {
        id: "5",
        title: "望庐山瀑布",
        author: "李白",
        excerpt: "日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。",
        isRead: false,
        watermark: "bamboo" as const,
      },
    ],
  },
  {
    date: "二月 · 廿二",
    articles: [
      {
        id: "6",
        title: "江雪",
        author: "柳宗元",
        excerpt: "千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。",
        isRead: true,
        watermark: "plum" as const,
      },
      {
        id: "7",
        title: "早发白帝城",
        author: "李白",
        excerpt: "朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。",
        isRead: false,
        watermark: "orchid" as const,
      },
    ],
  },
]

export function LibraryList() {
  return (
    <div className="px-4 py-6 space-y-8 max-w-2xl mx-auto">
      {libraryData.map((group) => (
        <section key={group.date} className="space-y-4">
          {/* 日期标题 */}
          <div className="flex items-center justify-center gap-4 py-2">
            <span 
              className="h-px flex-1 bg-gradient-to-r from-transparent via-ink-gray/30 to-transparent"
              aria-hidden="true"
            />
            <h2 className="font-serif text-sm text-ink-gray tracking-widest">
              {group.date}
            </h2>
            <span 
              className="h-px flex-1 bg-gradient-to-l from-transparent via-ink-gray/30 to-transparent"
              aria-hidden="true"
            />
          </div>
          
          {/* 文章卡片列表 */}
          <div className="space-y-3">
            {group.articles.map((article) => (
              <ArticleCard key={article.id} {...article} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
