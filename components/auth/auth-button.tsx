'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { SignInModal } from './sign-in-modal';
import { SignUpModal } from './sign-up-modal';
import { UserMenu } from './user-menu';

export function AuthButton() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (isLoading) {
    return (
      <button className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800">
        <div className="h-5 w-5 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-700" />
      </button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
        >
          {user.avatar ? (
            <span className="text-lg">{user.avatar}</span>
          ) : (
            <User className="h-5 w-5" />
          )}
        </button>
        
        {showUserMenu && (
          <UserMenu 
            user={user} 
            onClose={() => setShowUserMenu(false)} 
          />
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowSignIn(true)}
        className="flex h-10 items-center justify-center rounded-full border border-zinc-200 px-4 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
      >
        <span className="text-sm font-medium">Sign In</span>
      </button>

      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onSwitchToSignUp={() => {
            setShowSignIn(false);
            setShowSignUp(true);
          }}
        />
      )}

      {showSignUp && (
        <SignUpModal
          onClose={() => setShowSignUp(false)}
          onSwitchToSignIn={() => {
            setShowSignUp(false);
            setShowSignIn(true);
          }}
        />
      )}
    </>
  );
}

