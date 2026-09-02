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
    <header className="fixed top-0 left-[260px] right-0 z-30 h-14 bg-black border-b border-white/[0.06]">
      <div className="flex h-full items-center justify-between px-8">
        {/* Search — full width, editorial style */}
        <div className="flex-1 max-w-3xl">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search..."
              className="w-full bg-transparent border-b border-white/10 pl-7 pr-4 py-2 text-[13px] text-white placeholder:text-zinc-700 focus:border-white/30 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Right side — bells + profile */}
        <div className="flex items-center gap-5 ml-8 shrink-0">
          <HeaderBells />
          {cleanUsername && (
            <Link
              href={`/a/${cleanUsername}`}
              className="text-[12px] font-medium text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.08em]"
              aria-label="Profile"
            >
              Profile
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
