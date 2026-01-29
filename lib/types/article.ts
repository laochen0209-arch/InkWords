/**
 * 文章类型定义
 * 基于 Supabase Article 表结构
 */

/**
 * 生词数据接口
 * 对应 Article 表的 vocab_data 字段
 */
export interface VocabularyWord {
  word: string
  meaning: string
  pronunciation: string
  context_sentence: string
}

/**
 * 段落接口
 * 用于双语对照展示
 */
export interface Paragraph {
  id: number
  zh: string
  en: string
}

/**
 * 文章数据接口
 * 对应 Supabase Article 表
 */
export interface Article {
  id: string
  title_en: string
  title_zh: string
  content_en: string
  content_zh: string
  category: string
  summary: string
  vocab_data: VocabularyWord[]
  created_at: string
}
