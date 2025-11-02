-- ============================================================================
-- Reddit Lite - 注册问题诊断和修复脚本
-- ============================================================================
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 依次运行每个部分的 SQL

-- ============================================================================
-- 第一步：诊断问题
-- ============================================================================

-- 1. 检查 profiles 表是否存在
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'profiles'
) AS profiles_table_exists;

-- 2. 检查触发器函数是否存在
SELECT EXISTS (
  SELECT FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname = 'handle_new_user'
) AS handle_new_user_function_exists;

-- 3. 检查触发器是否存在
SELECT EXISTS (
  SELECT FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created'
  AND event_object_schema = 'auth'
  AND event_object_table = 'users'
) AS trigger_exists;

-- 4. 查看所有 auth.users 用户
SELECT id, email, created_at,
       raw_user_meta_data->>'username' as metadata_username
FROM auth.users
ORDER BY created_at DESC;

-- 5. 查看所有 profiles
SELECT id, username, created_at
FROM public.profiles
ORDER BY created_at DESC;

-- 6. 查找没有 profile 的用户（这些用户注册失败了）
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- ============================================================================
-- 第二步：修复问题
-- ============================================================================

-- 选项 A：如果触发器函数不存在，重新创建它
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'avatar', NULL)
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- 记录错误但不阻止用户创建
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 选项 B：如果触发器不存在，重新创建它
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 第三步：清理和修复已存在的用户
-- ============================================================================

-- 选项 1：为已存在但没有 profile 的用户手动创建 profile
INSERT INTO public.profiles (id, username, avatar)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', 'user_' || substr(au.id::text, 1, 8)),
  COALESCE(au.raw_user_meta_data->>'avatar', NULL)
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 选项 2：如果你想删除测试用户重新开始（谨慎使用！）
-- 注意：这会删除所有没有 profile 的用户
-- DELETE FROM auth.users
-- WHERE id IN (
--   SELECT au.id
--   FROM auth.users au
--   LEFT JOIN public.profiles p ON au.id = p.id
--   WHERE p.id IS NULL
-- );

-- ============================================================================
-- 第四步：验证修复
-- ============================================================================

-- 1. 再次检查没有 profile 的用户（应该返回 0 行）
SELECT COUNT(*) as users_without_profile
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 2. 查看触发器状态
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 3. 查看函数详情
SELECT
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'handle_new_user';

-- ============================================================================
-- 额外：检查 RLS 策略
-- ============================================================================

-- 查看 profiles 表的 INSERT 策略
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
WHERE tablename = 'profiles'
AND cmd = 'INSERT';

-- 如果策略有问题，可以重新创建
-- DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- CREATE POLICY "Users can insert their own profile"
--   ON public.profiles FOR INSERT
--   WITH CHECK (auth.uid() = id);
