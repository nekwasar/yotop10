import Link from 'next/link';
import { Icon } from './icons/Icon';

export function DesktopCta({ className = '' }: { className?: string }) {
  return (
    <section className={`${className}`}>
      <div className="rounded-2xl border border-white/10 bg-black p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10">
          <Icon name="Sparkles" size={22} className="text-white/50" />
        </div>
        <h3 className="ed-headline-sm text-lg font-bold text-white mb-2">Share Your Perspective</h3>
        <p className="ed-body max-w-lg mx-auto mb-6">
          Have a ranking, debate, or fact to share? Submit your post and join a growing community of curators.
        </p>
        <Link
          href="/new"
          className="ed-btn inline-flex items-center gap-2"
        >
          <Icon name="Plus" size={16} />
          Submit a List
        </Link>
      </div>
    </section>
  );
}
