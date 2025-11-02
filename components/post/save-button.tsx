'use client';

import { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { savePost, unsavePost } from '@/lib/api/saved-posts';
import { useAuth } from '@/lib/hooks/use-auth';

interface SaveButtonProps {
  postId: string;
  initialIsSaved?: boolean;
  onChange?: (saved: boolean) => void;
}

export function SaveButton({ postId, initialIsSaved = false, onChange }: SaveButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsSaved(initialIsSaved);
  }, [initialIsSaved]);

  const toggleSave = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save posts');
      return;
    }

    setIsWorking(true);
    setError('');

    try {
      if (isSaved) {
        setIsSaved(false);
        onChange?.(false);
        await unsavePost(postId);
      } else {
        setIsSaved(true);
        onChange?.(true);
        await savePost(postId);
      }
    } catch (err) {
      console.error('Failed to toggle saved state:', err);
      setIsSaved(isSaved); // rollback
      setError((err as Error).message || 'Unable to update saved state');
      onChange?.(isSaved);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        onClick={toggleSave}
        disabled={isWorking}
        className={clsx(
          'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50',
          isSaved
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'
        )}
      >
        {isWorking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSaved ? (
          <BookmarkCheck className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
        <span>{isSaved ? 'Saved' : 'Save'}</span>
      </button>
      {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
    </div>
  );
}
