-- Migration 002: Saved posts support & post image storage bucket
-- ============================================================================

-- Saved posts table ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_posts (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- Indexes to speed up saved post lookups
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON saved_posts(post_id);

-- Enable RLS and restrict access to a user's own saved posts
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their saved posts" ON saved_posts;
CREATE POLICY "Users can view their saved posts"
  ON saved_posts
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save posts for themselves" ON saved_posts;
CREATE POLICY "Users can save posts for themselves"
  ON saved_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their saved posts" ON saved_posts;
CREATE POLICY "Users can remove their saved posts"
  ON saved_posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Post images storage bucket --------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Ensure existing objects in the bucket respect RLS
UPDATE storage.buckets
SET public = TRUE
WHERE id = 'post-images';

-- Storage policies for post images
DROP POLICY IF EXISTS "Public read access to post images" ON storage.objects;
CREATE POLICY "Public read access to post images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'post-images');

DROP POLICY IF EXISTS "Authenticated users can upload post images" ON storage.objects;
CREATE POLICY "Authenticated users can upload post images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images'
    AND auth.role() = 'authenticated'
    AND COALESCE(metadata->>'mimetype', '') LIKE 'image/%'
  );

DROP POLICY IF EXISTS "Authenticated users can update post images" ON storage.objects;
CREATE POLICY "Authenticated users can update post images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'post-images'
    AND auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'post-images'
    AND auth.role() = 'authenticated'
    AND COALESCE(metadata->>'mimetype', '') LIKE 'image/%'
  );

DROP POLICY IF EXISTS "Authenticated users can delete post images" ON storage.objects;
CREATE POLICY "Authenticated users can delete post images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'post-images'
    AND auth.role() = 'authenticated'
  );
