--
-- 为 verification_codes 表添加 RLS 策略
-- 解决 service_role 权限问题
--

-- 为 service_role 添加绕过 RLS 的策略（服务端使用）
CREATE POLICY IF NOT EXISTS "Allow service role bypass RLS" ON verification_codes
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- 为 authenticated 用户添加访问策略（可选，用于已登录用户）
CREATE POLICY IF NOT EXISTS "Allow authenticated access" ON verification_codes
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);
