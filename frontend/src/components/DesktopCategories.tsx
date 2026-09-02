'use client';

import Link from 'next/link';
import { Icon, type LucideIconName } from './icons/Icon';

interface CategoryItem {
  name: string;
  slug: string;
  post_count: number;
  icon?: string;
}

const CATEGORY_META: Record<string, { icon: LucideIconName }> = {
  technology: { icon: 'Cpu' as const },
  music: { icon: 'Music' as const },
  movies: { icon: 'Film' as const },
  sports: { icon: 'Trophy' as const },
  food: { icon: 'UtensilsCrossed' as const },
  science: { icon: 'FlaskConical' as const },
  education: { icon: 'BookOpen' as const },
  gaming: { icon: 'Gamepad2' as const },
  politics: { icon: 'Landmark' as const },
  travel: { icon: 'Compass' as const },
  health: { icon: 'Heart' as const },
  business: { icon: 'TrendingUp' as const },
};

export function DesktopCategories({ categories, className = '' }: { categories: CategoryItem[]; className?: string }) {
  const top = categories.filter(c => c.name && c.post_count > 0).slice(0, 9);

  if (top.length === 0) return null;

  return (
    <section className={`${className}`}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="ed-section-title flex items-center gap-2">
          <Icon name="Grid3x3" size={16} />
          Categories
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {top.map(cat => {
          const meta = CATEGORY_META[cat.slug] || { icon: 'Folder' as LucideIconName };
          return (
            <Link
              key={cat.slug}
              href={`/c/${cat.slug}`}
              className="ed-card group text-center"
            >
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 transition group-hover:border-white/20">
                <Icon name={meta.icon} size={18} className="text-white/50" />
              </div>
              <p className="ed-headline-sm group-hover:text-white transition truncate">{cat.name}</p>
              <p className="ed-meta mt-1">{cat.post_count} posts</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
