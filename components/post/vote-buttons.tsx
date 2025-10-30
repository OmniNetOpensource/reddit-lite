'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useFeed } from '@/lib/store/use-feed';
import { useAuth } from '@/lib/hooks/use-auth';
import clsx from 'clsx';

interface VoteButtonsProps {
  postId: string;
  votes: number;
  layout?: 'vertical' | 'horizontal';
}

export function VoteButtons({ postId, votes, layout = 'vertical' }: VoteButtonsProps) {
  const { votes: userVotes, vote } = useFeed();
  const { isAuthenticated } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const userVote = userVotes[postId];

  const handleVote = async (direction: 'up' | 'down') => {
    if (!isAuthenticated) {
      alert('Please sign in to vote');
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      await vote(postId, direction);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const formatVotes = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const containerClass = clsx(
    'flex items-center gap-1',
    layout === 'vertical' ? 'flex-col' : 'flex-row'
  );

  return (
    <div className={containerClass}>
      <button
        onClick={() => handleVote('up')}
        disabled={isVoting}
        className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-50',
          userVote?.direction === 'up'
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
        )}
        aria-label="Upvote"
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      <span
        className={clsx(
          'min-w-[2rem] text-center text-sm font-bold',
          userVote?.direction === 'up' && 'text-orange-500',
          userVote?.direction === 'down' && 'text-blue-500'
        )}
      >
        {formatVotes(votes)}
      </span>

      <button
        onClick={() => handleVote('down')}
        disabled={isVoting}
        className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-50',
          userVote?.direction === 'down'
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
        )}
        aria-label="Downvote"
      >
        <ArrowDown className="h-5 w-5" />
      </button>
    </div>
  );
}

