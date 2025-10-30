# Reddit Lite 🚀

A modern, feature-rich Reddit clone built with Next.js 16, React 19, TypeScript, and Tailwind CSS. This project demonstrates best practices in modern web development with a focus on frontend architecture.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

## ✨ Features

- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, Reddit-inspired interface with dark mode support
- ⚡ **Fast Performance** - Built with Next.js App Router and React Server Components
- 🔄 **Real-time Voting** - Upvote/downvote posts with instant feedback
- 📝 **Post Creation** - Create text, link, and image posts
- 🏘️ **Communities** - Browse and explore different communities (subreddits)
- 💬 **Comments** - Nested comment threads with voting
- 🔍 **Smart Sorting** - Sort posts by Hot, New, Top, and Rising
- 🎯 **Type-Safe** - Full TypeScript coverage for better DX
- 📦 **State Management** - Zustand for lightweight, efficient state management

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
│   ├── nav/
│   │   └── site-header.tsx     # Main navigation header
│   └── post/
│       ├── post-card.tsx       # Post card component
│       └── vote-buttons.tsx    # Voting UI component
├── lib/
│   ├── types.ts                # TypeScript type definitions
│   ├── store/
│   │   └── use-feed.ts         # Zustand store for feed state
│   └── mock/
│       └── seed.ts             # Mock data for development
└── public/                     # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd reddit-lite
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Key Technologies

### Core Framework

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe development

### Styling

- **Tailwind CSS 4** - Utility-first CSS framework
- **Geist Font** - Modern, clean typography

### State Management

- **Zustand** - Lightweight state management solution

### UI Components

- **Lucide React** - Beautiful, consistent icons
- **date-fns** - Modern date utility library
- **clsx** - Conditional className utility

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

## 🚀 Future Enhancements

- [ ] User authentication
- [ ] Backend API integration
- [ ] Real-time updates with WebSockets
- [ ] Search functionality
- [ ] User profiles
- [ ] Post editing and deletion
- [ ] Comment replies
- [ ] Image upload
- [ ] Markdown support
- [ ] Infinite scroll
- [ ] Notification system

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 👨‍💻 Author

Built with ❤️ using Next.js and React

---

**Note**: This is a frontend-focused demo project using mock data. For production use, integrate with a real backend API and database.
