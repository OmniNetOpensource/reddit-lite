'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PostCard } from '@/components/post/post-card';
import { getCommunityBySlug, getPostsByCommunity } from '@/lib/mock/seed';
import { Users, Calendar, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunityPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CommunityPage(props: CommunityPageProps) {
  const params = use(props.params);
  const { slug } = params;
  const community = getCommunityBySlug(slug);
  const posts = getPostsByCommunity(slug);

  if (!community) {
    notFound();
  }

  const formatMembers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen">
      {/* Community Header */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-orange-400 to-orange-600" />
        
        {/* Community Info */}
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex items-start gap-4 -mt-8">
            {/* Icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white text-4xl dark:border-zinc-950 dark:bg-zinc-950">
              {community.icon}
            </div>

            {/* Details */}
            <div className="flex-1 pt-2">
              <h1 className="text-2xl font-bold">r/{community.slug}</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {community.name}
              </p>
            </div>

            {/* Join Button */}
            <Link
              href="/submit"
              className="mt-2 flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              Create Post
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 py-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-500" />
              <span className="font-bold">{formatMembers(community.members)}</span>
              <span className="text-zinc-600 dark:text-zinc-400">members</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <span className="text-zinc-600 dark:text-zinc-400">
                Created {formatDistanceToNow(community.createdAt, { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-5xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Posts */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    No posts in this community yet. Be the first to post!
                  </p>
                  <Link
                    href="/submit"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2 text-sm font-medium text-white hover:bg-orange-600"
                  >
                    <Plus className="h-4 w-4" />
                    Create Post
                  </Link>
                </div>
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* About Community */}
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-3 text-sm font-bold">About Community</h2>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {community.description}
              </p>
              
              <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Members</span>
                  <span className="font-bold">{formatMembers(community.members)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Posts</span>
                  <span className="font-bold">{posts.length}</span>
                </div>
              </div>

              <Link
                href="/submit"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" />
                Create Post
              </Link>
            </div>

            {/* Rules */}
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-3 text-sm font-bold">Community Rules</h2>
              <ol className="space-y-2 text-sm">
                <li className="text-zinc-700 dark:text-zinc-300">
                  1. Be respectful and civil
                </li>
                <li className="text-zinc-700 dark:text-zinc-300">
                  2. No spam or self-promotion
                </li>
                <li className="text-zinc-700 dark:text-zinc-300">
                  3. Stay on topic
                </li>
                <li className="text-zinc-700 dark:text-zinc-300">
                  4. No harassment or hate speech
                </li>
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
