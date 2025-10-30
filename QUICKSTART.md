# Quick Start Guide 🚀

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

This is a Reddit-like social platform with the following features:

### Pages
1. **Home Feed** (`/`) - Browse all posts with sorting options
2. **Community** (`/r/[slug]`) - View posts from specific communities
3. **Post Detail** (`/post/[id]`) - Read full post and comments
4. **Submit** (`/submit`) - Create new posts

### Key Features
- ✅ Upvote/downvote posts
- ✅ Sort by Hot, New, Top, Rising
- ✅ Browse communities
- ✅ Create text, link, and image posts
- ✅ View and interact with comments
- ✅ Responsive design
- ✅ Dark mode support

## File Structure

```
app/
├── layout.tsx           # Root layout with header
├── page.tsx             # Home feed
├── submit/page.tsx      # Create post
├── r/[slug]/page.tsx    # Community page
└── post/[id]/page.tsx   # Post detail

components/
├── nav/
│   └── site-header.tsx  # Navigation header
└── post/
    ├── post-card.tsx    # Post display
    └── vote-buttons.tsx # Voting UI

lib/
├── types.ts             # TypeScript types
├── store/
│   └── use-feed.ts      # Zustand store
└── mock/
    └── seed.ts          # Mock data
```

## Mock Data

The project uses mock data defined in `lib/mock/seed.ts`:
- 5 mock users
- 5 mock communities
- 10 mock posts
- 6 mock comments

## State Management

Using Zustand for global state:
- Posts feed
- User votes
- Sort preferences

```typescript
import { useFeed } from '@/lib/store/use-feed';

// In component
const { posts, vote, setSortBy } = useFeed();
```

## Styling

Using Tailwind CSS with custom theme:
- Primary: Orange (500/600)
- Neutrals: Zinc (50-950)
- Dark mode: Automatic via `dark:` prefix

## Development Tips

1. **Adding a new post**: Use the "Create Post" button
2. **Voting**: Click up/down arrows (toggleable)
3. **Sorting**: Use Hot/New/Top/Rising buttons
4. **Communities**: Click on r/[name] links
5. **Post details**: Click on post title

## Next Steps

To extend this project:
1. Add backend API integration
2. Implement user authentication
3. Add real-time updates
4. Implement search
5. Add user profiles
6. Enable comment replies
7. Add markdown support
8. Implement infinite scroll

## Troubleshooting

**Build errors?**
```bash
pnpm build
```

**Type errors?**
```bash
pnpm lint
```

**Port already in use?**
```bash
# Kill process on port 3000
# Windows: netstat -ano | findstr :3000
# Then: taskkill /PID <PID> /F
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://docs.pmnd.rs/zustand)
- [Lucide Icons](https://lucide.dev)

---

Happy coding! 🎉

