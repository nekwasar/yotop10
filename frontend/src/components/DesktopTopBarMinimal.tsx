'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import HeaderBells from './HeaderBells';
import Link from 'next/link';
import { Icon } from './icons/Icon';

export default function DesktopTopBarMinimal() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const user = useAuthStore(s => s.user);
  const cleanUsername = user?.username?.replace(/^a_/, '') || '';

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="ed-topbar fixed top-0 left-64 lg:left-72 right-0 z-30 h-14 bg-[#000] border-b border-white/10">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex-1 flex justify-center">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search rankings..."
            className="w-full max-w-2xl bg-transparent border border-white/10 rounded-none px-6 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-white/30 focus:outline-none transition"
          />
        </div>
        <div className="flex items-center gap-3 ml-3 shrink-0">
          <HeaderBells />
          {cleanUsername && (
            <Link
              href={`/a/${cleanUsername}`}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-transparent border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Profile"
            >
              <Icon name="User" size={18} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
