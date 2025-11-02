'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowDown,
  ArrowUp,
  CornerUpRight,
  Edit3,
  Loader2,
  Share2,
  Trash2,
} from 'lucide-react';
import clsx from 'clsx';
import { Comment } from '@/lib/types';
import { useAuth } from '@/lib/hooks/use-auth';
import { useComments } from '@/lib/store/use-comments';
import { deleteComment, updateComment } from '@/lib/api/comments';

interface CommentCardProps {
  comment: Comment;
  depth?: number;
  onReply?: (comment: Comment) => void;
  renderReplyForm?: (comment: Comment) => ReactNode;
}

export function CommentCard({
  comment,
  depth = 0,
  onReply,
  renderReplyForm,
}: CommentCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { votes, vote, updateCommentInState, removeComment } = useComments();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const userVote = votes[comment.id];
  const canModify = user?.id === comment.author.id;

  const handleVote = async (direction: 'up' | 'down') => {
    if (!isAuthenticated) {
      alert('Please sign in to vote on comments');
      return;
    }

    try {
      await vote(comment.id, direction);
    } catch (err) {
      console.error('Failed to vote on comment:', err);
      setError((err as Error).message || 'Failed to vote on comment');
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const updated = await updateComment(comment.id, { content: editContent.trim() });
      updateCommentInState(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update comment:', err);
      setError((err as Error).message || 'Failed to update comment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canModify) return;

    const confirmed = window.confirm('Delete this comment? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      await deleteComment(comment.id);
      removeComment(comment.id);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError((err as Error).message || 'Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = `${window.location.origin}/post/${comment.postId}?comment=${comment.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: `Comment by u/${comment.author.username}`,
          url,
        })
        .catch(() => {});
      return;
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          // Optional feedback could go here
        })
        .catch(() => alert('Copy to clipboard failed'));
      return;
    }

    prompt('Copy this link to share the comment:', url);
  };

  return (
    <div className={clsx('space-y-3', depth > 0 && 'border-l border-zinc-200 pl-4 dark:border-zinc-800')}>
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold uppercase dark:bg-zinc-800">
          {comment.author.username.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <Link href={`/u/${comment.author.username}`} className="font-semibold hover:underline">
              u/{comment.author.username}
            </Link>
            <span>•</span>
            <span>{formatDistanceToNow(comment.createdAt, { addSuffix: true })}</span>
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(event) => {
                  setEditContent(event.target.value);
                  if (error) {
                    setError('');
                  }
                }}
                rows={4}
                maxLength={10_000}
                className="w-full resize-none rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none focus:border-orange-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:bg-zinc-950"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-full bg-orange-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                    setError('');
                  }}
                  disabled={isSaving}
                  className="rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 whitespace-pre-line text-sm text-zinc-800 dark:text-zinc-200">
              {comment.content}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-full border border-zinc-200 text-xs dark:border-zinc-700">
              <button
                onClick={() => handleVote('up')}
                className={clsx(
                  'flex items-center gap-1 rounded-l-full px-3 py-1 transition-colors',
                  userVote?.direction === 'up'
                    ? 'bg-orange-500 text-white'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
                aria-label="Upvote comment"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <span className="px-3 font-semibold text-zinc-700 dark:text-zinc-200">
                {comment.votes}
              </span>
              <button
                onClick={() => handleVote('down')}
                className={clsx(
                  'flex items-center gap-1 rounded-r-full px-3 py-1 transition-colors',
                  userVote?.direction === 'down'
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
                aria-label="Downvote comment"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => onReply?.(comment)}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <CornerUpRight className="h-3.5 w-3.5" />
              Reply
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>

            {canModify && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </button>
              </>
            )}
          </div>

          {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
        </div>
      </div>

      {renderReplyForm?.(comment)}

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              renderReplyForm={renderReplyForm}
            />
          ))}
        </div>
      )}
    </div>
  );
}
