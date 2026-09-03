'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  return (
    <nav className="hidden lg:block">
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
    </nav>
  );
}
