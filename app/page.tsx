'use client';

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Flame, Clock, TrendingUp, Sparkles, Loader2, RefreshCcw } from 'lucide-react';
import { useFeed } from '@/lib/store/use-feed';
import { PostCard } from '@/components/post/post-card';
import { SortOption, Database, Post } from '@/lib/types';
import { subscribeToNewPosts, subscribeToPostVotes, unsubscribe } from '@/lib/utils/realtime';

const sortOptions: { value: SortOption; label: string; icon: ReactNode }[] = [
  { value: 'hot', label: 'Hot', icon: <Flame className="h-4 w-4" /> },
  { value: 'new', label: 'New', icon: <Clock className="h-4 w-4" /> },
  { value: 'top', label: 'Top', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'rising', label: 'Rising', icon: <Sparkles className="h-4 w-4" /> },
];

type PostRow = Database['public']['Tables']['posts']['Row'] & {
  author: Database['public']['Tables']['profiles']['Row'];
  community: Database['public']['Tables']['communities']['Row'];
};

const mapPostRow = (row: PostRow): Post => ({
  id: row.id,
  title: row.title,
  content: row.content,
  type: row.type as Post['type'],
  url: row.url || undefined,
  imageUrl: row.image_url || undefined,
  votes: row.vote_count,
  commentCount: row.comment_count,
  createdAt: new Date(row.created_at),
  author: {
    id: row.author.id,
    username: row.author.username,
    avatar: row.author.avatar || undefined,
    karma: row.author.karma,
    bio: row.author.bio || undefined,
    createdAt: new Date(row.author.created_at),
  },
  community: {
    id: row.community.id,
    name: row.community.name,
    slug: row.community.slug,
    description: row.community.description,
    icon: row.community.icon || undefined,
    banner: row.community.banner || undefined,
    members: row.community.member_count,
    creatorId: row.community.creator_id || undefined,
    createdAt: new Date(row.community.created_at),
  },
  isSaved: false,
});

export default function Home() {
  const {
    posts,
    sortBy,
    isLoading,
    error,
    fetchPosts,
    setSortBy,
    addPost,
    setPostVoteCount,
  } = useFeed();

  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const postsRef = useRef<Post[]>(posts);
  const pendingRef = useRef<Post[]>(pendingPosts);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  useEffect(() => {
    pendingRef.current = pendingPosts;
  }, [pendingPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const channel = subscribeToNewPosts((payload) => {
      const newPost = mapPostRow(payload as PostRow);
      const alreadyPresent =
        postsRef.current.some((post) => post.id === newPost.id) ||
        pendingRef.current.some((post) => post.id === newPost.id);

      if (!alreadyPresent) {
        setPendingPosts((current) => [newPost, ...current]);
      }
    });

    return () => {
      unsubscribe(channel);
    };
  }, []);

  useEffect(() => {
    if (posts.length === 0) {
      return;
    }

    const voteChannels = posts.map((post) =>
      subscribeToPostVotes(post.id, (voteCount) => {
        setPostVoteCount(post.id, voteCount);
      })
    );

    return () => {
      voteChannels.forEach((channel) => unsubscribe(channel));
    };
  }, [posts, setPostVoteCount]);

  const handleShowNewPosts = () => {
    if (pendingPosts.length === 0) {
      return;
    }

    [...pendingPosts].reverse().forEach((post) => addPost(post));
    setPendingPosts([]);
  };

  const pendingCount = pendingPosts.length;
  const pendingLabel = useMemo(() => {
    if (pendingCount === 0) return '';
    return pendingCount === 1
      ? '1 new post available'
      : `${pendingCount} new posts available`;
  }, [pendingCount]);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value)}
            disabled={isLoading}
            className={clsx(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
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

      {pendingCount > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-300">
          <span>{pendingLabel}</span>
          <button
            onClick={handleShowNewPosts}
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
          >
            <RefreshCcw className="h-4 w-4" />
            Show now
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading && posts.length === 0 && (
        <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-12 dark:border-zinc-800 dark:bg-zinc-950">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      )}

      {!isLoading && posts.length === 0 && !error && (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-zinc-600 dark:text-zinc-400">
            No posts yet. Be the first to create one!
          </p>
        </div>
      )}

      {posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <aside className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-lg font-bold">Welcome to Reddit Lite!</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This is a modern Reddit clone built with Next.js, React, TypeScript, Supabase, and Zustand.
          Sign in to create posts, vote, and engage with the community!
        </p>
      </aside>
    </div>
  );
}
