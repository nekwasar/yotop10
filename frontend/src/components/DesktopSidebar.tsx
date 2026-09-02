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
    <aside className="ed-sidebar fixed top-0 left-0 z-50 h-full w-64 lg:w-72 flex flex-col overflow-y-auto -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-out">
      {/* Logo */}
      <Link href="/" className="flex flex-col px-6 pt-6 pb-4 shrink-0">
        <div className="flex items-baseline gap-0">
          <span className="font-accent gradient-text text-3xl lg:text-4xl tracking-normal">YO</span>
          <span className="font-display text-3xl lg:text-4xl tracking-tight text-white">Top10</span>
        </div>
        <p className="ed-meta mt-1">Fact Mine. Debate Ground.</p>
      </Link>

      <hr className="ed-divider mx-4 mb-4" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`ed-sidebar-link ${isActive ? 'ed-sidebar-link-active' : ''}`}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto pt-4 pb-4 px-3 space-y-3 shrink-0">
        <hr className="ed-divider mx-1" />

        {/* User section */}
        {user ? (
          <Link
            href={`/a/${cleanUsername}`}
            className="ed-sidebar-link"
          >
            {user.profile_image_url ? (
              <Image src={user.profile_image_url} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover shrink-0" unoptimized />
            ) : (
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black font-bold text-xs shrink-0">
                {displayName[0].toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="ed-headline-sm text-sm truncate">{displayName}</span>
                {user.posts_approved >= 3 && <Icon name="BadgeCheck" size={12} className="text-white shrink-0" />}
              </div>
              <p className="ed-meta truncate">@{cleanUsername}</p>
            </div>
          </Link>
        ) : (
          <div className="ed-sidebar-link">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 shrink-0">
              <Icon name="User" size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="ed-headline-sm text-sm">Guest</p>
            </div>
          </div>
        )}

        {/* Settings + Theme */}
        <div className="flex items-center justify-between px-4 py-1">
          <Link
            href="/settings"
            className="ed-meta flex items-center gap-2 hover:text-white transition"
          >
            <Icon name="Settings" size={16} />
            Settings
          </Link>
          <ThemeToggle />
        </div>

        {/* Submit CTA */}
        <Link
          href="/new"
          className="ed-btn mx-1 text-center justify-center"
        >
          <Icon name="Plus" size={14} />
          Submit a List
        </Link>
      </div>
    </aside>
  );
}
