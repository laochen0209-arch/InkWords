--
-- 创建签到表
-- 用于存储用户每日签到记录
--

-- 创建签到表
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 每个用户每天只能签到一次
    UNIQUE(user_id, date)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(date);

-- 添加表注释
COMMENT ON TABLE check_ins IS '用户签到记录表';
COMMENT ON COLUMN check_ins.user_id IS '用户ID';
COMMENT ON COLUMN check_ins.date IS '签到日期';
COMMENT ON COLUMN check_ins.created_at IS '签到时间';

-- 禁用 RLS (行级安全)
ALTER TABLE check_ins DISABLE ROW LEVEL SECURITY;

-- 授予权限
GRANT ALL ON check_ins TO service_role;
GRANT ALL ON check_ins TO authenticated;
GRANT ALL ON check_ins TO anon;
