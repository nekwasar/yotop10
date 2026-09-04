import Link from 'next/link';

export function DesktopCta({ className = '' }: { className?: string }) {
  return (
    <section className={className}>
      <div className="border border-white/[0.06] py-16 px-8 text-center">
        <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.15em] mb-4">Contribute — add post</p>
        <h3 className="text-[28px] font-bold text-white leading-tight mb-3 max-w-lg mx-auto">
          Share your ranking with the world
        </h3>
        <p className="text-[14px] text-zinc-500 mb-2 max-w-md mx-auto leading-relaxed">
          Submit a list, start a debate, or drop a fact. Join a community of curators building the open catalog.
        </p>
        <p className="text-[11px] text-zinc-500 mb-8">add post — create your first list in seconds</p>
        <Link
          href="/new"
          className="inline-flex items-center justify-center px-8 py-3 bg-white text-black text-[11px] font-bold uppercase tracking-[0.1em] hover:opacity-85 transition-opacity"
        >
          add post
        </Link>
      </div>
    </section>
  );
}
