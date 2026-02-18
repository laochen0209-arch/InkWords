--
-- 创建验证码表
-- 用于存储邮箱验证码，支持注册和重置密码场景
--

-- 创建验证码表
CREATE TABLE IF NOT EXISTS verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'register', -- 'register' 或 'reset'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 约束
    CONSTRAINT valid_type CHECK (type IN ('register', 'reset'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_type ON verification_codes(type);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);

-- 创建清理过期验证码的函数
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM verification_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 添加表注释
COMMENT ON TABLE verification_codes IS '邮箱验证码表';
COMMENT ON COLUMN verification_codes.email IS '邮箱地址';
COMMENT ON COLUMN verification_codes.code IS '验证码';
COMMENT ON COLUMN verification_codes.type IS '验证码类型：register(注册) 或 reset(重置密码)';
COMMENT ON COLUMN verification_codes.expires_at IS '过期时间';

-- 启用 RLS (行级安全)
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许匿名用户插入验证码
CREATE POLICY "Allow anonymous insert" ON verification_codes
    FOR INSERT TO anon
    WITH CHECK (true);

-- 创建策略：允许匿名用户删除自己的验证码
CREATE POLICY "Allow anonymous delete own codes" ON verification_codes
    FOR DELETE TO anon
    USING (true);

-- 创建策略：允许匿名用户查询验证码（用于验证）
CREATE POLICY "Allow anonymous select" ON verification_codes
    FOR SELECT TO anon
    USING (true);

-- 创建策略：允许 service_role 绕过 RLS（服务端使用）
CREATE POLICY "Allow service role bypass RLS" ON verification_codes
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- 创建策略：允许 authenticated 用户访问（可选，用于已登录用户）
CREATE POLICY "Allow authenticated access" ON verification_codes
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);
