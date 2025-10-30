'use client';

import { useFeed } from '@/lib/store/use-feed';
import { PostCard } from '@/components/post/post-card';
import { SortOption } from '@/lib/types';
import { Flame, Clock, TrendingUp, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'hot', label: 'Hot', icon: <Flame className="h-4 w-4" /> },
  { value: 'new', label: 'New', icon: <Clock className="h-4 w-4" /> },
  { value: 'top', label: 'Top', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'rising', label: 'Rising', icon: <Sparkles className="h-4 w-4" /> },
];

export default function Home() {
  const { sortBy, setSortBy, getSortedPosts } = useFeed();
  const posts = getSortedPosts();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      {/* Sort Options */}
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value)}
            className={clsx(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              sortBy === option.value
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'
            )}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-zinc-600 dark:text-zinc-400">
              No posts yet. Be the first to create one!
            </p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {/* Sidebar - Popular Communities */}
      <aside className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-lg font-bold">Welcome to Reddit Lite!</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This is a modern Reddit clone built with Next.js, React, TypeScript, and Zustand.
          Explore communities, create posts, vote, and engage with the community!
        </p>
      </aside>
    </div>
  );
}
