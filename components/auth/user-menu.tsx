'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { User } from '@/lib/types';

interface UserMenuProps {
  user: User;
  onClose: () => void;
}

export function UserMenu({ user, onClose }: UserMenuProps) {
  const { signOut } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
    >
      {/* User Info */}
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
            {user.avatar ? (
              <span className="text-lg">{user.avatar}</span>
            ) : (
              <UserIcon className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">{user.username}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {user.karma} karma
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <Link
          href={`/u/${user.username}`}
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <UserIcon className="h-4 w-4" />
          <span>Profile</span>
        </Link>
        
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-zinc-100 dark:text-red-400 dark:hover:bg-zinc-900"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

