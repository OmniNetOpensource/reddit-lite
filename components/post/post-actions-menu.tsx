'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Post } from '@/lib/types';
import { useAuth } from '@/lib/hooks/use-auth';
import { deletePost } from '@/lib/api/posts';

interface PostActionsMenuProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDeleted?: (postId: string) => void;
}

export function PostActionsMenu({ post, onEdit, onDeleted }: PostActionsMenuProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const isOwner = user?.id === post.author.id;
  if (!isOwner) {
    return null;
  }

  const handleEdit = () => {
    setOpen(false);
    if (onEdit) {
      onEdit(post);
    } else {
      router.push(`/post/${post.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setOpen(false);
    const confirmed = window.confirm('Delete this post? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      await deletePost(post.id);
      onDeleted?.(post.id);
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert((error as Error).message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setOpen((value) => !value)}
        className="rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Post actions"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-zinc-200 bg-white py-1 text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <button
            onClick={handleEdit}
            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Pencil className="h-4 w-4" />
            Edit post
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting…' : 'Delete post'}
          </button>
        </div>
      )}
    </div>
  );
}
