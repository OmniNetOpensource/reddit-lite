# Vercel + Supabase 部署指南（中文详细版）

## 为什么选择 Vercel + Supabase？

### ✅ 优势

1. **完全免费开始**
   - Vercel：免费套餐包含 100GB 带宽
   - Supabase：免费套餐包含 500MB 数据库

2. **零配置部署**
   - 推送代码 → 自动部署
   - 无需配置服务器
   - 自动 HTTPS

3. **全球 CDN**
   - Vercel：全球边缘网络
   - Supabase：多区域可选

4. **开发体验好**
   - 预览部署（每个 PR 独立 URL）
   - 实时日志
   - 一键回滚

## 📝 详细部署步骤

### 第一部分：Supabase 后端设置

#### 1. 创建 Supabase 项目（5分钟）

**步骤：**

1. 访问 https://supabase.com
2. 点击右上角 "Start your project"
3. 使用 GitHub 账号登录
4. 点击 "New Project"

**填写信息：**
```
Project name: reddit-lite
Database Password: 创建一个强密码（例如：MyStr0ng!Pass2024）
Region: 选择最近的区域
  - 中国用户建议：Singapore (东南亚)
  - 或 Tokyo (东京)
Pricing Plan: Free（免费套餐）
```

5. 点击 "Create new project"
6. ⏱️ 等待 1-2 分钟完成初始化

#### 2. 运行数据库迁移（3分钟）

**步骤：**

1. 项目创建完成后，左侧菜单点击 **"SQL Editor"**
2. 点击右上角 **"New query"** 
3. 打开本地项目的 `supabase/migrations/001_initial_schema.sql` 文件
4. **全选复制** 文件内容（约500行SQL）
5. 粘贴到 Supabase SQL Editor
6. 点击右下角 **"Run"** 按钮
7. 看到 "Success" 消息 ✅

**验证迁移成功：**

1. 左侧点击 **"Table Editor"**
2. 应该看到创建的表：
   - profiles
   - communities
   - posts
   - comments
   - post_votes
   - comment_votes
   - community_members

#### 3. 配置认证（2分钟）

1. 左侧点击 **"Authentication"**
2. 点击 **"Providers"** 标签
3. 找到 **"Email"** 提供商（应该默认启用）

**重要设置：**

4. 点击 **"Settings"** > **"Auth"**
5. 找到 **"Enable email confirmations"**
6. **测试阶段：** 关闭此选项 ❌
7. **生产环境：** 建议开启 ✅
8. 滚动到底部点击 **"Save"**

#### 4. 获取 API 凭证（1分钟）

1. 左侧点击 **"Settings"** ⚙️
2. 点击 **"API"**
3. 复制以下两个值（**非常重要！**）：

   **Project URL:**
   ```
   https://xxxxxxxxxxx.supabase.co
   ```

   **anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...（很长的字符串）
   ```

4. 📝 保存到记事本（稍后会用到）

⚠️ **注意：** 不要复制 `service_role key`（仅用于服务端）

### 第二部分：准备代码

#### 5. 确认本地项目（2分钟）

```bash
# 确认所有文件都已提交
git status

# 如果有未提交的文件
git add .
git commit -m "Supabase backend integration complete"
```

#### 6. 推送到 GitHub（3分钟）

**如果还没有 GitHub 仓库：**

1. 访问 https://github.com/new
2. 创建新仓库：
   - Repository name: `reddit-lite`
   - Description: `Reddit clone with Next.js and Supabase`
   - Public 或 Private（都可以）
3. **不要** 勾选 "Initialize with README"

**推送代码：**

```bash
# 添加远程仓库（替换你的用户名）
git remote add origin https://github.com/你的用户名/reddit-lite.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

✅ 刷新 GitHub 页面，应该看到代码已上传

### 第三部分：Vercel 部署

#### 7. 导入项目到 Vercel（2分钟）

1. 访问 https://vercel.com
2. 点击 **"Sign Up"** 或 **"Login"**
3. 选择 **"Continue with GitHub"**
4. 授权 Vercel 访问你的 GitHub 账号

**导入项目：**

5. 点击右上角 **"Add New..."** > **"Project"**
6. 找到 `reddit-lite` 仓库
7. 点击 **"Import"**

#### 8. 配置环境变量（3分钟）

在 "Configure Project" 页面：

1. 展开 **"Environment Variables"** 部分

2. 添加第一个变量：
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://你的项目ID.supabase.co
   ```
   点击 **"Add"**

3. 添加第二个变量：
   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（你的anon key）
   ```
   点击 **"Add"**

⚠️ **重要检查：**
- ✅ 变量名必须是 `NEXT_PUBLIC_` 开头
- ✅ 没有多余空格
- ✅ 值正确复制粘贴

#### 9. 部署（2分钟）

1. 确认 Framework Preset 是 **"Next.js"**
2. Build Command 保持默认：`next build`
3. Output Directory 保持默认：`.next`
4. 点击 **"Deploy"** 按钮 🚀

**等待部署：**
- 进度条显示构建过程
- 通常需要 2-3 分钟
- 看到 "🎉 Congratulations" 表示成功！

#### 10. 获取部署 URL

部署完成后：

1. 你会看到类似这样的 URL：
   ```
   https://reddit-lite-xxx.vercel.app
   ```

2. 点击 **"Visit"** 或 **"Continue to Dashboard"**

### 第四部分：Supabase 配置更新

#### 11. 添加 Vercel 域名到 Supabase（2分钟）

**重要！** 必须配置允许的URL，否则认证会失败。

1. 回到 **Supabase Dashboard**
2. 选择你的 `reddit-lite` 项目
3. 左侧点击 **"Authentication"**
4. 点击 **"URL Configuration"**

**配置网站 URL：**

5. **Site URL** 填写：
   ```
   https://你的项目名.vercel.app
   ```

6. **Redirect URLs** 添加（一行一个）：
   ```
   https://你的项目名.vercel.app/**
   http://localhost:3000/**
   ```

7. 点击 **"Save"** 保存

✅ 现在你的应用可以正常进行身份验证了！

## 🎉 测试你的应用

### 访问网站

打开浏览器，访问：
```
https://你的项目名.vercel.app
```

### 测试功能清单

#### 1. 注册新账号 ✓
```
1. 点击右上角 "Sign In"
2. 切换到 "Sign Up" 标签
3. 填写：
   - Username: testuser
   - Email: test@example.com
   - Password: test123456
4. 点击 "Sign Up"
5. ✅ 应该看到用户菜单
```

#### 2. 创建帖子 ✓
```
1. 点击 "Create Post"
2. 选择社区：nextjs
3. 选择类型：Text
4. 填写标题：My First Post
5. 填写内容：Testing deployment!
6. 点击 "Post"
7. ✅ 应该跳转到帖子详情页
```

#### 3. 投票功能 ✓
```
1. 返回首页
2. 点击帖子的上箭头 ⬆️
3. ✅ 数字应该增加，箭头变橙色
```

#### 4. 实时更新 ✓
```
1. 打开两个浏览器窗口
2. 在一个窗口创建帖子
3. ✅ 另一个窗口应该自动显示新帖子
```

## 🔧 后续优化

### 自动部署

已经配置完成！现在：
- ✅ 推送到 `main` 分支 → 自动部署到生产
- ✅ 创建 PR → 自动生成预览链接

```bash
# 正常开发流程
git checkout -b feature/new-feature
# 写代码...
git commit -m "Add new feature"
git push origin feature/new-feature
# 在 GitHub 创建 PR
# ✅ Vercel 自动部署预览版本
```

### 自定义域名（可选）

如果你有自己的域名：

1. Vercel Dashboard > 你的项目
2. Settings > Domains
3. 添加你的域名
4. 按照提示配置 DNS
5. 记得在 Supabase 更新 URL 配置！

### 监控和日志

#### Vercel 日志
```
Dashboard > Deployments > 点击具体部署 > Logs
```

#### Supabase 日志
```
Dashboard > Logs Explorer
```

## 🚨 常见问题解决

### 问题1：认证不工作 ❌

**症状：** 点击注册没反应，或显示错误

**解决：**
```bash
1. 检查 Supabase > Authentication > URL Configuration
2. 确认包含 Vercel 域名
3. 检查 Vercel 环境变量是否正确
4. 重新部署：Vercel Dashboard > Deployments > Redeploy
```

### 问题2：数据不显示 ❌

**症状：** 社区列表为空，无法创建帖子

**解决：**
```sql
-- 在 Supabase SQL Editor 运行：
SELECT * FROM communities;

-- 如果为空，通过应用程序创建社区或手动插入数据
```

### 问题3：部署失败 ❌

**症状：** 构建错误

**解决：**
```bash
# 本地测试构建
pnpm build

# 如果本地成功，Vercel 也应该成功
# 如果失败，检查：
1. Vercel 环境变量
2. 依赖是否正确安装
3. TypeScript 错误
```

### 问题4：投票不生效 ❌

**症状：** 点击投票没反应

**解决：**
```
1. 确认已登录
2. 检查浏览器控制台错误
3. 检查 Supabase RLS 策略
4. 验证 post_votes 表存在
```

## 📊 费用估算

### 免费套餐包含

**Vercel Free:**
- ✅ 100GB 带宽/月
- ✅ 无限网站
- ✅ 自动 HTTPS
- ✅ DDoS 保护

**Supabase Free:**
- ✅ 500MB 数据库
- ✅ 1GB 文件存储
- ✅ 50,000 月活用户
- ✅ 社区支持

### 何时需要升级？

**Vercel ($20/月):**
- 超过 100GB 带宽
- 需要团队协作
- 需要高级分析

**Supabase ($25/月):**
- 超过 500MB 数据
- 超过 50,000 MAU
- 需要每日备份
- 需要邮件支持

对于大多数个人项目和小型应用，**免费套餐完全够用**！

## 🎯 性能优化建议

### 1. 启用图片优化

```typescript
// 使用 Next.js Image 组件
import Image from 'next/image';

<Image 
  src={imageUrl}
  alt="Post image"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

### 2. 添加缓存策略

```typescript
// app/page.tsx
export const revalidate = 60; // 60秒缓存
```

### 3. 使用 Vercel Analytics

```bash
pnpm add @vercel/analytics

# app/layout.tsx 添加
import { Analytics } from '@vercel/analytics/react';
```

## 📚 额外资源

### 中文文档
- [Vercel 中文文档](https://vercel.com/docs)
- [Supabase 中文文档](https://supabase.com/docs)
- [Next.js 中文文档](https://nextjs.org/docs)

### 视频教程
- YouTube 搜索: "Vercel Supabase deployment"
- B站搜索: "Vercel 部署教程"

### 社区支持
- [Vercel Discord](https://discord.gg/vercel)
- [Supabase Discord](https://discord.supabase.com)

## ✅ 部署检查清单

打印出来，逐项检查：

- [ ] Supabase 项目已创建
- [ ] 数据库迁移已运行
- [ ] Communities 表有数据
- [ ] API 凭证已复制
- [ ] 代码已推送到 GitHub
- [ ] Vercel 项目已导入
- [ ] 环境变量已添加
- [ ] 首次部署成功
- [ ] Supabase URL 已配置
- [ ] 网站可以访问
- [ ] 注册功能正常
- [ ] 创建帖子正常
- [ ] 投票功能正常
- [ ] 实时更新正常

## 🎊 恭喜！

你的 Reddit Lite 现在已经：
- ✅ 部署在全球 CDN
- ✅ 使用生产级数据库
- ✅ 支持实时更新
- ✅ 自动 CI/CD
- ✅ 完全免费（免费套餐内）

**开始使用你的应用吧！** 🚀

---

**需要帮助？** 欢迎提 Issue 或加入社区讨论！

