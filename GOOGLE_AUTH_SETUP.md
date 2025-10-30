# Google OAuth 设置指南

## 📋 概述

为 Reddit Lite 添加 Google OAuth 登录功能，让用户可以用 Google 账号一键登录。

## 🚀 设置步骤

### 第一步：在 Google Cloud 创建 OAuth 应用（5-10分钟）

#### 1. 访问 Google Cloud Console

访问：https://console.cloud.google.com/

#### 2. 创建新项目（如果还没有）

1. 点击顶部项目下拉菜单
2. 点击 **"新建项目"**
3. 项目名称：`reddit-lite`（或任意名称）
4. 点击 **"创建"**
5. 等待项目创建完成

#### 3. 启用 Google+ API

1. 确保选中了你的项目
2. 左侧菜单 > **"API 和服务"** > **"库"**
3. 搜索：`Google+ API`
4. 点击进入
5. 点击 **"启用"**

#### 4. 配置 OAuth 同意屏幕

1. 左侧菜单 > **"API 和服务"** > **"OAuth 同意屏幕"**
2. 用户类型选择：**"外部"**
3. 点击 **"创建"**

**填写应用信息：**

```
应用名称: Reddit Lite
用户支持电子邮件: 你的邮箱
应用徽标: (可选，暂时跳过)

开发者联系信息:
电子邮件地址: 你的邮箱
```

4. 点击 **"保存并继续"**
5. **作用域** 页面：直接点击 **"保存并继续"**（使用默认作用域）
6. **测试用户** 页面：
   - 点击 **"添加用户"**
   - 添加你的测试邮箱
   - 点击 **"保存并继续"**
7. 点击 **"返回到信息中心"**

#### 5. 创建 OAuth 客户端 ID

1. 左侧菜单 > **"API 和服务"** > **"凭据"**
2. 点击顶部 **"创建凭据"** > **"OAuth 客户端 ID"**
3. 应用类型：选择 **"Web 应用"**

**填写信息：**

```
名称: Reddit Lite Web Client

已获授权的 JavaScript 来源:
http://localhost:3000
https://你的项目名.vercel.app  (如果已部署)

已获授权的重定向 URI:
https://你的项目ID.supabase.co/auth/v1/callback
```

> ⚠️ **重要：** 重定向 URI 必须是你的 Supabase 项目 URL + `/auth/v1/callback`

4. 点击 **"创建"**

#### 6. 获取凭据

创建完成后会弹出对话框：

```
客户端 ID: 1234567890-abc123.apps.googleusercontent.com
客户端密钥: GOCSPX-xxxxxxxxxxxxxxxxxxxxx
```

**📝 复制并保存这两个值！**

### 第二步：在 Supabase 配置 Google Provider（2分钟）

#### 1. 打开 Supabase Dashboard

1. 访问你的 Supabase 项目
2. 左侧点击 **"Authentication"**
3. 点击 **"Providers"**

#### 2. 启用 Google

1. 找到 **"Google"** 提供商
2. 点击右侧的切换开关启用
3. 填写刚才获取的凭据：

```
Client ID: 粘贴你的 Google Client ID
Client Secret: 粘贴你的 Google Client Secret
```

4. 点击 **"Save"**

✅ Supabase 端配置完成！

### 第三步：更新前端代码（5分钟）

#### 1. 更新 Sign In Modal

编辑 `components/auth/sign-in-modal.tsx`：

```typescript
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';

interface SignInModalProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export function SignInModal({ onClose, onSwitchToSignUp }: SignInModalProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  // 新增：Google 登录处理
  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sign In</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Google Sign In Button - 新增 */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="mb-4 w-full flex items-center justify-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-md border border-zinc-200 bg-white px-4 py-2 outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-md border border-zinc-200 bg-white px-4 py-2 outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Switch to Sign Up */}
        <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignUp}
            className="font-medium text-orange-500 hover:text-orange-600"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### 2. 同样更新 Sign Up Modal

编辑 `components/auth/sign-up-modal.tsx`，在表单前添加 Google 按钮：

```typescript
// 在 handleSubmit 函数后添加
const handleGoogleSignUp = async () => {
  const supabase = createClient();
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    setError(error.message);
  }
};

// 在 return 的表单前添加 Google 按钮（同上）
```

#### 3. 创建 OAuth 回调页面

创建 `app/auth/callback/route.ts`：

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 重定向到首页
  return NextResponse.redirect(requestUrl.origin);
}
```

### 第四步：更新数据库触发器（重要！）

Google 登录的用户需要自动创建 profile，更新触发器：

在 Supabase SQL Editor 运行：

```sql
-- 更新 handle_new_user 函数以支持 Google OAuth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- 尝试从 metadata 获取用户名
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    'user_' || substr(NEW.id::text, 1, 8)
  );
  
  -- 确保用户名唯一
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = generated_username) LOOP
    generated_username := generated_username || floor(random() * 1000)::text;
  END LOOP;
  
  -- 创建 profile
  INSERT INTO profiles (id, username, avatar)
  VALUES (
    NEW.id,
    generated_username,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NULL
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 第五步：配置重定向 URL（重要！）

#### 开发环境

在 Supabase Authentication > URL Configuration：

```
Site URL: http://localhost:3000

Redirect URLs:
http://localhost:3000/**
http://localhost:3000/auth/callback
```

#### 生产环境（Vercel 部署后）

添加：

```
Site URL: https://你的项目.vercel.app

Redirect URLs:
https://你的项目.vercel.app/**
https://你的项目.vercel.app/auth/callback
```

同时，回到 Google Cloud Console 更新重定向 URI：

```
已获授权的 JavaScript 来源:
https://你的项目.vercel.app

已获授权的重定向 URI:
https://你的项目ID.supabase.co/auth/v1/callback
```

## 🧪 测试 Google OAuth

### 本地测试

1. 启动开发服务器：
   ```bash
   pnpm dev
   ```

2. 访问 `http://localhost:3000`

3. 点击 "Sign In"

4. 点击 "Continue with Google"

5. 选择 Google 账号

6. 授权后应该：
   - 自动登录
   - 创建 profile
   - 显示用户菜单

### 验证数据库

在 Supabase SQL Editor 查看：

```sql
-- 查看新创建的 profile
SELECT id, username, avatar, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 应该看到用户名类似：
-- user_12345678 (如果没有 Google 名字)
-- 或实际的 Google 名字
```

## 🎨 可选：美化 Google 按钮

如果想要更好看的 Google 按钮，可以使用图标库：

```bash
# 如果需要更多图标
pnpm add @icons-pack/react-simple-icons
```

或者直接使用 SVG（已在代码中提供）。

## 🚀 部署到生产环境

### 1. 推送代码

```bash
git add .
git commit -m "Add Google OAuth authentication"
git push origin main
```

### 2. Vercel 自动部署

- Vercel 会自动部署
- 等待 2-3 分钟

### 3. 更新 Google Cloud Console

添加生产环境的重定向 URI：

```
https://你的项目ID.supabase.co/auth/v1/callback
```

### 4. 更新 Supabase

在 Redirect URLs 添加：

```
https://你的项目.vercel.app/auth/callback
```

## 🔒 安全最佳实践

### 1. 限制 OAuth 作用域

只请求必要的权限（默认就是最小权限）。

### 2. 验证 Email

在生产环境建议启用邮箱验证：

```
Supabase > Authentication > Settings > Auth
启用 "Enable email confirmations"
```

### 3. 设置发布状态

测试完成后，在 Google Cloud Console：

```
OAuth 同意屏幕 > 发布应用 > 发布
```

否则只有测试用户可以登录。

## 📊 功能对比

| 功能 | Email/Password | Google OAuth |
|------|----------------|--------------|
| 注册速度 | 需填表单 | 一键登录 ✅ |
| 用户体验 | 需记密码 | 无需记密码 ✅ |
| 安全性 | 取决于密码强度 | Google 级别安全 ✅ |
| 头像 | 需手动设置 | 自动获取 ✅ |
| 邮箱验证 | 需额外步骤 | 已验证 ✅ |

## 🎯 下一步

### 添加更多 OAuth 提供商

可以类似地添加：

1. **GitHub**
   - Supabase 内置支持
   - 开发者用户最爱

2. **Discord**
   - 适合社区应用
   - 年轻用户群体

3. **Microsoft**
   - 企业用户
   - Office 365 集成

### 自定义用户名

Google 登录后让用户选择用户名：

```typescript
// 在 auth/callback 检查是否需要设置用户名
// 如果 username 以 'user_' 开头，重定向到设置页面
```

## 🐛 常见问题

### 问题1：Redirect URI 不匹配

**错误：** `redirect_uri_mismatch`

**解决：**
1. 检查 Google Cloud Console 的重定向 URI
2. 必须精确匹配：`https://项目ID.supabase.co/auth/v1/callback`

### 问题2：OAuth 弹窗被阻止

**解决：**
1. 允许浏览器弹窗
2. 或使用重定向模式（已默认使用）

### 问题3：Profile 创建失败

**检查：**
```sql
-- 检查触发器是否存在
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 重新创建触发器（如果不存在）
-- 运行上面的 handle_new_user 函数和触发器
```

## 📚 参考资料

- [Supabase Google OAuth 文档](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 文档](https://developers.google.com/identity/protocols/oauth2)
- [Next.js 认证最佳实践](https://nextjs.org/docs/authentication)

---

**配置完成！** 🎉 用户现在可以用 Google 账号一键登录了！

