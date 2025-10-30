'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Home, TrendingUp } from 'lucide-react';
import { getPopularCommunities } from '@/lib/api/communities';
import { Community } from '@/lib/types';
import { AuthButton } from '@/components/auth/auth-button';

export function SiteHeader() {
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const data = await getPopularCommunities(5);
        setCommunities(data);
      } catch (err) {
        console.error('Error loading popular communities:', err);
      }
    };

    loadCommunities();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">
            R
          </div>
          <span className="hidden sm:inline">Reddit Lite</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search communities, posts..."
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-orange-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:focus:bg-zinc-950"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          
          <Link
            href="/submit"
            className="flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Post</span>
          </Link>

          <AuthButton />
        </div>
      </div>

      {/* Popular Communities Bar */}
      <div className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="container mx-auto flex items-center gap-4 overflow-x-auto px-4 py-2">
          <div className="flex items-center gap-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <TrendingUp className="h-4 w-4" />
            <span className="whitespace-nowrap">Popular:</span>
          </div>
          {communities.map((community) => (
            <Link
              key={community.id}
              href={`/r/${community.slug}`}
              className="flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              <span>{community.icon}</span>
              <span>r/{community.slug}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

