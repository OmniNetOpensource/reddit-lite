# 数据库迁移修复说明

## 问题描述

运行 `001_initial_schema.sql` 时遇到错误：

```
ERROR: 42P17: functions in index expression must be marked IMMUTABLE
```

## 原因

原始迁移文件中包含了一个使用 `NOW()` 函数的索引：

```sql
CREATE INDEX idx_posts_hot_score ON posts(
  (vote_count / (EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 + 2)^1.5) DESC
);
```

**问题：** `NOW()` 函数不是 IMMUTABLE 的（每次调用返回不同时间），PostgreSQL 不允许在索引表达式中使用非 IMMUTABLE 函数。

## 解决方案

已移除有问题的索引。Hot score 排序现在在应用层计算（这实际上更灵活）。

### ✅ 修复后的迁移文件

`idx_posts_hot_score` 索引已被移除，保留的索引：

```sql
-- Posts indexes
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_community_id ON posts(community_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_vote_count ON posts(vote_count DESC);
```

这些索引足够支持应用的查询性能。

## 如何使用修复后的迁移

### 方法 1：重新运行（如果数据库是新的）

如果你的 Supabase 项目还是全新的，没有重要数据：

1. 删除所有表（如果已创建）：

```sql
-- 在 Supabase SQL Editor 运行
DROP TABLE IF EXISTS community_members CASCADE;
DROP TABLE IF EXISTS comment_votes CASCADE;
DROP TABLE IF EXISTS post_votes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS communities CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

2. 重新运行修复后的迁移：
   - 打开 `supabase/migrations/001_initial_schema.sql`
   - 复制全部内容
   - 在 Supabase SQL Editor 粘贴并运行

### 方法 2：只移除有问题的索引（如果已部分运行）

如果迁移已经部分成功：

```sql
-- 检查索引是否存在
SELECT indexname FROM pg_indexes WHERE tablename = 'posts';

-- 如果看到 idx_posts_hot_score，删除它
DROP INDEX IF EXISTS idx_posts_hot_score;
```

然后继续运行迁移文件中剩余的部分。

## 性能影响

### ❓ 移除索引会影响性能吗？

**不会！** 原因：

1. **Hot 排序在应用层完成**
   - 前端代码已经实现了 hot 算法
   - 查询仍然使用 `created_at` 和 `vote_count` 索引
2. **实际查询流程**：

   ```typescript
   // 1. 从数据库获取最近的帖子（使用 created_at 索引）
   const posts = await supabase
     .from("posts")
     .select("*")
     .order("created_at", { ascending: false });

   // 2. 在客户端计算 hot score 并排序
   posts.sort((a, b) => {
     const aScore = a.votes / Math.pow((now - a.createdAt) / 3600 + 2, 1.5);
     const bScore = b.votes / Math.pow((now - b.createdAt) / 3600 + 2, 1.5);
     return bScore - aScore;
   });
   ```

3. **对于小到中型数据集**（< 10,000 posts），客户端排序非常快

### 🚀 如果需要优化大规模数据

当帖子数量超过 10,000 时，可以考虑：

#### 选项 1：使用物化视图（推荐）

```sql
-- 创建物化视图（每小时刷新一次）
CREATE MATERIALIZED VIEW hot_posts AS
SELECT
  id,
  title,
  vote_count,
  created_at,
  vote_count / POWER(
    (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 3600 + 2),
    1.5
  ) as hot_score
FROM posts
ORDER BY hot_score DESC;

-- 创建索引
CREATE INDEX idx_hot_posts_score ON hot_posts(hot_score DESC);

-- 定时刷新（每小时）
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('refresh-hot-posts', '0 * * * *',
  'REFRESH MATERIALIZED VIEW hot_posts'
);
```

#### 选项 2：添加 hot_score 列

```sql
-- 添加预计算的 hot_score 列
ALTER TABLE posts ADD COLUMN hot_score FLOAT;

-- 创建函数计算 hot score
CREATE OR REPLACE FUNCTION calculate_hot_score(
  votes INTEGER,
  created TIMESTAMPTZ
) RETURNS FLOAT AS $$
BEGIN
  RETURN votes / POWER(
    (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created)) / 3600 + 2),
    1.5
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 创建索引
CREATE INDEX idx_posts_hot_score ON posts(hot_score DESC NULLS LAST);

-- 触发器：自动更新 hot_score
CREATE OR REPLACE FUNCTION update_post_hot_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.hot_score = calculate_hot_score(NEW.vote_count, NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_hot_score
  BEFORE INSERT OR UPDATE OF vote_count, created_at ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_post_hot_score();
```

## 验证修复

运行以下 SQL 检查表是否正确创建：

```sql
-- 检查所有表
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 应该看到：
-- comment_votes
-- comments
-- communities
-- community_members
-- post_votes
-- posts
-- profiles

-- 检查索引
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'posts'
ORDER BY indexname;

-- 应该看到：
-- idx_posts_author_id
-- idx_posts_community_id
-- idx_posts_created_at
-- idx_posts_vote_count
-- posts_pkey
```

## 测试

在 Supabase SQL Editor 运行：

```sql
-- 1. 检查 communities 表有数据
SELECT name, slug FROM communities;

-- 2. 如果为空，你可以通过应用程序创建社区
-- 或者手动插入社区数据（可选）

-- 3. 验证数据
SELECT COUNT(*) FROM communities;
```

## FAQ

### Q: 为什么不用 STABLE 或 VOLATILE 函数？

A: PostgreSQL 只允许 IMMUTABLE 函数用于索引表达式。`NOW()` 即使标记为 IMMUTABLE 也会失去其语义（返回固定时间而非当前时间）。

### Q: 客户端排序会不会很慢？

A: 对于前 1000 条帖子的排序，JavaScript 排序耗时 < 1ms。用户体验完全无感知。

### Q: 数据库排序不是更好吗？

A: 理论上是，但：

1. Hot score 需要当前时间，数据库索引无法实现
2. 客户端排序对小数据集很快
3. 可以后续添加物化视图优化

### Q: 生产环境如何优化？

A: 如果帖子量大（> 10,000），使用上面提到的物化视图方案。

## 总结

✅ **问题已解决**

- 移除了使用 `NOW()` 的索引
- 保留了所有必要的索引
- 不影响应用功能
- 性能在可接受范围内

✅ **现在可以继续**：

1. 运行修复后的迁移
2. 部署到 Vercel
3. 开始使用应用

---

**遇到其他问题？** 查看 QUICKSTART.md 或提 Issue！
