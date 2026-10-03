'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Icon, type LucideIconName } from '@/components/icons/Icon';
import { CategoriesSkeleton } from '@/components/CategoriesSkeleton';
import { apiFetch } from '@/lib/api/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  post_count: number;
  is_featured: boolean;
  children: Array<{ id: string; name: string; slug: string; post_count: number }>;
}

const LOAD_ERROR = 'Failed to load categories';

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const d = await apiFetch<{ categories?: Category[] }>('/categories');
        // A 200 that isn't the documented shape is a failure, not an empty list.
        if (!Array.isArray(d.categories)) throw new Error('Unexpected /api/categories response');
        if (cancelled) return;
        setCategories(d.categories);
        setError(null);
      } catch {
        if (cancelled) return;
        setCategories([]);
        setError(LOAD_ERROR);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  if (loading) return <CategoriesSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] px-3 py-6 sm:px-6 sm:py-10">
        <nav className="show-desktop mb-6 flex items-center gap-4">
          <Link href="/" className="text-sm font-bold text-orange-400 transition hover:text-orange-300">Home</Link>
          <span className="text-sm font-semibold text-white">Categories</span>
        </nav>
        <main className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 backdrop-blur-sm sm:p-8">
            <div className="mb-3 flex items-center gap-2">
              <Icon name="TriangleAlert" size={20} className="text-orange-400" />
              <h2 className="text-lg font-bold text-orange-400">Error Loading Categories</h2>
            </div>
            <p className="mb-1 text-sm text-zinc-400"><strong className="text-zinc-300">Message:</strong> {error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-5 py-2 text-sm text-orange-300 transition hover:bg-orange-500/20"
            >
              <Icon name="RefreshCw" size={14} />
              Try again
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] px-3 py-6 sm:px-6 sm:py-10">
        <nav className="show-desktop mb-8 flex items-center gap-4">
          <Link href="/" className="text-sm font-bold text-orange-400 transition hover:text-orange-300">Home</Link>
          <span className="text-sm font-semibold text-white">Categories</span>
        </nav>
        <main className="mx-auto max-w-6xl">
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-500">No categories available.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-3 py-6 sm:px-6 sm:py-10">
      <nav className="show-desktop mb-8 flex items-center gap-4">
        <Link href="/" className="text-sm font-bold text-orange-400 transition hover:text-orange-300">Home</Link>
        <span className="text-sm font-semibold text-white">Categories</span>
      </nav>

      <main className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold text-white sm:text-3xl">Categories</h1>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/c/${cat.slug}`}
              className="group block rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:border-orange-500/30 hover:bg-white/5 hover:shadow-lg hover:shadow-orange-500/5 sm:p-6"
            >
              <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-white">
                {cat.icon && <Icon name={cat.icon as LucideIconName} size={20} />}
                {cat.name}
              </h2>
              {cat.description && (
                <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                  {cat.description}
                </p>
              )}
              <span className="text-xs text-zinc-600">
                {cat.post_count} {cat.post_count === 1 ? 'post' : 'posts'}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
