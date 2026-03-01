"use client";
import Link from "next/link";
import { Home, Users, Flame, Globe, Activity, Fingerprint } from "lucide-react";
import { usePathname } from "next/navigation";

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex flex-col w-[260px] h-full z-40 relative py-8 gap-16 justify-between pr-4">

            {/* Top Block: Primary Navigation (Cuts off cleanly) */}
            <nav className="flex flex-col gap-2 bg-[var(--bg-surface)] backdrop-blur-3xl px-4 py-8 rounded-r-3xl border border-l-0 border-(--border-accent) shadow-[8px_0_30px_rgba(0,0,0,0.1)]">
                <Link href="/" className={`no-underline group flex items-center gap-4 px-4 py-4 rounded-2xl font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 ${pathname === '/' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)]'}`}>
                    <Home size={18} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/' ? '' : 'opacity-70'}`} />
                    <span>Public Feed</span>
                </Link>

                <Link href="/private" className={`no-underline group flex items-center gap-4 px-4 py-4 rounded-2xl font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 ${pathname === '/private' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)]'}`}>
                    <Users size={18} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/private' ? '' : 'opacity-70'}`} />
                    <span>Connections</span>
                </Link>

                <Link href="/hot" className={`no-underline group flex items-center gap-4 px-4 py-4 rounded-2xl font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 ${pathname === '/hot' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)]'}`}>
                    <Flame size={18} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/hot' ? '' : 'opacity-70'}`} />
                    <span>Hot Takes</span>
                </Link>

                <Link href="/communities" className={`no-underline group flex items-center gap-4 px-4 py-4 rounded-2xl font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 ${pathname === '/communities' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)]'}`}>
                    <Globe size={18} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/communities' ? '' : 'opacity-70'}`} />
                    <span>Communities</span>
                </Link>
            </nav>

            {/* Bottom Block: Minimalist Sci-Fi Telemetry (Trending / Active Nodes) */}
            <div className="flex flex-col gap-8 bg-[var(--bg-surface)] backdrop-blur-3xl px-4 py-8 rounded-r-3xl border border-l-0 border-(--border-accent) shadow-[8px_0_30px_rgba(0,0,0,0.1)] mb-4">

                {/* Trending Vectors (No glow, no numbers, pure sci-fi telemetry UI) */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-2 mb-2">
                        <Activity size={14} className="text-[var(--text-muted)]" />
                        <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-[var(--text-muted)]">Active Vectors</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Link href="#" className="no-underline group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/20 transition-all duration-300">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-secondary)] opacity-50 group-hover:opacity-100 group-hover:scale-150 transition-all" />
                                <span className="text-xs font-mono tracking-widest text-[var(--text-primary)] truncate opacity-80 group-hover:opacity-100">AGI CONSCIOUSNESS</span>
                            </div>
                        </Link>

                        <Link href="#" className="no-underline group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/20 transition-all duration-300">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] opacity-50 group-hover:opacity-100 group-hover:scale-150 transition-all" />
                                <span className="text-xs font-mono tracking-widest text-[var(--text-primary)] truncate opacity-80 group-hover:opacity-100">NEURAL ARCHITECTURES</span>
                            </div>
                        </Link>

                        <Link href="#" className="no-underline group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/20 transition-all duration-300">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-30 group-hover:opacity-100 group-hover:scale-150 transition-all" />
                                <span className="text-xs font-mono tracking-widest text-[var(--text-primary)] truncate opacity-80 group-hover:opacity-100">TYPESCRIPT VS JS</span>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-(--border-accent) to-transparent opacity-50" />

                {/* Top Nodes (Minimalist Data Readout) */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-2 mb-2">
                        <Fingerprint size={14} className="text-[var(--text-muted)]" />
                        <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-[var(--text-muted)]">Prime Nodes</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Link href="/profile/neo" className="no-underline group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/20 transition-all duration-300">
                            <span className="text-xs font-mono font-bold tracking-widest text-[var(--text-primary)] opacity-80 group-hover:opacity-100 transition-opacity">SYS.NEO</span>
                            <div className="flex items-center gap-2">
                                <div className="h-0.5 w-6 bg-[var(--brand-primary)] opacity-40 group-hover:w-10 group-hover:opacity-100 transition-all duration-500" />
                            </div>
                        </Link>

                        <Link href="/profile/trinity" className="no-underline group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/20 transition-all duration-300">
                            <span className="text-xs font-mono font-bold tracking-widest text-[var(--text-primary)] opacity-80 group-hover:opacity-100 transition-opacity">NET.TRINITY</span>
                            <div className="flex items-center gap-2">
                                <div className="h-0.5 w-4 bg-[var(--brand-secondary)] opacity-40 group-hover:w-8 group-hover:opacity-100 transition-all duration-500" />
                            </div>
                        </Link>
                    </div>
                </div>

            </div>
        </aside>
    );
}
