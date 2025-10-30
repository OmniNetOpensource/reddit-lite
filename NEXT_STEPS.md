# 🚀 下一步操作指南

## ✅ 你已经完成了

1. ✓ 运行数据库迁移成功
2. ✓ 环境变量已配置到 `.env.local`

## 📋 接下来要做的事

### 第一步：验证 Supabase 设置（1分钟）

在 Supabase SQL Editor 运行：

```sql
-- 检查 communities 表是否有数据
SELECT name, slug FROM communities;
```

**如果返回结果为空**，你可以通过应用程序创建社区，或者手动在 SQL Editor 中插入社区数据。

### 第二步：配置 Supabase Auth（2分钟）

1. 在 Supabase Dashboard，点击左侧 **"Authentication"**
2. 点击 **"URL Configuration"**
3. 在 **"Site URL"** 填写：
   ```
   http://localhost:3000
   ```
4. 在 **"Redirect URLs"** 添加：
   ```
   http://localhost:3000/**
   ```
5. 点击 **"Save"**

**重要：** 如果你想测试注册功能，还需要：
1. 点击 **"Providers"** 标签
2. 确保 **"Email"** 已启用
3. 点击 **"Settings"** > **"Auth"**
4. **测试阶段：** 关闭 **"Enable email confirmations"**（这样注册后不需要确认邮箱）
5. 点击 **"Save"**

### 第三步：启动开发服务器（30秒）

在项目根目录运行：

```bash
pnpm dev
```

等待服务器启动，应该看到：

```
▲ Next.js 16.0.1
- Local:        http://localhost:3000
- Ready in 2.5s
```

### 第四步：测试应用功能 🎮

#### 1. 访问首页

打开浏览器访问：`http://localhost:3000`

✅ 应该看到：
- Reddit Lite 界面
- 顶部导航栏
- 热门社区标签
- 空的帖子列表（还没有帖子）

#### 2. 测试注册功能

1. 点击右上角 **"Sign In"** 按钮
2. 切换到 **"Sign Up"** 标签
3. 填写信息：
   ```
   Username: testuser
   Email: test@example.com
   Password: test123456
   Confirm Password: test123456
   ```
4. 点击 **"Sign Up"**

✅ 成功标志：
- 自动登录
- 右上角显示用户头像或用户名
- 可以点击查看用户菜单

#### 3. 测试创建帖子

1. 点击 **"Create Post"** 按钮
2. 选择社区：**nextjs**
3. 选择类型：**Text**
4. 填写：
   ```
   Title: 我的第一个帖子
   Content: 测试 Supabase 集成成功！
   ```
5. 点击 **"Post"**

✅ 成功标志：
- 跳转到帖子详情页
- 可以看到帖子内容
- 返回首页能看到新帖子

#### 4. 测试投票功能

1. 返回首页（点击顶部 "Home"）
2. 找到你刚创建的帖子
3. 点击 **上箭头 ⬆️**

✅ 成功标志：
- 箭头变成橙色
- 数字从 0 变成 1
- 点击同一个箭头会取消投票

#### 5. 测试实时功能（可选）

1. 打开两个浏览器窗口
2. 在一个窗口创建新帖子
3. 在另一个窗口查看首页

✅ 成功标志：
- 新帖子会自动出现（无需刷新）

### 第五步：检查数据库（可选）

回到 Supabase Dashboard：

1. 点击 **"Table Editor"**
2. 查看 **posts** 表
   - 应该能看到你创建的帖子
3. 查看 **profiles** 表
   - 应该能看到你的用户资料
4. 查看 **post_votes** 表
   - 应该能看到你的投票记录

## 🚨 常见问题排查

### 问题1：Cannot connect to Supabase

**症状：** 页面加载时控制台报错

**解决：**
```bash
# 检查 .env.local 文件
cat .env.local

# 确认有这两行（替换成你的真实值）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 重启开发服务器
# 按 Ctrl+C 停止
pnpm dev
```

### 问题2：注册后没反应

**可能原因：** 邮箱确认未关闭

**解决：**
1. Supabase > Authentication > Settings > Auth
2. 找到 "Enable email confirmations"
3. **关闭**此选项
4. 保存
5. 重新尝试注册

### 问题3：Cannot read properties of undefined

**可能原因：** 社区数据未添加

**解决：**
```sql
-- 在 Supabase SQL Editor 运行
SELECT * FROM communities;

-- 如果为空，运行第一步的 INSERT 语句
```

### 问题4：投票不生效

**症状：** 点击投票按钮没反应

**解决：**
1. 确认已登录（右上角有用户菜单）
2. 打开浏览器开发者工具（F12）
3. 查看 Console 标签是否有错误
4. 检查 Network 标签是否有失败的请求

## 📊 功能清单

测试完成后，你应该能够：

- [x] 访问首页
- [x] 注册新账号
- [x] 登录/登出
- [x] 创建帖子
- [x] 投票（上票/下票）
- [x] 浏览不同社区
- [x] 查看帖子详情
- [x] 看到实时更新

## 🎯 下一步建议

### 本地开发完成后

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Complete Supabase integration"
   git push origin main
   ```

2. **部署到 Vercel**
   - 查看 `VERCEL_DEPLOYMENT_CN.md` 详细步骤
   - 约需 10-15 分钟

### 功能扩展建议

1. **添加评论功能**
   - API 已就绪（`lib/api/comments.ts`）
   - 需要创建评论组件

2. **用户个人页面**
   - 显示用户的帖子历史
   - 显示 karma 统计

3. **图片上传**
   - 使用 `lib/utils/upload.ts`
   - 替换 URL 输入为文件上传

4. **搜索功能**
   - 搜索帖子
   - 搜索用户
   - 搜索社区

## 📚 参考文档

- **QUICKSTART.md** - 完整设置指南
- **SUPABASE_SETUP.md** - Supabase 详细说明
- **VERCEL_DEPLOYMENT_CN.md** - Vercel 部署指南
- **MIGRATION_FIX.md** - 数据库问题解决

## 💬 需要帮助？

如果遇到问题：

1. 检查浏览器控制台（F12）
2. 查看 Supabase Dashboard > Logs
3. 参考 `MIGRATION_FIX.md` 常见问题
4. 提交 GitHub Issue

---

## 🎉 准备好了吗？

运行以下命令开始：

```bash
# 启动开发服务器
pnpm dev

# 打开浏览器
# 访问 http://localhost:3000
```

**祝你开发愉快！** 🚀

