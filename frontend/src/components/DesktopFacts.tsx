'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    }, 6000);
    return () => clearInterval(interval);
  }, [facts.length]);

  if (!facts || facts.length === 0) return null;

  const fact = facts[index];

  return (
    <section className={className}>
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-[11px] font-bold text-white uppercase tracking-[0.15em]">Did You Know</h2>
        <div className="h-px flex-1 bg-white/[0.06] mx-6" />
      </div>

      {/* Fact — large quote style */}
      <Link href={`/${fact.slug}`} className="block group">
        <div className="border border-white/[0.06] p-8">
          {/* Giant quotation mark */}
          <span className="block text-[64px] leading-none font-serif text-white/10 mb-2">&ldquo;</span>
          <p className="text-[20px] leading-[1.4] font-medium text-zinc-300 mb-6">
            {fact.intro || fact.title}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-zinc-600">
              {fact.author_display_name || fact.author_username || ''}
            </span>
            <span className="text-[11px] text-zinc-700 uppercase tracking-[0.08em] group-hover:text-zinc-400 transition-colors">
              Read more
            </span>
          </div>
        </div>
      </Link>

      {/* Dots */}
      {facts.length > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {facts.slice(0, Math.min(facts.length, 8)).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-[2px] transition-all duration-300 ${i === index ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
              aria-label={`Fact ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
