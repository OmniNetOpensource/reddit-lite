# Reddit Lite 🚀

A modern, full-stack Reddit clone built with Next.js 16, React 19, TypeScript, Supabase, and Tailwind CSS. This project demonstrates best practices in modern web development with a complete backend integration.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.0-3ECF8E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

## ✨ Features

### Core Features
- 🔐 **Authentication** - Email/password signup and signin with Supabase Auth
- 👤 **User Profiles** - Auto-created profiles with karma tracking and avatars
- 📝 **Post Creation** - Create text, link, and image posts in communities
- 🗳️ **Voting System** - Upvote/downvote posts and comments with optimistic updates
- 💬 **Comments** - Nested comment threads with full CRUD operations
- 🏘️ **Communities** - Browse, join, and post in different communities

### Technical Features
- ⚡ **Fast Performance** - Built with Next.js App Router and React Server Components
- 🔄 **Real-time Updates** - Live updates for new posts and comments using Supabase Realtime
- 🔒 **Row Level Security** - Database-level security with Supabase RLS policies
- 📱 **Responsive Design** - Mobile-first design that works on all devices
- 🎨 **Dark Mode** - System-aware dark mode with Tailwind CSS
- 🔍 **Smart Sorting** - Advanced sorting algorithms (Hot, New, Top, Rising)
- 🎯 **Type-Safe** - Full TypeScript coverage for better DX
- 📦 **State Management** - Zustand for efficient client state management

## 🏗️ Project Structure

```
reddit-lite/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Home page with feed
│   ├── submit/page.tsx         # Create post page
│   ├── r/[slug]/page.tsx       # Community page
│   └── post/[id]/page.tsx      # Post detail page
├── components/
│   ├── auth/                   # Authentication components
│   ├── nav/
│   │   └── site-header.tsx     # Main navigation header
│   └── post/
│       ├── post-card.tsx       # Post card component
│       └── vote-buttons.tsx    # Voting UI component
├── lib/
│   ├── api/                    # Supabase API functions
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # Zustand state management
│   ├── supabase/               # Supabase client setup
│   ├── utils/                  # Utility functions
│   └── types.ts                # TypeScript type definitions
├── supabase/
│   └── migrations/             # Database migrations
└── public/                     # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager
- A Supabase account (free tier works!)

### Quick Setup

1. **Clone the repository:**

```bash
git clone <your-repo-url>
cd reddit-lite
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Setup Supabase:**

- Create a new project at [supabase.com](https://supabase.com)
- Go to SQL Editor and run the migration from `supabase/migrations/001_initial_schema.sql`
- Copy your project URL and anon key from Settings > API

4. **Configure environment variables:**

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. **Run the development server:**

```bash
pnpm dev
```

6. **Open [http://localhost:3000](http://localhost:3000)**

For detailed setup instructions, see [QUICKSTART.md](QUICKSTART.md)

## 🎯 Key Technologies

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Zustand** - Lightweight state management

### Backend

- **Supabase** - PostgreSQL database, auth, and real-time
- **Row Level Security** - Database-level authorization
- **PostgreSQL** - Robust relational database
- **Supabase Auth** - User authentication and management
- **Supabase Realtime** - Live database changes
- **Supabase Storage** - File storage for images

### Libraries

- **Lucide React** - Beautiful, consistent icons
- **date-fns** - Modern date utility library
- **clsx** - Conditional className utility
- **@supabase/ssr** - Supabase for Next.js App Router

## 📖 Features in Detail

### Home Feed

- View all posts from all communities
- Sort by Hot, New, Top, or Rising
- Real-time vote counts
- Quick navigation to communities

### Communities (Subreddits)

- Browse posts by community
- View community stats (members, creation date)
- Community description and rules
- Create posts within communities

### Post Creation

- Three post types: Text, Link, Image
- Community selection
- Character count for titles
- Rich text content

### Post Details

- Full post content view
- Nested comment threads
- Vote on posts and comments
- Share and save functionality

### Voting System

- Upvote/downvote posts
- Visual feedback for user votes
- Smart vote counting (toggle votes)
- Formatted vote display (1.2k, 5.6M)

### Sorting Algorithms

- **Hot**: Balances votes and recency
- **New**: Chronological order
- **Top**: Highest voted posts
- **Rising**: Recent posts gaining traction

## 🎨 Design Principles

- **Clean & Minimal** - Focus on content, not clutter
- **Familiar UX** - Reddit-inspired interface users know
- **Responsive First** - Mobile-friendly from the ground up
- **Dark Mode Ready** - Automatic theme switching
- **Accessible** - Semantic HTML and ARIA labels

## 🔧 Development

### Available Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

### Code Style

- ESLint for code quality
- TypeScript strict mode
- Component-based architecture
- Client/Server component separation

## 🚀 Implemented Features

- [x] User authentication (email/password)
- [x] Backend API integration (Supabase)
- [x] Real-time updates (Supabase Realtime)
- [x] User profiles with karma
- [x] Post creation, editing, and deletion
- [x] Comment threads with voting
- [x] Community memberships
- [x] Vote tracking and optimization
- [x] Row Level Security (RLS)
- [x] Protected routes and middleware

## 🔜 Future Enhancements

- [ ] Search functionality (posts, users, communities)
- [ ] User profile pages with post history
- [ ] Direct image file uploads
- [ ] Markdown support for posts and comments
- [ ] Infinite scroll pagination
- [ ] Push notification system
- [ ] Email notifications
- [ ] User settings and preferences
- [ ] Moderation tools
- [ ] Report system

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 👨‍💻 Author

Built with ❤️ using Next.js and React

---

## 🏗️ Architecture

### Database Schema

- **profiles** - User profiles extending Supabase Auth
- **communities** - Reddit-like communities/subreddits
- **posts** - User-created content with vote tracking
- **comments** - Nested comments with vote tracking
- **post_votes** - User votes on posts
- **comment_votes** - User votes on comments
- **community_members** - Community membership tracking

### Authentication Flow

1. User signs up/signs in via Supabase Auth
2. Profile automatically created via database trigger
3. Session managed by middleware and cookies
4. Protected routes check authentication status

### Real-time Updates

- New posts appear instantly in feeds
- Comment counts update in real-time
- Vote counts sync across clients
- Optimistic UI updates for instant feedback

## 📚 Learn More

- **Supabase Setup** - See [QUICKSTART.md](QUICKSTART.md) for detailed setup
- **Database Schema** - Check `supabase/migrations/001_initial_schema.sql`
- **API Layer** - Explore `lib/api/` for all API calls
- **Auth Hook** - Review `lib/hooks/use-auth.ts` for auth implementation

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

**Built with** ❤️ **using Next.js, React, TypeScript, and Supabase**
