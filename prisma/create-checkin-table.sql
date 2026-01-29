-- 创建 CheckIn 表
CREATE TABLE IF NOT EXISTS "CheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "points" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- 创建唯一索引，确保每天只能签到一次
CREATE UNIQUE INDEX IF NOT EXISTS "CheckIn_userId_date_key" ON "CheckIn"("userId", "date");

-- 创建索引，提高查询性能
CREATE INDEX IF NOT EXISTS "CheckIn_userId_date_idx" ON "CheckIn"("userId", "date");
