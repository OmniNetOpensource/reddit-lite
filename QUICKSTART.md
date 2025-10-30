# Quick Start Guide 🚀

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- A Supabase account (free tier works great!)

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be provisioned (~2 minutes)

### 2. Run Database Migration

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL migration
4. This will create all necessary tables, indexes, RLS policies, and functions

### 3. Configure Environment Variables

1. In your Supabase project, go to **Settings** > **API**
2. Copy your **Project URL** and **anon/public key**
3. Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Installation & Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser
# Navigate to http://localhost:3000
```

## Project Overview

This is a full-stack Reddit-like social platform with Supabase backend:

### Pages
1. **Home Feed** (`/`) - Browse all posts with sorting options
2. **Community** (`/r/[slug]`) - View posts from specific communities
3. **Post Detail** (`/post/[id]`) - Read full post and comments
4. **Submit** (`/submit`) - Create new posts (requires authentication)

### Key Features
- ✅ **Authentication** - Email/password sign up and sign in
- ✅ **User Profiles** - Auto-created profiles with karma tracking
- ✅ **Posts** - Create text, link, and image posts
- ✅ **Voting** - Upvote/downvote with optimistic updates
- ✅ **Comments** - Nested comment threads
- ✅ **Communities** - Browse and join communities
- ✅ **Real-time** - Live updates for new posts and comments
- ✅ **Sorting** - Hot, New, Top, Rising algorithms
- ✅ **Responsive** - Mobile-first design
- ✅ **Dark Mode** - System-aware theme

## File Structure

```
app/
├── layout.tsx              # Root layout with header
├── page.tsx                # Home feed
├── submit/page.tsx         # Create post (auth required)
├── r/[slug]/page.tsx       # Community page
└── post/[id]/page.tsx      # Post detail

components/
├── auth/
│   ├── auth-button.tsx     # Auth UI in header
│   ├── sign-in-modal.tsx   # Sign in form
│   ├── sign-up-modal.tsx   # Sign up form
│   └── user-menu.tsx       # User dropdown menu
├── nav/
│   └── site-header.tsx     # Navigation header
└── post/
    ├── post-card.tsx       # Post display
    └── vote-buttons.tsx    # Voting UI

lib/
├── api/
│   ├── posts.ts            # Post API calls
│   ├── comments.ts         # Comment API calls
│   ├── communities.ts      # Community API calls
│   └── users.ts            # User API calls
├── hooks/
│   └── use-auth.ts         # Auth hook
├── store/
│   ├── use-feed.ts         # Feed state
│   └── use-comments.ts     # Comments state
├── supabase/
│   ├── client.ts           # Browser Supabase client
│   ├── server.ts           # Server Supabase client
│   └── middleware.ts       # Auth middleware
├── utils/
│   ├── realtime.ts         # Real-time subscriptions
│   └── upload.ts           # Image upload helpers
└── types.ts                # TypeScript types

supabase/
└── migrations/
    └── 001_initial_schema.sql  # Database schema
```

## Database Schema

Tables created by the migration:
- `profiles` - User profiles (extends auth.users)
- `communities` - Subreddits
- `posts` - User posts
- `comments` - Post comments (with nesting)
- `post_votes` - User votes on posts
- `comment_votes` - User votes on comments
- `community_members` - Community subscriptions

## State Management

Using Zustand for client state:
- **useFeed** - Posts, votes, sorting
- **useComments** - Comments, nested replies
- **useAuth** - Authentication state

```typescript
import { useFeed } from '@/lib/store/use-feed';
import { useAuth } from '@/lib/hooks/use-auth';

// In component
const { posts, fetchPosts, vote } = useFeed();
const { user, signIn, signOut } = useAuth();
```

## Styling

Using Tailwind CSS with custom theme:
- Primary: Orange (500/600)
- Neutrals: Zinc (50-950)
- Dark mode: Automatic via `dark:` prefix

## First Time Setup

### Create Your First Account

1. Click "Sign In" in the header
2. Switch to "Sign Up"
3. Enter email, username (3-20 chars), and password (6+ chars)
4. Your profile is auto-created!

### Join Communities

1. Browse the popular communities in the header
2. Visit a community page
3. Click "Join" to become a member

### Create Your First Post

1. Click "Create Post" (requires sign in)
2. Choose a community
3. Select post type (Text, Link, or Image)
4. Add title and content
5. Click "Post"

## Development Tips

1. **Voting**: Sign in required, optimistic updates
2. **Real-time**: New posts/comments appear automatically
3. **Sorting**: Hot/New/Top/Rising algorithms
4. **Protected Routes**: `/submit` requires authentication
5. **RLS**: Database enforces row-level security

## Common Tasks

### Add a New Community

Create communities through the application UI, or run SQL in Supabase SQL Editor:

```sql
INSERT INTO communities (name, slug, description, icon)
VALUES ('YourCommunity', 'yourcommunity', 'Description here', '🎯');
```

### Check User Data

```sql
SELECT * FROM profiles WHERE username = 'your_username';
```

### Reset Votes

```sql
DELETE FROM post_votes WHERE user_id = 'your-user-id';
```

## Next Steps

To further extend this project:
1. ✅ Backend API - Done!
2. ✅ Authentication - Done!
3. ✅ Real-time updates - Done!
4. 🔜 Search functionality
5. 🔜 User profile pages
6. 🔜 Comment replies UI
7. 🔜 Markdown support
8. 🔜 Infinite scroll
9. 🔜 Image uploads (direct file upload)

## Troubleshooting

### Can't connect to Supabase?

1. Check `.env.local` exists with correct values
2. Verify project URL and anon key from Supabase dashboard
3. Ensure migration was run successfully

### Sign up not working?

1. Check Supabase Auth settings (confirm email may be disabled)
2. Verify the `handle_new_user()` trigger is working
3. Check browser console for errors

### Posts not showing?

1. Make sure communities exist in the database
2. Check RLS policies are enabled
3. Run: `SELECT * FROM posts;` in SQL Editor

### Build errors?

```bash
# Clean install
rm -rf node_modules .next
pnpm install
pnpm build
```

### Type errors?

```bash
pnpm lint
```

### Port already in use?

```bash
# Kill process on port 3000
# Windows: netstat -ano | findstr :3000
# Then: taskkill /PID <PID> /F

# Mac/Linux: lsof -ti:3000 | xargs kill
```

### Database issues?

1. Go to Supabase Dashboard > Table Editor
2. Check if tables exist
3. Re-run migration if needed
4. Check RLS policies are enabled

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://docs.pmnd.rs/zustand)
- [Lucide Icons](https://lucide.dev)

## Support

- Check the [GitHub Issues](../../issues)
- Review Supabase logs in dashboard
- Check browser console for client errors

---

Happy coding! 🎉

