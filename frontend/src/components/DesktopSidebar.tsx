'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Icon } from './icons/Icon';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { icon: 'Flame' as const, label: 'Home', href: '/' },
  { icon: 'Search' as const, label: 'Explore', href: '/explore' },
  { icon: 'Folder' as const, label: 'Categories', href: '/categories' },
  { icon: 'MessageCircle' as const, label: 'Arguments', href: '/arguments' },
  { icon: 'Bookmark' as const, label: 'Saved', href: '/saved' },
  { icon: 'FileText' as const, label: 'Articles', href: '/articles' },
  { icon: 'Crown' as const, label: 'Hall of Fame', href: '/hall-of-fame' },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);
  const displayName = user?.custom_display_name || user?.username || 'User';
  const rawUsername = user?.username || 'unknown';
  const cleanUsername = rawUsername.replace(/^a_/, '');

  return (
    <aside className="fixed top-0 left-0 z-50 h-full w-[260px] bg-black flex flex-col overflow-y-auto -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-out">
      {/* Logo — the only thing that stays */}
      <Link href="/" className="block px-7 pt-8 pb-6 shrink-0">
        <div className="flex items-baseline gap-0">
          <span className="font-accent gradient-text text-3xl lg:text-4xl tracking-normal">YO</span>
          <span className="font-display text-3xl lg:text-4xl tracking-tight text-white">Top20</span>
        </div>
      </Link>

      {/* Thin rule */}
      <div className="mx-7 h-px bg-white/10" />

      {/* Navigation — big, spaced, editorial */}
      <nav className="flex-1 px-5 pt-6 pb-4">
        {NAV_ITEMS.map((item, i) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-4 py-3 text-[13px] font-medium tracking-wide transition-colors duration-150"
              style={{ color: isActive ? '#fff' : '#52525b' }}
            >
              <Icon name={item.icon} size={18} strokeWidth={1.5} />
              <span className="uppercase" style={{ letterSpacing: '0.08em', fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto px-5 pb-6 shrink-0">
        <div className="h-px bg-white/10 mb-5" />

        {/* User */}
        {user ? (
          <Link
            href={`/a/${cleanUsername}`}
            className="flex items-center gap-3 py-2 transition-colors hover:opacity-80"
          >
            {user.profile_image_url ? (
              <Image src={user.profile_image_url} alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover shrink-0 grayscale" unoptimized />
            ) : (
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-black font-bold text-sm shrink-0">
                {displayName[0].toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{displayName}</p>
              <p className="text-[11px] text-zinc-600 font-mono truncate">@{cleanUsername}</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 py-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 shrink-0">
              <Icon name="User" size={16} className="text-zinc-600" />
            </span>
            <p className="text-[13px] text-zinc-600">Guest</p>
          </div>
        )}

        {/* Settings row */}
        <div className="flex items-center justify-between mt-4">
          <Link href="/settings" className="text-[12px] text-zinc-600 hover:text-white transition-colors flex items-center gap-2">
            <Icon name="Settings" size={14} />
            Settings
          </Link>
          <ThemeToggle />
        </div>

        {/* Submit */}
        <Link
          href="/new"
          className="mt-5 flex items-center justify-center w-full py-3 bg-white text-black text-[11px] font-bold uppercase tracking-[0.1em] hover:opacity-85 transition-opacity"
        >
          <Icon name="Plus" size={14} className="mr-2" />
          Submit a List
        </Link>
      </div>
    </aside>
  );
}
