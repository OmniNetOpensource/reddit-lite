'use client';

import { useCallback, useEffect, useState } from 'react';
import { Share2, Check } from 'lucide-react';
import clsx from 'clsx';
import { Post } from '@/lib/types';

interface ShareButtonProps {
  post: Post;
}

export function ShareButton({ post }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (copied) {
      timer = setTimeout(() => setCopied(false), 2000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [copied]);

  const shareUrl = useCallback(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return `${window.location.origin}/post/${post.id}`;
  }, [post.id]);

  const handleShare = async () => {
    const url = shareUrl();

    if (!url) {
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url,
        });
        return;
      } catch (error) {
        console.warn('Native share failed, falling back to clipboard', error);
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Unable to copy link. Please copy it manually.');
    }
  };

  return (
    <button
      onClick={handleShare}
      className={clsx(
        'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
        copied
          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
          : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'
      )}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      <span>{copied ? 'Copied!' : 'Share'}</span>
    </button>
  );
}
