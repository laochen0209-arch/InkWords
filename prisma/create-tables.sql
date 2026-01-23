-- ============================================
-- 建表 SQL (Create Tables)
-- 根据 schema.prisma 生成
-- ============================================

-- User 表
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "avatar" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastLoginDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PracticeLog 表
CREATE TABLE IF NOT EXISTS "PracticeLog" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- MistakeBook 表
CREATE TABLE IF NOT EXISTS "MistakeBook" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Vocabulary 表
CREATE TABLE IF NOT EXISTS "Vocabulary" (
    "id" TEXT PRIMARY KEY,
    "english" TEXT NOT NULL,
    "chinese" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "exampleEn" TEXT NOT NULL,
    "exampleZh" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sentence 表
CREATE TABLE IF NOT EXISTS "Sentence" (
    "id" TEXT PRIMARY KEY,
    "contentEn" TEXT NOT NULL,
    "contentZh" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Article 表
CREATE TABLE IF NOT EXISTS "Article" (
    "id" TEXT PRIMARY KEY,
    "titleEn" TEXT NOT NULL,
    "titleZh" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "contentZh" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "PracticeLog_userId_idx" ON "PracticeLog"("userId");
CREATE INDEX IF NOT EXISTS "MistakeBook_userId_idx" ON "MistakeBook"("userId");
CREATE INDEX IF NOT EXISTS "Vocabulary_english_idx" ON "Vocabulary"("english");
CREATE INDEX IF NOT EXISTS "Sentence_author_idx" ON "Sentence"("author");
CREATE INDEX IF NOT EXISTS "Article_category_idx" ON "Article"("category");
