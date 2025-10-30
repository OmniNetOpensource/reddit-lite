'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFeed } from '@/lib/store/use-feed';
import { mockCommunities, mockUsers } from '@/lib/mock/seed';
import { Post } from '@/lib/types';
import { FileText, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

type PostType = 'text' | 'link' | 'image';

export default function SubmitPage() {
  const router = useRouter();
  const { addPost } = useFeed();
  
  const [postType, setPostType] = useState<PostType>('text');
  const [selectedCommunity, setSelectedCommunity] = useState(mockCommunities[0].id);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    const community = mockCommunities.find(c => c.id === selectedCommunity);
    if (!community) return;

    const newPost: Post = {
      id: Date.now().toString(),
      title: title.trim(),
      content: postType === 'text' ? content.trim() : '',
      author: mockUsers[0], // Using first mock user as current user
      community,
      votes: 1,
      commentCount: 0,
      createdAt: new Date(),
      type: postType,
      url: postType === 'link' ? url : undefined,
      imageUrl: postType === 'image' ? url : undefined,
    };

    addPost(newPost);
    router.push('/');
  };

  const postTypes = [
    { value: 'text' as PostType, label: 'Text', icon: <FileText className="h-5 w-5" /> },
    { value: 'link' as PostType, label: 'Link', icon: <LinkIcon className="h-5 w-5" /> },
    { value: 'image' as PostType, label: 'Image', icon: <ImageIcon className="h-5 w-5" /> },
  ];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Create a post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Community Selection */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <label className="mb-2 block text-sm font-medium">
            Choose a community
          </label>
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-4 py-2 outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {mockCommunities.map((community) => (
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
                'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-colors',
                postType === type.value
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'
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
          <div className="mt-2 text-xs text-zinc-500">
            {title.length}/300
          </div>
        </div>

        {/* Content based on post type */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          {postType === 'text' && (
            <textarea
              placeholder="Text (optional)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full resize-none bg-transparent outline-none placeholder:text-zinc-400"
            />
          )}

          {postType === 'link' && (
            <input
              type="url"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-zinc-400"
              required
            />
          )}

          {postType === 'image' && (
            <input
              type="url"
              placeholder="Image URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-zinc-400"
              required
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-zinc-200 px-6 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-orange-500 px-6 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
