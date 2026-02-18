-- 创建所有缺失的数据库表

-- 1. 创建 CheckIn 表（签到记录）
CREATE TABLE IF NOT EXISTS "CheckIn" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    points INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_checkin_userid_date" ON "CheckIn"("userId", date);
CREATE INDEX IF NOT EXISTS "idx_checkin_userid" ON "CheckIn"("userId");

-- 2. 创建 UserStudyStats 表（用户学习统计）
CREATE TABLE IF NOT EXISTS "UserStudyStats" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wordsLearned" INTEGER NOT NULL DEFAULT 0,
    "sentencesLearned" INTEGER NOT NULL DEFAULT 0,
    "totalLearned" INTEGER NOT NULL DEFAULT 0,
    "studyTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_userstats_userid_date" ON "UserStudyStats"("userId", date);
CREATE INDEX IF NOT EXISTS "idx_userstats_userid" ON "UserStudyStats"("userId");

-- 3. 创建 UserProgress 表（用户学习进度）
CREATE TABLE IF NOT EXISTS "UserProgress" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL,
    category TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "isLearned" BOOLEAN NOT NULL DEFAULT false,
    "learnedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_userprogress_unique" ON "UserProgress"("userId", category, "contentType", "contentId");
CREATE INDEX IF NOT EXISTS "idx_userprogress_userid" ON "UserProgress"("userId");
CREATE INDEX IF NOT EXISTS "idx_userprogress_learned" ON "UserProgress"("userId", "isLearned");

-- 4. 查看已创建的表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('CheckIn', 'UserStudyStats', 'UserProgress', 'VerificationCode')
ORDER BY table_name;
