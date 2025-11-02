"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFeed } from "@/lib/store/use-feed";
import { useAuth } from "@/lib/hooks/use-auth";
import { getCommunities } from "@/lib/api/communities";
import { createPost } from "@/lib/api/posts";
import { Community } from "@/lib/types";
import {
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import clsx from "clsx";
import { ImageUploader } from "@/components/submit/image-uploader";

type PostType = "text" | "link" | "image";

export default function SubmitPage() {
  const router = useRouter();
  const { addPost } = useFeed();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [postType, setPostType] = useState<PostType>("text");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push("/?auth=signin");
      return;
    }

    // Fetch communities
    const loadCommunities = async () => {
      try {
        const data = await getCommunities();
        setCommunities(data);
        if (data.length > 0) {
          setSelectedCommunity(data[0].id);
        }
      } catch (err) {
        console.error("Error loading communities:", err);
      }
    };

    if (isAuthenticated) {
      loadCommunities();
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    if (postType === "link" && !linkUrl.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (postType === "image" && !imageUrl) {
      setError("Please upload an image");
      return;
    }

    setIsSubmitting(true);

    try {
      const newPost = await createPost({
        title: title.trim(),
        content: postType === "text" ? content.trim() : undefined,
        type: postType,
        url: postType === "link" ? linkUrl.trim() : undefined,
        imageUrl: postType === "image" ? imageUrl ?? undefined : undefined,
        communityId: selectedCommunity,
      });

      addPost(newPost);
      router.push(`/post/${newPost.id}`);
    } catch (err: unknown) {
      console.error("Error creating post:", err);
      setError((err as Error).message || "Failed to create post");
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto flex max-w-3xl items-center justify-center px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const postTypes = [
    {
      value: "text" as PostType,
      label: "Text",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      value: "link" as PostType,
      label: "Link",
      icon: <LinkIcon className="h-5 w-5" />,
    },
    {
      value: "image" as PostType,
      label: "Image",
      icon: <ImageIcon className="h-5 w-5" />,
    },
  ];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Create a post</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Community Selection */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <label className="mb-2 block text-sm font-medium">
            Choose a community
          </label>
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            disabled={communities.length === 0}
            className="w-full rounded-md border border-zinc-200 bg-white px-4 py-2 outline-none focus:border-orange-500 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {communities.map((community) => (
              <option key={community.id} value={community.id}>
                {community.icon} r/{community.slug}
              </option>
            ))}
          </select>
        </div>

        {/* Post Type Selection */}
        <div className="flex gap-2 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
          {postTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setPostType(type.value)}
              className={clsx(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-colors",
                postType === type.value
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
              )}
            >
              {type.icon}
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Title */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={300}
            className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-zinc-400"
            required
          />
          <div className="mt-2 text-xs text-zinc-500">{title.length}/300</div>
        </div>

        {/* Content based on post type */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          {postType === "text" && (
            <textarea
              placeholder="Text (optional)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full resize-none bg-transparent outline-none placeholder:text-zinc-400"
            />
          )}

          {postType === "link" && (
            <input
              type="url"
              placeholder="URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-zinc-400"
              required
            />
          )}

          {postType === "image" && (
            <ImageUploader value={imageUrl} onChange={setImageUrl} />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="rounded-full border border-zinc-200 px-6 py-2 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || communities.length === 0}
            className="flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
