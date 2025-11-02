"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { Post } from "@/lib/types";
import { VoteButtons } from "./vote-buttons";
import { ShareButton } from "./share-button";
import { SaveButton } from "./save-button";
import { PostActionsMenu } from "./post-actions-menu";
import { useFeed } from "@/lib/store/use-feed";

interface PostCardProps {
  post: Post;
  onDeleted?: (postId: string) => void;
}

export function PostCard({ post, onDeleted }: PostCardProps) {
  const setPostSavedState = useFeed((state) => state.setPostSavedState);
  const removePost = useFeed((state) => state.removePost);

  const handleDeleted = (postId: string) => {
    removePost(postId);
    onDeleted?.(postId);
  };

  return (
    <article className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
      <div className="shrink-0">
        <VoteButtons postId={post.id} votes={post.votes} layout="vertical" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-start justify-between gap-3">
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
              className="font-semibold hover:underline"
            >
              u/{post.author.username}
            </Link>
            <span>•</span>
            <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
          </div>
          <PostActionsMenu post={post} onDeleted={handleDeleted} />
        </div>

        <Link href={`/post/${post.id}`}>
          <h2 className="text-lg font-semibold leading-tight text-zinc-900 hover:text-orange-500 dark:text-zinc-100">
            {post.title}
          </h2>
        </Link>

        {post.content && post.type === "text" && (
          <p className="line-clamp-3 text-sm text-zinc-700 dark:text-zinc-300">
            {post.content}
          </p>
        )}

        {post.type === "link" && post.url && (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-orange-500 hover:underline"
          >
            {post.url}
          </a>
        )}

        {post.type === "image" && post.imageUrl && (
          <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt={post.title}
              className="h-64 w-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/post/${post.id}`}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.commentCount} Comments</span>
          </Link>
          <ShareButton post={post} />
          <SaveButton
            postId={post.id}
            initialIsSaved={post.isSaved ?? false}
            onChange={(saved) => setPostSavedState(post.id, saved)}
          />
        </div>
      </div>
    </article>
  );
}
