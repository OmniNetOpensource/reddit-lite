"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getPostById, updatePost } from "@/lib/api/posts";
import { ImageUploader } from "@/components/submit/image-uploader";
import { useAuth } from "@/lib/hooks/use-auth";
import { Post } from "@/lib/types";

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = params?.id;

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!postId) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const fetchedPost = await getPostById(postId);
        if (!fetchedPost) {
          router.replace("/404");
          return;
        }

        if (!cancelled) {
          setPost(fetchedPost);
          setTitle(fetchedPost.title);
          setContent(fetchedPost.content ?? "");
          setLinkUrl(fetchedPost.url ?? "");
          setImageUrl(fetchedPost.imageUrl ?? null);
        }
      } catch (err) {
        console.error("Failed to load post:", err);
        if (!cancelled) {
          setError((err as Error).message || "Failed to load post");
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
  }, [postId, router]);

  useEffect(() => {
    if (!post || authLoading) {
      return;
    }

    if (!isAuthenticated || user?.id !== post.author.id) {
      setForbidden(true);
    } else {
      setForbidden(false);
    }
  }, [authLoading, isAuthenticated, post, user]);

  if (!postId) {
    return null;
  }

  if (loading || authLoading) {
    return (
      <div className="container mx-auto flex max-w-3xl items-center justify-center px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  if (forbidden) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          You do not have permission to edit this post.
        </div>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (post.type === "link" && !linkUrl.trim()) {
      setError("Link URL is required");
      return;
    }

    if (post.type === "image" && !imageUrl) {
      setError("Please upload an image");
      return;
    }

    setSubmitting(true);

    try {
      await updatePost(post.id, {
        title: title.trim(),
        content: post.type === "text" ? content.trim() : undefined,
        url: post.type === "link" ? linkUrl.trim() : undefined,
        imageUrl: post.type === "image" ? (imageUrl ?? undefined) : undefined,
      });

      router.push(`/post/${post.id}`);
    } catch (err) {
      console.error("Failed to update post:", err);
      setError((err as Error).message || "Failed to update post");
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Edit post</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={300}
            className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:border-orange-500 dark:border-zinc-700"
            required
          />
          <div className="mt-1 text-xs text-zinc-500">{title.length}/300</div>
        </div>

        {post.type === "text" && (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Content
            </label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={12}
              className="w-full resize-none rounded-md border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:border-orange-500 dark:border-zinc-700"
            />
          </div>
        )}

        {post.type === "link" && (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Link URL
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:border-orange-500 dark:border-zinc-700"
              required
            />
          </div>
        )}

        {post.type === "image" && (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Image
            </label>
            <ImageUploader value={imageUrl} onChange={setImageUrl} />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            className="rounded-full border border-zinc-200 px-6 py-2 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
