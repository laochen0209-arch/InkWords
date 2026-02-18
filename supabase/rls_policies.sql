-- ============================================================================
-- Supabase RLS (Row Level Security) 策略配置
-- 用于 users 表和 user_study_stats 表
-- 
-- 执行说明：
-- 1. 在 Supabase Dashboard -> SQL Editor 中执行
-- 2. 或者使用 supabase CLI: supabase db push
-- ============================================================================

-- ============================================================================
-- 1. users 表 RLS 策略
-- ============================================================================

-- 启用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- 策略1：用户可以查看自己的数据
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- 策略2：用户可以更新自己的数据
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- 策略3：用户可以插入自己的数据（用于注册时创建用户记录）
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. user_study_stats 表 RLS 策略（如果存在）
-- ============================================================================

-- 启用 RLS（如果表存在）
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_study_stats') THEN
    ALTER TABLE public.user_study_stats ENABLE ROW LEVEL SECURITY;
    
    -- 删除现有策略
    DROP POLICY IF EXISTS "Users can view own stats" ON public.user_study_stats;
    DROP POLICY IF EXISTS "Users can update own stats" ON public.user_study_stats;
    DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_study_stats;
    
    -- 策略1：用户可以查看自己的学习统计
    CREATE POLICY "Users can view own stats"
      ON public.user_study_stats
      FOR SELECT
      USING (auth.uid() = user_id);
    
    -- 策略2：用户可以更新自己的学习统计
    CREATE POLICY "Users can update own stats"
      ON public.user_study_stats
      FOR UPDATE
      USING (auth.uid() = user_id);
    
    -- 策略3：用户可以插入自己的学习统计
    CREATE POLICY "Users can insert own stats"
      ON public.user_study_stats
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================================
-- 3. user_activities 表 RLS 策略（如果存在）
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_activities') THEN
    ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
    DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;
    
    CREATE POLICY "Users can view own activities"
      ON public.user_activities
      FOR SELECT
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own activities"
      ON public.user_activities
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================================
-- 4. 验证 RLS 是否启用
-- ============================================================================

-- 检查 users 表的 RLS 状态
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- 检查 users 表的策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';
