'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Calendar, Plus, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Community } from '@/lib/types';
import { getCommunityBySlug } from '@/lib/api/communities';
import { useFeed } from '@/lib/store/use-feed';
import { PostCard } from '@/components/post/post-card';
import { JoinButton } from '@/components/community/join-button';
import { isMemberOfCommunity } from '@/lib/api/communities';

export default function CommunityPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug;

  const [community, setCommunity] = useState<Community | null>(null);
  const [communityError, setCommunityError] = useState('');
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [isMember, setIsMember] = useState(false);

  const { posts, isLoading, error, fetchPosts } = useFeed();

  useEffect(() => {
    if (!slug) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoadingCommunity(true);
      setCommunityError('');
      try {
        const communityData = await getCommunityBySlug(slug);
        if (!communityData) {
          router.replace('/404');
          return;
        }

        if (!cancelled) {
          setCommunity(communityData);
        }

        const member = await isMemberOfCommunity(communityData.id);
        if (!cancelled) {
          setIsMember(member);
        }

        await fetchPosts(slug);
      } catch (err) {
        console.error('Error loading community:', err);
        if (!cancelled) {
          setCommunityError((err as Error).message || 'Failed to load community');
        }
      } finally {
        if (!cancelled) {
          setLoadingCommunity(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fetchPosts, router, slug]);

  const formattedMembers = useMemo(() => {
    if (!community) {
      return '0';
    }

    const count = community.members;
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1)}M`;
    }
    if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1)}K`;
    }
    return count.toString();
  }, [community]);

  const handleMembershipChange = (joined: boolean) => {
    setIsMember(joined);
    setCommunity((current) =>
      current
        ? {
            ...current,
            members: Math.max(
              0,
              current.members + (joined ? 1 : -1)
            ),
          }
        : current
    );
  };

  if (!slug) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="h-24 bg-gradient-to-r from-orange-400 to-orange-600" />
        <div className="container mx-auto max-w-5xl px-4">
          <div className="-mt-8 flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white text-4xl dark:border-zinc-950 dark:bg-zinc-950">
                {community?.icon ?? '🧩'}
              </div>
              <div>
                <h1 className="text-2xl font-bold">r/{community?.slug}</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {community?.name}
                </p>
              </div>
            </div>

            {community && (
              <JoinButton
                communityId={community.id}
                initialIsMember={isMember}
                onChange={handleMembershipChange}
              />
            )}
          </div>

          {community && (
            <div className="flex flex-wrap items-center gap-6 border-t border-zinc-200 py-4 text-sm dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-zinc-500" />
                <span className="font-bold">{formattedMembers}</span>
                <span className="text-zinc-600 dark:text-zinc-400">members</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <span className="text-zinc-600 dark:text-zinc-400">
                  Created{' '}
                  {formatDistanceToNow(community.createdAt, { addSuffix: true })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-6">
        {loadingCommunity && (
          <div className="mb-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        )}

        {communityError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {communityError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {isLoading && posts.length === 0 && (
              <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              </div>
            )}

            {!isLoading && posts.length === 0 && !error && (
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
            )}

            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {community && (
            <aside className="space-y-4">
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="mb-3 text-sm font-bold">About Community</h2>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {community.description}
                </p>
                <Link
                  href="/submit"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                  Create Post
                </Link>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
