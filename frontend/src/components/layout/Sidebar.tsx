"use client";
import Link from "next/link";
import { Home, Users, Flame, Globe } from "lucide-react";
import { usePathname } from "next/navigation";

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex flex-col w-[260px] h-full border-r border-(--border-accent) bg-[var(--bg-surface)]/60 backdrop-blur-2xl px-5 py-6 z-40 relative shadow-[4px_0_24px_rgba(0,0,0,0.05)]">

            {/* Top spacing */}
            <div className="h-4" />

            {/* Top Half: Primary Navigation */}
            <nav className="flex flex-col gap-3">
                <Link href="/" className={`no-underline group flex items-center gap-4 px-4 py-3.5 rounded-[calc(var(--radius-ui)/2)] font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 border backdrop-blur-md ${pathname === '/' ? 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/30 text-[var(--brand-primary)] shadow-[inset_2px_0_15px_rgba(255,69,0,0.1)]' : 'bg-transparent border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-base)] hover:text-[var(--text-primary)] hover:border-(--border-accent)'}`}>
                    <Home size={18} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/' ? 'text-[var(--brand-primary)] drop-shadow-[0_0_8px_rgba(255,69,0,0.6)]' : ''}`} />
                    <span>Public Feed</span>
                </Link>

                <Link href="/private" className={`no-underline group flex items-center gap-4 px-4 py-3.5 rounded-[calc(var(--radius-ui)/2)] font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 border backdrop-blur-md ${pathname === '/private' ? 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/30 text-[var(--brand-primary)] shadow-[inset_2px_0_15px_rgba(255,69,0,0.1)]' : 'bg-transparent border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-base)] hover:text-[var(--text-primary)] hover:border-(--border-accent)'}`}>
                    <Users size={18} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/private' ? 'text-[var(--brand-primary)] drop-shadow-[0_0_8px_rgba(255,69,0,0.6)]' : ''}`} />
                    <span>Connections</span>
                </Link>

                <Link href="/hot" className={`no-underline group flex items-center gap-4 px-4 py-3.5 rounded-[calc(var(--radius-ui)/2)] font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 border backdrop-blur-md ${pathname === '/hot' ? 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/30 text-[var(--brand-primary)] shadow-[inset_2px_0_15px_rgba(255,69,0,0.1)]' : 'bg-transparent border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-base)] hover:text-[var(--text-primary)] hover:border-(--border-accent)'}`}>
                    <Flame size={18} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/hot' ? 'text-[var(--brand-primary)] drop-shadow-[0_0_8px_rgba(255,69,0,0.6)]' : ''}`} />
                    <span>Hot Takes</span>
                </Link>

                <Link href="/communities" className={`no-underline group flex items-center gap-4 px-4 py-3.5 rounded-[calc(var(--radius-ui)/2)] font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 border backdrop-blur-md ${pathname === '/communities' ? 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/30 text-[var(--brand-primary)] shadow-[inset_2px_0_15px_rgba(255,69,0,0.1)]' : 'bg-transparent border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-base)] hover:text-[var(--text-primary)] hover:border-(--border-accent)'}`}>
                    <Globe size={18} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/communities' ? 'text-[var(--brand-primary)] drop-shadow-[0_0_8px_rgba(255,69,0,0.6)]' : ''}`} />
                    <span>Communities</span>
                </Link>
            </nav>

            {/* Bottom Half: Discovery Modules */}
            <div className="mt-auto flex flex-col gap-8 pt-6 border-t border-(--border-accent)">

                {/* Trending Debates */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-mono text-[var(--brand-secondary)] px-2 tracking-[0.2em] font-bold uppercase flex items-center gap-2 drop-shadow-[0_0_5px_rgba(255,0,128,0.5)]">
                        <Flame size={14} />
                        Trending Debates
                    </h3>
                    <div className="flex flex-col gap-2">
                        <Link href="#" className="no-underline text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 line-clamp-2 leading-relaxed transition-colors hover:translate-x-1 duration-200">
                            <span className="text-[var(--brand-secondary)] font-mono mr-2">01</span>
                            Does AGI require consciousness?
                        </Link>
                        <Link href="#" className="no-underline text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 line-clamp-2 leading-relaxed transition-colors hover:translate-x-1 duration-200">
                            <span className="text-[var(--brand-secondary)] font-mono mr-2">02</span>
                            Cyberpunk vs Steampunk aesthetics
                        </Link>
                        <Link href="#" className="no-underline text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 line-clamp-2 leading-relaxed transition-colors hover:translate-x-1 duration-200">
                            <span className="text-[var(--brand-secondary)] font-mono mr-2">03</span>
                            Is TypeScript strictly better than JS?
                        </Link>
                    </div>
                </div>

                {/* Top Authors */}
                <div className="flex flex-col gap-3 mb-2">
                    <h3 className="text-xs font-mono text-[var(--brand-primary)] px-2 tracking-[0.2em] font-bold uppercase flex items-center gap-2 drop-shadow-[0_0_5px_rgba(255,69,0,0.5)]">
                        <Users size={14} />
                        Top Authors
                    </h3>
                    <div className="flex flex-col gap-3">
                        <Link href="/profile/neo" className="no-underline flex items-center gap-3 px-2 group">
                            <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)]/20 border border-[var(--brand-primary)]/50 flex items-center justify-center text-[var(--brand-primary)] font-bold text-xs group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,69,0,0.2)]">
                                N
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">Neo_Matrix</span>
                                <span className="text-xs text-[var(--text-muted)] font-mono">15K REP</span>
                            </div>
                        </Link>

                        <Link href="/profile/trinity" className="no-underline flex items-center gap-3 px-2 group">
                            <div className="w-8 h-8 rounded-full bg-[var(--brand-secondary)]/20 border border-[var(--brand-secondary)]/50 flex items-center justify-center text-[var(--brand-secondary)] font-bold text-xs group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,0,128,0.2)]">
                                T
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-secondary)] transition-colors">Trinity_Core</span>
                                <span className="text-xs text-[var(--text-muted)] font-mono">12K REP</span>
                            </div>
                        </Link>
                    </div>
                </div>

            </div>
        </aside>
    );
}
