import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/docs', label: 'Docs' },
  { href: '/docs/guidelines', label: 'Community Guidelines' },
  { href: '/docs/terms', label: 'Terms' },
  { href: '/docs/privacy', label: 'Privacy' },
  { href: '/docs/cookies', label: 'Cookies' },
];

export function AppFooter() {
  return (
    <footer className="border-t border-white/5 bg-white/5 px-3 py-6 text-center">
      <p className="text-sm text-zinc-500">
        YoTop10 — Open Platform for Facts and Debate
      </p>
      <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-500">
        {FOOTER_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="transition hover:text-zinc-300"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
