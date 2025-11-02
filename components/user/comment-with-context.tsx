'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import { CommentWithPostContext } from '@/lib/types';

interface CommentWithContextProps {
  comment: CommentWithPostContext;
}

export function CommentWithContext({ comment }: CommentWithContextProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-800 dark:text-zinc-100">
              Commented on{' '}
              <Link
                href={`/post/${comment.post.id}`}
                className="text-orange-500 hover:underline"
              >
                {comment.post.title}
              </Link>
            </span>
            <span>•</span>
            <Link
              href={`/r/${comment.post.community.slug}`}
              className="hover:underline"
            >
              r/{comment.post.community.slug}
            </Link>
            <span>•</span>
            <span>{formatDistanceToNow(comment.createdAt, { addSuffix: true })}</span>
          </div>

          <p className="mt-2 whitespace-pre-line text-sm text-zinc-800 dark:text-zinc-200">
            {comment.content}
          </p>
        </div>

        <Link
          href={`/post/${comment.post.id}?comment=${comment.id}`}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          <MessageSquare className="h-4 w-4" />
          View thread
        </Link>
      </div>
    </div>
  );
}
