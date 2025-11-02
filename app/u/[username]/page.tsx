'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import {
  getUserByUsername,
  getUserStats,
  getUserPosts,
  getUserComments,
} from '@/lib/api/users';
import { getSavedPostStatuses } from '@/lib/api/saved-posts';
import { Post, User, CommentWithPostContext } from '@/lib/types';
import { PostCard } from '@/components/post/post-card';
import { CommentWithContext } from '@/components/user/comment-with-context';

type TabKey = 'overview' | 'posts' | 'comments';

export default function UserProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const username = params?.username;

  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<{ postCount: number; commentCount: number; karma: number } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<CommentWithPostContext[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handlePostDeleted = (postId: string) => {
    setPosts((current) => current.filter((post) => post.id !== postId));
    setStats((current) =>
      current
        ? {
            ...current,
            postCount: Math.max(0, current.postCount - 1),
          }
        : current
    );
  };

  useEffect(() => {
    if (!username) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const userProfile = await getUserByUsername(username);
        if (!userProfile) {
          router.replace('/404');
          return;
        }

        const [userStats, userPosts, userComments] = await Promise.all([
          getUserStats(userProfile.id),
          getUserPosts(userProfile.id),
          getUserComments(userProfile.id),
        ]);

        let savedStatuses: Record<string, boolean> = {};
        if (userPosts.length > 0) {
          try {
            savedStatuses = await getSavedPostStatuses(userPosts.map((post) => post.id));
          } catch (savedError) {
            console.error('Failed to fetch saved statuses for user posts:', savedError);
          }
        }

        if (!cancelled) {
          setProfile(userProfile);
          setStats(userStats);
          setPosts(
            userPosts.map((post) => ({
              ...post,
              isSaved: savedStatuses[post.id] ?? false,
            }))
          );
          setComments(userComments);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
        if (!cancelled) {
          setError((err as Error).message || 'Failed to load user profile');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [router, username]);

  const overviewPosts = useMemo(() => posts.slice(0, 3), [posts]);
  const overviewComments = useMemo(() => comments.slice(0, 3), [comments]);

  if (!username) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto flex max-w-4xl items-center justify-center px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !profile || !stats) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error || 'User not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-3xl font-bold uppercase text-white">
              {profile.avatar
                ? profile.avatar.charAt(0).toUpperCase()
                : profile.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">u/{profile.username}</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Joined {format(profile.createdAt, 'MMMM d, yyyy')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-center text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <p className="text-xs uppercase text-zinc-500">Karma</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {stats.karma.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-500">Posts</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {stats.postCount}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-500">Comments</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {stats.commentCount}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div className="flex gap-2">
            {([
              { key: 'overview', label: 'Overview' },
              { key: 'posts', label: 'Posts' },
              { key: 'comments', label: 'Comments' },
            ] satisfies { key: TabKey; label: string }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {activeTab === 'overview' && (
          <>
            <section>
              <h2 className="mb-3 text-lg font-semibold">Recent posts</h2>
              {overviewPosts.length === 0 ? (
                <p className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                  No posts yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {overviewPosts.map((post) => (
                    <PostCard key={post.id} post={post} onDeleted={handlePostDeleted} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold">Recent comments</h2>
              {overviewComments.length === 0 ? (
                <p className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                  No comments yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {overviewComments.map((comment) => (
                    <CommentWithContext key={comment.id} comment={comment} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'posts' && (
          <section className="space-y-3">
            {posts.length === 0 ? (
              <p className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                This user hasn&apos;t created any posts yet.
              </p>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} onDeleted={handlePostDeleted} />)
            )}
          </section>
        )}

        {activeTab === 'comments' && (
          <section className="space-y-3">
            {comments.length === 0 ? (
              <p className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                This user hasn&apos;t commented yet.
              </p>
            ) : (
              comments.map((comment) => (
                <CommentWithContext key={comment.id} comment={comment} />
              ))
            )}
          </section>
        )}
      </div>
    </div>
  );
}
