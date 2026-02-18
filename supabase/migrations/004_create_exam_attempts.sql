--
-- 创建考试尝试记录表和 RPC 函数
-- 用于存储用户考试尝试和成绩
--

-- 创建考试尝试记录表
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_id TEXT NOT NULL,
    p_total_questions INTEGER NOT NULL,
    p_correct_count INTEGER NOT NULL,
    score INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_completed_at ON exam_attempts(completed_at DESC);

-- 添加表注释
COMMENT ON TABLE exam_attempts IS '用户考试尝试记录表';
COMMENT ON COLUMN exam_attempts.id IS '记录ID';
COMMENT ON COLUMN exam_attempts.user_id IS '用户ID';
COMMENT ON COLUMN exam_attempts.exam_id IS '考试ID';
COMMENT ON COLUMN exam_attempts.p_total_questions IS '总题数';
COMMENT ON COLUMN exam_attempts.p_correct_count IS '正确题数';
COMMENT ON COLUMN exam_attempts.score IS '得分';
COMMENT ON COLUMN exam_attempts.completed_at IS '完成时间';
COMMENT ON COLUMN exam_attempts.created_at IS '创建时间';

-- 禁用 RLS (行级安全)
ALTER TABLE exam_attempts DISABLE ROW LEVEL SECURITY;

-- 授予权限
GRANT ALL ON exam_attempts TO service_role;
GRANT ALL ON exam_attempts TO authenticated;
GRANT ALL ON exam_attempts TO anon;

-- 创建 RPC 函数：提交考试尝试
CREATE OR REPLACE FUNCTION submit_exam_attempt(
    p_user_id UUID,
    p_exam_id TEXT,
    p_total_questions INTEGER,
    p_correct_count INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    attempt_id UUID;
BEGIN
    -- 插入考试尝试记录
    INSERT INTO exam_attempts (
        user_id,
        exam_id,
        p_total_questions,
        p_correct_count,
        score
    ) VALUES (
        p_user_id,
        p_exam_id,
        p_total_questions,
        p_correct_count,
        p_correct_count
    )
    RETURNING id INTO attempt_id;

    -- 返回新记录的 ID
    RETURN attempt_id;
END;
$$ SECURITY DEFINER;

-- 授予权限
GRANT EXECUTE ON FUNCTION submit_exam_attempt TO service_role;
GRANT EXECUTE ON FUNCTION submit_exam_attempt TO authenticated;
GRANT EXECUTE ON FUNCTION submit_exam_attempt TO anon;

COMMENT ON FUNCTION submit_exam_attempt IS '提交考试尝试并返回记录ID';
