'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from './icons/Icon';

interface FactItem {
  slug: string;
  title: string;
  intro: string;
  author_display_name?: string;
  author_username?: string;
}

export function DesktopFacts({ facts, className = '' }: { facts: FactItem[]; className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (facts.length <= 1) return;
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % facts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [facts.length]);

  if (!facts || facts.length === 0) return null;

  const fact = facts[index];

  return (
    <section className={`${className}`}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="ed-section-title flex items-center gap-2">
          <Icon name="Lightbulb" size={16} />
          Did You Know?
        </h2>
      </div>
      <Link
        href={`/${fact.slug}`}
        className="ed-card group block"
      >
        <div className="flex items-start gap-5">
          <div className="hidden sm:flex shrink-0 h-14 w-14 items-center justify-center rounded-2xl border border-white/10">
            <Icon name="Lightbulb" size={24} className="text-white/50" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="ed-body group-hover:text-white transition line-clamp-4">
              {fact.intro || fact.title}
            </p>
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
              <span className="ed-meta">
                {fact.author_display_name || fact.author_username || ''}
              </span>
              <span className="ed-meta text-white/40 group-hover:text-white/60 transition">
                Read full fact &rarr;
              </span>
            </div>
          </div>
        </div>
      </Link>
      {facts.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {facts.slice(0, Math.min(facts.length, 8)).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Fact ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
