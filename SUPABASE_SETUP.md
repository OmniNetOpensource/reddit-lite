# Supabase Backend Setup Guide

## Overview

This document explains the Supabase backend integration for Reddit Lite. The application now uses Supabase for authentication, database, real-time updates, and file storage.

## What Was Implemented

### 1. Supabase Configuration

**Files Created:**
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server Supabase client (with cookies)
- `lib/supabase/middleware.ts` - Session refresh middleware
- `middleware.ts` - Next.js middleware for auth

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

### 2. Database Schema

**Location:** `supabase/migrations/001_initial_schema.sql`

**Tables:**
- `profiles` - User profiles (extends auth.users)
- `communities` - Reddit-like communities/subreddits
- `posts` - User-created posts with vote tracking
- `comments` - Nested comment system
- `post_votes` - User votes on posts
- `comment_votes` - User votes on comments
- `community_members` - Community membership tracking

**Features:**
- ✅ UUID primary keys
- ✅ Foreign key constraints with CASCADE deletes
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Database triggers for auto-updates
- ✅ Functions for vote counting

### 3. Authentication System

**Files:**
- `lib/hooks/use-auth.ts` - Auth state hook
- `components/auth/auth-button.tsx` - Auth UI in header
- `components/auth/sign-in-modal.tsx` - Sign in form
- `components/auth/sign-up-modal.tsx` - Sign up form
- `components/auth/user-menu.tsx` - User dropdown

**Features:**
- Email/password authentication
- Auto-profile creation on signup
- Session management with cookies
- Protected routes (/submit requires auth)

### 4. API Layer

**Files:**
- `lib/api/posts.ts` - Post CRUD operations
- `lib/api/comments.ts` - Comment operations
- `lib/api/communities.ts` - Community operations
- `lib/api/users.ts` - User profile operations

**Functions:**
- `getPosts()` - Fetch posts with sorting
- `getPostById()` - Get single post with details
- `createPost()` - Create new post
- `votePost()` - Vote on post
- `getCommentsByPostId()` - Fetch nested comments
- `createComment()` - Add comment
- `getCommunities()` - List all communities
- `joinCommunity()` - Join a community
- `getCurrentUser()` - Get logged-in user profile

### 5. State Management

**Refactored Stores:**
- `lib/store/use-feed.ts` - Now uses Supabase APIs
- `lib/store/use-comments.ts` - Comment state management

**Features:**
- Async data fetching from Supabase
- Optimistic updates for votes
- Loading and error states
- User vote tracking

### 6. Real-time Features

**File:** `lib/utils/realtime.ts`

**Functions:**
- `subscribeToNewPosts()` - Live post updates
- `subscribeToPostVotes()` - Live vote counts
- `subscribeToNewComments()` - Live comments
- `subscribeToCommentCount()` - Live comment counts

### 7. File Storage

**File:** `lib/utils/upload.ts`

**Functions:**
- `uploadImage()` - Upload images to Supabase Storage
- `deleteImage()` - Delete images
- `createImageBucket()` - Setup storage bucket

**Bucket:** `post-images`
- Public access
- 5MB file size limit
- Supports: PNG, JPEG, GIF, WebP

### 8. Updated Pages

**Modified:**
- `app/page.tsx` - Now fetches posts from Supabase
- `app/submit/page.tsx` - Auth-protected, creates posts in DB
- `components/nav/site-header.tsx` - Auth button integration
- `components/post/vote-buttons.tsx` - Async voting with auth

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for provisioning (~2 minutes)

### Step 2: Run Database Migration

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Click "New Query"
4. Copy contents of `supabase/migrations/001_initial_schema.sql`
5. Paste and click "Run"
6. Verify tables are created in Table Editor

### Step 3: Configure Authentication

1. Go to Authentication > Settings
2. **Important:** Disable "Confirm Email" for testing
   - Set to "Enabled" for production
3. Configure email templates if needed

### Step 4: Environment Variables

1. Go to Settings > API
2. Copy:
   - **Project URL**
   - **anon/public key** (NOT service_role key!)
3. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### Step 5: Install Dependencies & Run

```bash
pnpm install
pnpm dev
```

### Step 6: Test the Application

1. **Sign Up:**
   - Click "Sign In" in header
   - Switch to "Sign Up"
   - Create an account
   - Profile auto-created!

2. **Create Post:**
   - Click "Create Post"
   - Select community
   - Add title and content
   - Submit

3. **Vote:**
   - Click up/down arrows
   - Watch optimistic updates
   - Check vote count changes

4. **Real-time:**
   - Open two browser windows
   - Create post in one
   - See it appear in other

## Database Security (RLS)

### How It Works

Row Level Security ensures users can only:
- View public posts/comments
- Create their own content
- Update/delete only their content
- Vote only once per post/comment

### Example Policies

**Posts:**
```sql
-- Anyone can read
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT USING (true);

-- Authenticated users can create
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

-- Users can update own posts
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);
```

## Troubleshooting

### Authentication Issues

**Problem:** Can't sign up
**Solution:**
1. Check Supabase Auth is enabled
2. Disable "Confirm Email" in settings
3. Check browser console for errors
4. Verify `.env.local` variables

**Problem:** Profile not created
**Solution:**
1. Check `handle_new_user()` trigger exists
2. Run migration again if needed
3. Check Supabase logs for errors

### Database Issues

**Problem:** Posts not showing
**Solution:**
1. Verify migration ran successfully
2. Create communities through the application or manually add data
3. Check RLS policies are enabled

**Problem:** Can't create posts
**Solution:**
1. Ensure user is signed in
2. Check RLS policies allow INSERT
3. Verify foreign key constraints
4. Check Supabase logs

### Performance Issues

**Problem:** Slow queries
**Solution:**
1. Check indexes are created
2. Use SQL Editor to run EXPLAIN
3. Add more indexes if needed
4. Check Supabase query performance tab

## Next Steps

1. **Custom Avatars:** Integrate file upload for user avatars
2. **Email Confirmations:** Enable email verification
3. **OAuth:** Add Google/GitHub login
4. **Moderation:** Add admin roles and tools
5. **Analytics:** Track user engagement
6. **Caching:** Add Redis for hot posts
7. **CDN:** Use Cloudflare for images

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## Support

If you encounter issues:
1. Check Supabase Dashboard > Logs
2. Check browser console
3. Review RLS policies
4. Check authentication status
5. Verify environment variables

---

**Happy Building!** 🚀

