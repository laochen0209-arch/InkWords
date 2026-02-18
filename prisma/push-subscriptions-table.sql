/**
 * @file push-subscriptions-table.sql
 * @description 推送订阅表 - 存储用户浏览器推送订阅信息
 * @author InkWords Team
 * @date 2026-02-08
 */

-- 创建推送订阅表
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- 启用 RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
-- 用户只能查看自己的订阅
CREATE POLICY "Users can view own subscriptions" ON push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的订阅
CREATE POLICY "Users can insert own subscriptions" ON push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的订阅
CREATE POLICY "Users can update own subscriptions" ON push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的订阅
CREATE POLICY "Users can delete own subscriptions" ON push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- 允许匿名用户插入订阅（用于未登录用户）
CREATE POLICY "Allow anonymous insert" ON push_subscriptions
  FOR INSERT WITH CHECK (true);

-- 允许匿名用户通过 endpoint 删除订阅
CREATE POLICY "Allow anonymous delete by endpoint" ON push_subscriptions
  FOR DELETE USING (true);

-- 注释
COMMENT ON TABLE push_subscriptions IS '存储浏览器推送通知订阅信息';
COMMENT ON COLUMN push_subscriptions.endpoint IS '推送服务端点 URL';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'P-256 ECDH 公钥';
COMMENT ON COLUMN push_subscriptions.auth IS '认证密钥';
