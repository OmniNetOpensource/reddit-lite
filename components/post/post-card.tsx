"use client";

import Link from "next/link";
import { MessageSquare, Share2, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/lib/types";
import { VoteButtons } from "./vote-buttons";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
      {/* Vote Buttons */}
      <div className="shrink-0">
        <VoteButtons postId={post.id} votes={post.votes} layout="vertical" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Meta Info */}
        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <Link
            href={`/r/${post.community.slug}`}
            className="flex items-center gap-1 font-bold hover:underline"
          >
            <span>{post.community.icon}</span>
            <span>r/{post.community.slug}</span>
          </Link>
          <span>•</span>
          <span>Posted by</span>
          <span className="hover:underline">u/{post.author.username}</span>
          <span>•</span>
          <span>
            {formatDistanceToNow(post.createdAt, { addSuffix: true })}
          </span>
        </div>

        {/* Title */}
        <Link href={`/post/${post.id}`}>
          <h2 className="mt-2 text-lg font-semibold leading-tight hover:text-orange-500 dark:text-zinc-100">
            {post.title}
          </h2>
        </Link>

        {/* Content Preview */}
        {post.content && (
          <p className="mt-2 line-clamp-3 text-sm text-zinc-700 dark:text-zinc-300">
            {post.content}
          </p>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-4">
          <Link
            href={`/post/${post.id}`}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.commentCount} Comments</span>
          </Link>

          <button className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>

          <button className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900">
            <Bookmark className="h-4 w-4" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </article>
  );
}
