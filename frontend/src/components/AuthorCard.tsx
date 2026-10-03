import type { ReactNode } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/dates';
import { profilePath, visibleAuthorName } from '@/lib/seo/structuredData';

export interface AuthorCardProps {
  username: string;
  displayName?: string | null;
  memberSince?: string | null;
  historyHref?: string;
  meta?: ReactNode;
}

export function AuthorCard({ username, displayName, memberSince, historyHref, meta }: AuthorCardProps) {
  const href = profilePath(username);
  const name = visibleAuthorName({ username, displayName });
  const history = historyHref || `${href}#post-history`;
  const initial = (name || '?').charAt(0).toUpperCase();

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-sm font-bold text-white"
      >
        {initial}
      </Link>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">
          <span className="font-normal text-zinc-500">By </span>
          <Link href={href} className="font-semibold text-orange-400 transition hover:text-orange-300">
            {name}
          </Link>
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          {memberSince && <span>Member since {formatDate(memberSince)}</span>}
          {memberSince && <span className="text-zinc-700">&middot;</span>}
          <Link href={history} className="text-zinc-500 transition hover:text-orange-400">
            History
          </Link>
          {meta}
        </div>
      </div>
    </div>
  );
}
