'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { isUsernameAvailable } from '@/lib/api/users';

interface SignUpModalProps {
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export function SignUpModal({ onClose, onSwitchToSignIn }: SignUpModalProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (username.length < 3 || username.length > 20) {
      setError('Username must be between 3 and 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Check if username is available
      const available = await isUsernameAvailable(username);
      if (!available) {
        setError('Username is already taken');
        setIsLoading(false);
        return;
      }

      await signUp(email, password, username);
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sign Up</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="cooluser123"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              className="w-full rounded-md border border-zinc-200 bg-white px-4 py-2 outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-900"
            />
            <p className="mt-1 text-xs text-zinc-500">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-md border border-zinc-200 bg-white px-4 py-2 outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full rounded-md border border-zinc-200 bg-white px-4 py-2 outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full rounded-md border border-zinc-200 bg-white px-4 py-2 outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Switch to Sign In */}
        <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{' '}
          <button
            onClick={onSwitchToSignIn}
            className="font-medium text-orange-500 hover:text-orange-600"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

