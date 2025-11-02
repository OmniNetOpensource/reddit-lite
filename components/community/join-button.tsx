'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { joinCommunity, leaveCommunity } from '@/lib/api/communities';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';

interface JoinButtonProps {
  communityId: string;
  initialIsMember?: boolean;
  onChange?: (isMember: boolean) => void;
}

export function JoinButton({ communityId, initialIsMember = false, onChange }: JoinButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMember, setIsMember] = useState(initialIsMember);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsMember(initialIsMember);
  }, [initialIsMember]);

  const toggleMembership = async () => {
    if (!isAuthenticated) {
      router.push('/?auth=signin');
      return;
    }

    setIsWorking(true);
    setError('');

    try {
      if (isMember) {
        setIsMember(false);
        onChange?.(false);
        await leaveCommunity(communityId);
      } else {
        setIsMember(true);
        onChange?.(true);
        await joinCommunity(communityId);
      }
    } catch (err) {
      console.error('Failed to toggle community membership:', err);
      setIsMember(isMember);
      setError((err as Error).message || 'Failed to update membership');
      onChange?.(isMember);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        onClick={toggleMembership}
        disabled={isWorking}
        className={clsx(
          'flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-colors disabled:opacity-50',
          isMember
            ? 'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
            : 'bg-orange-500 text-white hover:bg-orange-600'
        )}
      >
        {isWorking && <Loader2 className="h-4 w-4 animate-spin" />}
        {isMember ? 'Joined' : 'Join'}
      </button>
      {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
    </div>
  );
}
