'use client';

import { useRef, useState, useEffect } from 'react';
import { PostCarouselCard } from '@/components/PostCarouselCard';
import { Icon } from '@/components/icons/Icon';
import type { PostsResponse } from '@/lib/api/types';

interface DesktopCarouselProps {
  posts: PostsResponse['posts'];
}

export function DesktopCarousel({ posts }: DesktopCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardWidth = el.clientWidth * 0.75;
      setActiveIndex(Math.round(el.scrollLeft / cardWidth));
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const w = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -w : w, behavior: 'smooth' });
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Icon name="FileText" size={32} className="text-zinc-700 mb-4" />
        <p className="text-[13px] text-zinc-600">No ranked lists yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Arrows */}
      <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 z-10 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors" aria-label="Previous">
        <Icon name="ChevronLeft" size={18} className="text-white" />
      </button>
      <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 z-10 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors" aria-label="Next">
        <Icon name="ChevronRight" size={18} className="text-white" />
      </button>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth"
        style={{ gap: '2px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {posts.map((post) => (
          <div key={post.id} className="flex-shrink-0 snap-start" style={{ width: '75%' }}>
            <PostCarouselCard post={post} />
          </div>
        ))}
      </div>

      {/* Dots */}
      {posts.length > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {posts.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (!scrollRef.current) return;
                const w = scrollRef.current.clientWidth * 0.75;
                scrollRef.current.scrollTo({ left: i * w, behavior: 'smooth' });
              }}
              className={`h-[2px] transition-all duration-300 ${i === activeIndex ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
