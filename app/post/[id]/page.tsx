import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Share2, Bookmark, ArrowUp, ArrowDown } from 'lucide-react';
import { getPostById } from '@/lib/api/posts';
import { getCommentsByPostId } from '@/lib/api/comments';
import { VoteButtons } from '@/components/post/vote-buttons';
import { Comment } from '@/lib/types';

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="border-l-2 border-zinc-200 pl-4 dark:border-zinc-800">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm dark:bg-zinc-800">
          {comment.author.avatar}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-bold hover:underline">u/{comment.author.username}</span>
            <span>•</span>
            <span>{formatDistanceToNow(comment.createdAt, { addSuffix: true })}</span>
          </div>

          <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-200">
            {comment.content}
          </p>

          {/* Comment Actions */}
          <div className="mt-2 flex items-center gap-2">
            <button className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900">
              <ArrowUp className="h-3 w-3" />
              <span className="font-bold">{comment.votes}</span>
              <ArrowDown className="h-3 w-3" />
            </button>
            <button className="rounded px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900">
              Reply
            </button>
            <button className="rounded px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900">
              Share
            </button>
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentCard key={reply.id} comment={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PostPage(props: PostPageProps) {
  const params = await props.params;
  const { id } = params;
  const post = await getPostById(id);
  const comments = await getCommentsByPostId(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Post */}
          <article className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            {/* Post Header */}
            <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
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
                <span>{formatDistanceToNow(post.createdAt, { addSuffix: true })}</span>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-4">
              <h1 className="text-2xl font-bold leading-tight dark:text-zinc-100">
                {post.title}
              </h1>

              {post.content && (
                <div className="mt-4 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                  {post.content}
                </div>
              )}

              {post.url && post.type === 'link' && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-orange-500 hover:underline"
                >
                  {post.url}
                </a>
              )}

              {post.imageUrl && post.type === 'image' && (
                <div className="mt-4">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={600}
                    height={400}
                    className="max-w-full rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-center">
                <VoteButtons postId={post.id} votes={post.votes} layout="horizontal" />
              </div>

              <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <MessageSquare className="h-4 w-4" />
                <span>{post.commentCount} Comments</span>
              </button>

              <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>

              <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <Bookmark className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>
          </article>

          {/* Comment Form */}
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
              Comment as <span className="font-bold">u/techguru</span>
            </p>
            <textarea
              placeholder="What are your thoughts?"
              rows={4}
              className="w-full resize-none rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none focus:border-orange-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-950"
            />
            <div className="mt-2 flex justify-end">
              <button className="rounded-full bg-orange-500 px-6 py-2 text-sm font-medium text-white hover:bg-orange-600">
                Comment
              </button>
            </div>
          </div>

          {/* Comments */}
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-lg font-bold">
              Comments ({comments.length})
            </h2>

            {comments.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* About Community */}
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

          {/* About Author */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="mb-3 text-sm font-bold">About Author</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 text-2xl dark:bg-zinc-800">
                {post.author.avatar}
              </div>
              <div>
                <p className="font-bold">u/{post.author.username}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {post.author.karma.toLocaleString()} karma
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
