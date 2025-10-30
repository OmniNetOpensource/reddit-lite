# Vercel + Supabase 部署指南

## 概述

Reddit Lite 可以轻松部署到 Vercel，同时使用 Supabase 作为后端。这两个服务配合完美，都提供免费套餐。

## 🚀 快速部署步骤

### 第一步：准备 Supabase 项目

1. **创建 Supabase 项目**
   - 访问 [supabase.com](https://supabase.com)
   - 注册账号（免费）
   - 点击 "New Project"
   - 填写项目信息：
     - Name: `reddit-lite`
     - Database Password: 设置强密码（保存好！）
     - Region: 选择离你用户最近的区域
   - 等待约2分钟完成部署

2. **运行数据库迁移**
   - 进入项目后，点击左侧 "SQL Editor"
   - 点击 "New Query"
   - 复制 `supabase/migrations/001_initial_schema.sql` 的全部内容
   - 粘贴到编辑器
   - 点击 "Run" 执行
   - ✅ 应该看到 "Success. No rows returned"

3. **配置认证设置**
   - 点击 "Authentication" > "Settings"
   - **重要：** 在测试阶段，关闭 "Confirm email"
   - 生产环境建议开启邮箱验证

4. **获取 API 凭证**
   - 点击 "Settings" > "API"
   - 复制以下两个值（稍后需要）：
     - **Project URL** (类似: `https://xxxxx.supabase.co`)
     - **anon/public key** (以 `eyJ` 开头的长字符串)
   - ⚠️ **不要复制** `service_role` key（仅服务端使用）

### 第二步：推送代码到 GitHub

1. **创建 GitHub 仓库**
   ```bash
   # 如果还没有 git 仓库
   git init
   git add .
   git commit -m "Add Supabase backend integration"
   ```

2. **推送到 GitHub**
   ```bash
   # 在 GitHub 创建新仓库后
   git remote add origin https://github.com/你的用户名/reddit-lite.git
   git branch -M main
   git push -u origin main
   ```

### 第三步：部署到 Vercel

#### 方式一：通过 Vercel Dashboard（推荐）

1. **导入项目**
   - 访问 [vercel.com](https://vercel.com)
   - 用 GitHub 账号登录
   - 点击 "Add New" > "Project"
   - 选择你的 `reddit-lite` 仓库
   - 点击 "Import"

2. **配置环境变量**
   在 "Environment Variables" 部分添加：
   
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase anon key |

   ⚠️ **注意：** 
   - 确保变量名前缀是 `NEXT_PUBLIC_`
   - 这些值会暴露给浏览器（这是安全的，anon key 设计就是公开的）
   - 数据安全由 Supabase 的 RLS 策略保护

3. **部署**
   - 点击 "Deploy"
   - 等待约 2-3 分钟
   - 🎉 完成！

#### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署（首次会询问配置）
vercel

# 添加环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
# 粘贴你的 Supabase URL

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# 粘贴你的 Supabase anon key

# 重新部署以应用环境变量
vercel --prod
```

### 第四步：配置 Supabase 允许的网址

1. **添加 Vercel 域名到 Supabase**
   - 回到 Supabase Dashboard
   - 进入 "Authentication" > "URL Configuration"
   - 在 "Site URL" 添加你的 Vercel 域名：
     ```
     https://你的项目名.vercel.app
     ```
   - 在 "Redirect URLs" 添加：
     ```
     https://你的项目名.vercel.app/**
     http://localhost:3000/**  （本地开发用）
     ```

2. **保存配置**

## 🔧 自动部署配置

### GitHub 集成（自动部署）

Vercel 已经自动配置了 GitHub 集成：
- ✅ 推送到 `main` 分支 → 自动部署到生产环境
- ✅ 创建 Pull Request → 自动创建预览部署
- ✅ 每次提交都有独立的预览 URL

### 预览部署

对于 PR 预览，可以使用相同的 Supabase 项目（开发/测试用）或创建单独的 Supabase 项目。

**推荐方式：** 为不同环境使用不同的 Supabase 项目

```bash
# 添加生产环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# 添加预览环境变量（可选，使用测试项目）
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview

# 添加开发环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL development
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
```

## 🔒 安全最佳实践

### 1. 环境变量安全

✅ **可以公开的（NEXT_PUBLIC_）：**
- `NEXT_PUBLIC_SUPABASE_URL` - 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 匿名密钥（公开安全）

❌ **绝不公开：**
- `SUPABASE_SERVICE_ROLE_KEY` - 服务端密钥（如果使用）
- 数据库密码
- 其他敏感凭证

### 2. Supabase RLS 策略

数据安全由 Row Level Security 保证：
```sql
-- 示例：用户只能更新自己的帖子
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);
```

### 3. 速率限制

Supabase 免费套餐限制：
- 500MB 数据库空间
- 1GB 文件存储
- 50,000 月活跃用户
- 500MB 带宽/天

升级到 Pro 可获得更多资源。

## 📊 监控和调试

### Vercel 监控

1. **查看部署日志**
   - Vercel Dashboard > 你的项目 > Deployments
   - 点击具体部署查看日志

2. **实时日志**
   ```bash
   vercel logs
   ```

3. **查看分析数据**
   - Vercel Dashboard > Analytics
   - 查看访问量、性能指标

### Supabase 监控

1. **查看数据库**
   - Table Editor：直接查看数据
   - SQL Editor：运行查询

2. **查看日志**
   - Logs Explorer：查看 API 请求
   - 过滤错误和慢查询

3. **监控 API 使用**
   - Settings > Usage：查看配额使用情况

## 🚨 常见问题

### 问题1：部署后无法连接 Supabase

**解决方案：**
1. 检查环境变量是否正确设置
2. 在 Vercel Dashboard 确认变量值
3. 重新部署项目
4. 检查 Supabase "Site URL" 配置

### 问题2：注册/登录不工作

**解决方案：**
1. 检查 Supabase Auth 是否启用
2. 确认 Redirect URLs 包含 Vercel 域名
3. 检查 "Confirm email" 设置
4. 查看浏览器控制台错误

### 问题3：数据不显示

**解决方案：**
1. 确认数据库迁移已运行
2. 通过应用程序创建社区或手动添加数据
3. 验证 RLS 策略正确
4. 查看 Supabase Logs

### 问题4：CORS 错误

**解决方案：**
- Supabase 自动处理 CORS
- 确保使用正确的 anon key
- 检查请求 URL 是否正确

## 🎯 性能优化

### 1. 图片优化

使用 Next.js Image 组件：
```typescript
import Image from 'next/image';

<Image 
  src={post.imageUrl} 
  alt={post.title}
  width={800}
  height={600}
  loading="lazy"
/>
```

### 2. 数据库索引

已在迁移中创建，无需额外配置。

### 3. CDN 缓存

Vercel 自动配置 Edge Network，静态资源全球分发。

### 4. API 路由缓存

可以添加 API 路由缓存：
```typescript
export const revalidate = 60; // 60秒缓存
```

## 📱 自定义域名

### 在 Vercel 添加域名

1. **购买域名**（如 GoDaddy, Namecheap）

2. **添加到 Vercel**
   - Project Settings > Domains
   - 输入域名
   - 按照指示配置 DNS

3. **更新 Supabase**
   - Authentication > URL Configuration
   - 更新 Site URL 为自定义域名

## 🔄 持续部署流程

```bash
# 1. 本地开发
git checkout -b feature/new-feature
# 修改代码...
git commit -m "Add new feature"
git push origin feature/new-feature

# 2. 创建 PR
# GitHub 上创建 Pull Request
# ✅ Vercel 自动创建预览部署

# 3. 合并到 main
# PR 审核通过后合并
# ✅ Vercel 自动部署到生产环境
```

## 📋 部署检查清单

### 部署前
- [ ] 代码推送到 GitHub
- [ ] Supabase 项目已创建
- [ ] 数据库迁移已运行
- [ ] API 凭证已获取

### 部署时
- [ ] 在 Vercel 导入项目
- [ ] 环境变量已配置
- [ ] 首次部署成功

### 部署后
- [ ] 访问网站正常
- [ ] 可以注册新用户
- [ ] 可以创建帖子
- [ ] 投票功能正常
- [ ] 实时更新工作
- [ ] Supabase URL 已配置
- [ ] 自定义域名已添加（可选）

## 🎓 学习资源

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel + Supabase Guide](https://vercel.com/guides/using-supabase-with-vercel)

## 💡 额外建议

### 1. 使用 Vercel Analytics（可选）

```bash
pnpm add @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. 添加 SEO 元数据

```typescript
// app/layout.tsx
export const metadata = {
  title: 'Reddit Lite - 现代化的社区讨论平台',
  description: '使用 Next.js 和 Supabase 构建的全栈 Reddit 克隆',
  openGraph: {
    title: 'Reddit Lite',
    description: '现代化的社区讨论平台',
    url: 'https://你的域名.vercel.app',
    siteName: 'Reddit Lite',
  },
};
```

### 3. 启用 Vercel Speed Insights

免费获取性能指标：
- Project Settings > Speed Insights
- 启用后可查看 Core Web Vitals

## 🎉 完成！

现在你的 Reddit Lite 应用已经：
- ✅ 部署在 Vercel（全球 CDN）
- ✅ 使用 Supabase 后端（数据库、认证、实时）
- ✅ 自动 CI/CD（推送即部署）
- ✅ HTTPS 安全（Vercel 自动配置）
- ✅ 生产环境就绪

**访问你的网站：** `https://你的项目名.vercel.app`

---

**需要帮助？**
- [Vercel 支持](https://vercel.com/support)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/你的仓库/issues)

