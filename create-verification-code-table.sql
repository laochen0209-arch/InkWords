-- 创建 VerificationCode 表
CREATE TABLE IF NOT EXISTS "VerificationCode" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'register',
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "idx_verification_code_email_type" ON "VerificationCode"(email, type);
CREATE INDEX IF NOT EXISTS "idx_verification_code_expires" ON "VerificationCode"("expiresAt");

-- 查看表结构
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'VerificationCode';
