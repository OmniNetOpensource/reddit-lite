'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, MessageSquare } from 'lucide-react';
import { Comment, Database, Post } from '@/lib/types';
import { useFeed } from '@/lib/store/use-feed';
import { getPostById } from '@/lib/api/posts';
import { isPostSaved } from '@/lib/api/saved-posts';
import { useComments } from '@/lib/store/use-comments';
import { CommentForm } from '@/components/post/comment-form';
import { CommentCard } from '@/components/post/comment-card';
import { VoteButtons } from '@/components/post/vote-buttons';
import { SaveButton } from '@/components/post/save-button';
import { ShareButton } from '@/components/post/share-button';
import { PostActionsMenu } from '@/components/post/post-actions-menu';
import {
  subscribeToCommentCount,
  subscribeToNewComments,
  subscribeToPostVotes,
  unsubscribe,
} from '@/lib/utils/realtime';

type CommentRow = Database['public']['Tables']['comments']['Row'] & {
  author: Database['public']['Tables']['profiles']['Row'];
};

const toComment = (row: CommentRow): Comment => ({
  id: row.id,
  content: row.content,
  postId: row.post_id,
  parentId: row.parent_id || undefined,
  votes: row.vote_count,
  createdAt: new Date(row.created_at),
  author: {
    id: row.author.id,
    username: row.author.username,
    avatar: row.author.avatar || undefined,
    karma: row.author.karma,
    bio: row.author.bio || undefined,
    createdAt: new Date(row.author.created_at),
  },
  replies: [],
});

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = params?.id;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [postError, setPostError] = useState('');
  const [replyTarget, setReplyTarget] = useState<string | null>(null);

  const setPostSavedState = useFeed((state) => state.setPostSavedState);
  const comments = useComments((state) => state.comments);
  const commentsLoading = useComments((state) => state.isLoading);
  const commentsError = useComments((state) => state.error);
  const fetchComments = useComments((state) => state.fetchComments);
  const addComment = useComments((state) => state.addComment);
  const resetComments = useComments((state) => state.reset);

  useEffect(() => {
    if (!postId) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoadingPost(true);
      setPostError('');
      try {
        const [postResponse, saved] = await Promise.all([
          getPostById(postId),
          isPostSaved(postId),
        ]);

        if (!postResponse) {
          router.replace('/404');
          return;
        }

        if (!cancelled) {
          setPost({
            ...postResponse,
            isSaved: saved,
          });
        }

        await fetchComments(postId);
      } catch (error) {
        console.error('Error loading post:', error);
        if (!cancelled) {
          setPostError((error as Error).message || 'Failed to load post');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPost(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
      resetComments();
    };
  }, [fetchComments, postId, resetComments, router]);

  useEffect(() => {
    if (!post) {
      return;
    }

    const commentChannel = subscribeToNewComments(post.id, (row) => {
      addComment(toComment(row as CommentRow));
    });
    const voteChannel = subscribeToPostVotes(post.id, (voteCount) => {
      setPost((current) =>
        current ? { ...current, votes: voteCount } : current
      );
    });
    const commentCountChannel = subscribeToCommentCount(post.id, (count) => {
      setPost((current) =>
        current ? { ...current, commentCount: count } : current
      );
    });

    return () => {
      unsubscribe(commentChannel);
      unsubscribe(voteChannel);
      unsubscribe(commentCountChannel);
    };
  }, [post, addComment]);

  const handleSavedChange = useCallback(
    (saved: boolean) => {
      setPost((current) => (current ? { ...current, isSaved: saved } : current));
      if (postId) {
        setPostSavedState(postId, saved);
      }
    },
    [postId, setPostSavedState]
  );

  const handleReply = useCallback((comment: Comment) => {
    setReplyTarget((current) => (current === comment.id ? null : comment.id));
  }, []);

  const renderReplyForm = useCallback(
    (comment: Comment) => {
      if (!postId || replyTarget !== comment.id) {
        return null;
      }

      return (
        <div className="pl-8">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onCancel={() => setReplyTarget(null)}
            onSuccess={() => setReplyTarget(null)}
          />
        </div>
      );
    },
    [postId, replyTarget]
  );

  const content = useMemo(() => {
    if (isLoadingPost) {
      return (
        <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-10 dark:border-zinc-800 dark:bg-zinc-950">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      );
    }

    if (postError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {postError}
        </div>
      );
    }

    if (!post) {
      return null;
    }

    return (
      <>
        <article className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <Link
                href={`/r/${post.community.slug}`}
                className="flex items-center gap-1 font-semibold hover:underline"
              >
                <span>{post.community.icon}</span>
                <span>r/{post.community.slug}</span>
              </Link>
              <span>•</span>
              <span>Posted by</span>
              <Link
                href={`/u/${post.author.username}`}
                className="hover:underline"
              >
                u/{post.author.username}
              </Link>
              <span>•</span>
              <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
            </div>
            <PostActionsMenu
              post={post}
              onDeleted={() => router.push(`/r/${post.community.slug}`)}
            />
          </div>

          <div className="space-y-4 p-4">
            <h1 className="text-2xl font-bold leading-tight dark:text-zinc-100">
              {post.title}
            </h1>

            {post.type === 'text' && post.content && (
              <div className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                {post.content}
              </div>
            )}

            {post.type === 'link' && post.url && (
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-orange-500 hover:underline"
              >
                {post.url}
              </a>
            )}

            {post.type === 'image' && post.imageUrl && (
              <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  width={900}
                  height={600}
                  className="h-auto w-full"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
            <VoteButtons postId={post.id} votes={post.votes} layout="horizontal" />
            <button className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900">
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentCount} Comments</span>
            </button>
            <ShareButton post={post} />
            <SaveButton
              postId={post.id}
              initialIsSaved={post.isSaved ?? false}
              onChange={handleSavedChange}
            />
          </div>
        </article>

        <div className="space-y-4">
          <CommentForm postId={post.id} />

          <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Comments ({post.commentCount})
              </h2>
              {commentsLoading && (
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
              )}
            </div>

            {commentsError && (
              <p className="mt-3 text-sm text-red-500 dark:text-red-400">
                {commentsError}
              </p>
            )}

            {!commentsLoading && comments.length === 0 && !commentsError && (
              <p className="py-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
                No comments yet. Be the first to comment!
              </p>
            )}

            <div className="mt-4 space-y-6">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  renderReplyForm={renderReplyForm}
                />
              ))}
            </div>
          </section>
        </div>
      </>
    );
  }, [
    comments,
    commentsError,
    commentsLoading,
    handleReply,
    handleSavedChange,
    isLoadingPost,
    post,
    postError,
    renderReplyForm,
    router,
  ]);

  if (!postId) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">{content}</div>

        <aside className="space-y-4">
          {post && (
            <>
              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <Link
                  href={`/r/${post.community.slug}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <span className="text-2xl">{post.community.icon}</span>
                  <div>
                    <h3 className="font-bold">r/{post.community.slug}</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {post.community.members.toLocaleString()} members
                    </p>
                  </div>
                </Link>
                <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
                  {post.community.description}
                </p>
                <Link
                  href={`/r/${post.community.slug}`}
                  className="mt-4 flex w-full items-center justify-center rounded-full border border-orange-500 py-2 text-sm font-medium text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950"
                >
                  View Community
                </Link>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <h3 className="mb-3 text-sm font-bold">About Author</h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 text-2xl dark:bg-zinc-800">
                    {post.author.avatar || post.author.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Link
                      href={`/u/${post.author.username}`}
                      className="font-semibold hover:underline"
                    >
                      u/{post.author.username}
                    </Link>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {post.author.karma.toLocaleString()} karma
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

