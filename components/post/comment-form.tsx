'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createComment } from '@/lib/api/comments';
import { useComments } from '@/lib/store/use-comments';
import { useAuth } from '@/lib/hooks/use-auth';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MAX_LENGTH = 10_000;

export function CommentForm({ postId, parentId, onSuccess, onCancel }: CommentFormProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { addComment } = useComments();

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const charactersRemaining = useMemo(() => MAX_LENGTH - content.length, [content.length]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!content.trim()) {
      setError('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newComment = await createComment({
        postId,
        content: content.trim(),
        parentId,
      });

      addComment(newComment);
      setContent('');
      onSuccess?.();
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError((err as Error).message || 'Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          You need an account to join the conversation.
        </p>
        <div className="mt-3 flex justify-center gap-3">
          <button
            onClick={() => router.push('/?auth=signin')}
            className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Sign in
          </button>
          <button
            onClick={() => router.push('/?auth=signup')}
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Sign up
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
        Comment as <span className="font-semibold">u/{user.username}</span>
      </p>

      <textarea
        value={content}
        onChange={(event) => {
          setContent(event.target.value.slice(0, MAX_LENGTH));
          if (error) {
            setError('');
          }
        }}
        placeholder="What are your thoughts?"
        rows={parentId ? 3 : 5}
        maxLength={MAX_LENGTH}
        className="w-full resize-none rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none focus:border-orange-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:bg-zinc-950"
      />

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {charactersRemaining.toLocaleString()} characters remaining
        </span>

        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex items-center gap-2 rounded-full bg-orange-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Posting...' : parentId ? 'Reply' : 'Comment'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </form>
  );
}
