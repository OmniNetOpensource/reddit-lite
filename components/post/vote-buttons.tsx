'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';
import { useFeed } from '@/lib/store/use-feed';
import clsx from 'clsx';

interface VoteButtonsProps {
  postId: string;
  votes: number;
  layout?: 'vertical' | 'horizontal';
}

export function VoteButtons({ postId, votes, layout = 'vertical' }: VoteButtonsProps) {
  const { votes: userVotes, vote } = useFeed();
  const userVote = userVotes[postId];

  const handleVote = (direction: 'up' | 'down') => {
    vote(postId, direction);
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
        className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
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
        className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
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

