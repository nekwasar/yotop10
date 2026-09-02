'use client';

import Link from 'next/link';
import Image from 'next/image';

interface ArticleItem {
  slug: string;
  title: string;
  cover_image?: string;
  reading_time?: number;
  author_username?: string;
  author_display_name?: string;
}

export function DesktopArticles({ articles, className = '' }: { articles: ArticleItem[]; className?: string }) {
  if (!articles || articles.length === 0) return null;

  const featured = articles[0];
  const rest = articles.slice(1, 5);

  return (
    <section className={className}>
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-[11px] font-bold text-white uppercase tracking-[0.15em]">Articles</h2>
        <div className="h-px flex-1 bg-white/[0.06] mx-6" />
        <Link href="/articles" className="text-[12px] text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.08em]">Read more</Link>
      </div>

      {/* Featured article — large */}
      {featured && (
        <Link href={`/articles/${featured.slug}`} className="block mb-6 group">
          {featured.cover_image && (
            <div className="overflow-hidden mb-3">
              <Image src={featured.cover_image} alt="" width={600} height={240} className="w-full h-[180px] object-cover grayscale opacity-60 group-hover:opacity-80 transition-opacity" unoptimized />
            </div>
          )}
          <h3 className="text-[20px] font-bold text-white leading-snug mb-2 group-hover:opacity-80 transition-opacity">{featured.title}</h3>
          <div className="flex items-center gap-3 text-[11px] text-zinc-600">
            <span>{featured.author_display_name || featured.author_username}</span>
            {featured.reading_time && <span>{featured.reading_time} min read</span>}
          </div>
        </Link>
      )}

      {/* Article list — clean editorial lines */}
      <div className="space-y-0">
        {rest.map((a, i) => (
          <Link
            key={a.slug}
            href={`/articles/${a.slug}`}
            className="block py-4 border-t border-white/[0.06] group"
          >
            <h4 className="text-[15px] font-semibold text-white leading-snug mb-1 group-hover:opacity-80 transition-opacity line-clamp-2">{a.title}</h4>
            <div className="flex items-center gap-3 text-[11px] text-zinc-600">
              <span>{a.author_display_name || a.author_username}</span>
              {a.reading_time && <span>{a.reading_time} min</span>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
