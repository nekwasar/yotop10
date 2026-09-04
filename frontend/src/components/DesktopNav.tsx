'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';

const NAV_ITEMS = [
  { label: 'Categories', href: '/categories' },
  { label: 'Arguments', href: '/arguments' },
  { label: 'Explore', href: '/explore' },
  { label: 'Saved', href: '/saved' },
  { label: 'Articles', href: '/articles' },
  { label: 'Hall of Fame', href: '/hall-of-fame' },
  { label: 'Settings & Doc', href: '/settings' },
];

export function DesktopNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const cleanUsername = user?.username?.replace(/^a_/, '') || '';
  const profileHref = cleanUsername ? `/a/${cleanUsername}` : '/a';

  return (
    <nav className="hidden lg:block flex items-center justify-between">
      <ul className="flex items-center gap-6">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                style={{
                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                  fontSize: '14px',
                  color: isActive ? '#111' : '#666',
                  textDecoration: 'none',
                  borderBottom: isActive ? '1.5px solid #111' : '1.5px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        href={profileHref}
        style={{
          fontFamily: "Georgia, 'Times New Roman', Times, serif",
          fontSize: '13px',
          color: '#111',
          textDecoration: 'none',
          border: '1px solid #111',
          padding: '6px 14px',
          fontWeight: 600,
        }}
      >
        {cleanUsername ? `@${cleanUsername}` : 'user'}
      </Link>
    </nav>
  );
}
