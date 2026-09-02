'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Icon } from './icons/Icon';

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

  return (
    <section className={`${className}`}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="ed-section-title flex items-center gap-2">
          <Icon name="FileText" size={16} className="text-zinc-500" />
          Recent Articles
        </h2>
        <Link href="/articles" className="ed-meta hover:text-black transition">
          Read more &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
        {articles.slice(0, 4).map(a => (
          <Link
            key={a.slug}
            href={`/articles/${a.slug}`}
            className="ed-card p-6 lg:p-8 group overflow-hidden transition"
          >
            <div className="relative h-32 w-full overflow-hidden bg-zinc-100">
              {a.cover_image ? (
                <Image src={a.cover_image} alt="" fill className="object-cover grayscale transition duration-500 group-hover:scale-105" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="FileText" size={32} className="text-zinc-400" />
                </div>
              )}
              {a.reading_time && (
                <span className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-0.5 text-3xs font-medium text-zinc-700">
                  {a.reading_time} min read
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="ed-headline-sm leading-snug line-clamp-2 group-hover:text-black transition mb-2">
                {a.title}
              </h3>
              <p className="ed-body text-zinc-600">
                {a.author_display_name || a.author_username || ''}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
