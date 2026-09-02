'use client';

import Link from 'next/link';

interface CategoryItem {
  name: string;
  slug: string;
  post_count: number;
  icon?: string;
}

export function DesktopCategories({ categories, className = '' }: { categories: CategoryItem[]; className?: string }) {
  const top = categories.filter(c => c.name && c.post_count > 0).slice(0, 9);

  if (top.length === 0) return null;

  return (
    <section className={className}>
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-[11px] font-bold text-white uppercase tracking-[0.15em]">Categories</h2>
        <div className="h-px flex-1 bg-white/[0.06] mx-6" />
        <Link href="/categories" className="text-[12px] text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.08em]">All</Link>
      </div>

      {/* Category grid — big number + name */}
      <div className="space-y-0">
        {top.map((cat, i) => (
          <Link
            key={cat.slug}
            href={`/c/${cat.slug}`}
            className="flex items-baseline justify-between py-3 border-t border-white/[0.06] group"
          >
            <div className="flex items-baseline gap-4">
              <span className="text-[11px] font-mono text-zinc-700 w-5 text-right">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[15px] font-medium text-zinc-400 group-hover:text-white transition-colors">{cat.name}</span>
            </div>
            <span className="text-[13px] font-mono text-zinc-700">{cat.post_count}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
