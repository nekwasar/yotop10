"use client";
import Link from "next/link";
import { Home, Users, Flame, Globe, TrendingUp, Crown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/lib/store";

export function Sidebar() {
    const pathname = usePathname();
    const navLayout = useUIStore(state => state.navLayout);

    return (
        <aside className="hidden lg:flex flex-col w-[300px] h-full z-40 relative py-8 gap-8 pr-4 overflow-y-auto">

            {/* Top Block: Primary Navigation */}
            {navLayout === 'both' && (
                <nav className="flex flex-col gap-2 bg-[var(--bg-surface)] backdrop-blur-3xl px-4 py-6 rounded-r-3xl border border-l-0 border-(--border-accent) shadow-[8px_0_30px_rgba(0,0,0,0.1)]">
                    <Link href="/" className={`no-underline group flex items-center gap-4 px-4 py-4 rounded-2xl font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 ${pathname === '/' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)]'}`}>
                        <Home size={20} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/' ? '' : 'opacity-70'}`} />
                        <span>Public Feed</span>
                    </Link>

                    <Link href="/private" className={`no-underline group flex items-center gap-4 px-4 py-4 rounded-2xl font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 ${pathname === '/private' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)]'}`}>
                        <Users size={20} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/private' ? '' : 'opacity-70'}`} />
                        <span>Connections</span>
                    </Link>

                    <Link href="/hot" className={`no-underline group flex items-center gap-4 px-4 py-4 rounded-2xl font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 ${pathname === '/hot' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)]'}`}>
                        <Flame size={20} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/hot' ? '' : 'opacity-70'}`} />
                        <span>Hot Takes</span>
                    </Link>

                    <Link href="/communities" className={`no-underline group flex items-center gap-4 px-4 py-4 rounded-2xl font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 ${pathname === '/communities' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)]'}`}>
                        <Globe size={20} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/communities' ? '' : 'opacity-70'}`} />
                        <span>Communities</span>
                    </Link>
                </nav>
            )}

            {/* Bottom Block: Trending / Top Creators Column */}
            <div className={`flex flex-col gap-6 bg-[var(--bg-surface)] backdrop-blur-3xl px-4 py-6 rounded-r-3xl border border-l-0 border-(--border-accent) shadow-[8px_0_30px_rgba(0,0,0,0.1)] mb-8 ${navLayout === 'top' ? 'mt-0' : ''}`}>

                {/* Trending Debates (X/Twitter Style) */}
                <div className="flex flex-col">
                    <div className="px-4 mb-4">
                        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">What&apos;s trending</h2>
                    </div>

                    <div className="flex flex-col">
                        <Link href="/search?q=AI" className="no-underline flex flex-col gap-1 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex justify-between items-center text-[13px] text-[var(--text-muted)]">
                                <span>1 • Technology • Trending</span>
                                <span className="text-[15px] leading-none tracking-widest cursor-pointer hover:bg-[var(--brand-primary)]/20 hover:text-[var(--brand-primary)] rounded-full w-6 h-6 flex items-center justify-center transition-colors">...</span>
                            </div>
                            <span className="text-[15px] font-bold text-[var(--text-primary)] mt-0.5">Top 10 AI Milestones</span>
                            <span className="text-[13px] text-[var(--text-muted)]">125K posts</span>
                        </Link>

                        <Link href="/search?q=Gaming" className="no-underline flex flex-col gap-1 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex justify-between items-center text-[13px] text-[var(--text-muted)]">
                                <span>2 • Gaming • Trending</span>
                                <span className="text-[15px] leading-none tracking-widest cursor-pointer hover:bg-[var(--brand-primary)]/20 hover:text-[var(--brand-primary)] rounded-full w-6 h-6 flex items-center justify-center transition-colors">...</span>
                            </div>
                            <span className="text-[15px] font-bold text-[var(--text-primary)] mt-0.5">Best Games of 2026</span>
                            <span className="text-[13px] text-[var(--text-muted)]">84.2K posts</span>
                        </Link>

                        <Link href="/search?q=Movies" className="no-underline flex flex-col gap-1 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex justify-between items-center text-[13px] text-[var(--text-muted)]">
                                <span>3 • Entertainment • Trending</span>
                                <span className="text-[15px] leading-none tracking-widest cursor-pointer hover:bg-[var(--brand-primary)]/20 hover:text-[var(--brand-primary)] rounded-full w-6 h-6 flex items-center justify-center transition-colors">...</span>
                            </div>
                            <span className="text-[15px] font-bold text-[var(--text-primary)] mt-0.5">Worst Sequels Ever Made</span>
                            <span className="text-[13px] text-[var(--text-muted)]">45.8K posts</span>
                        </Link>
                    </div>
                    <Link href="/trends" className="px-4 py-4 text-[15px] text-[var(--brand-primary)] hover:bg-white/5 transition-colors rounded-b-xl">
                        Show more
                    </Link>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-(--border-accent) to-transparent opacity-30" />

                {/* Top Creators (Who to follow style) */}
                <div className="flex flex-col">
                    <div className="px-4 mb-4">
                        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Top Creators</h2>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)] flex items-center justify-center text-white font-bold shrink-0">
                                    N
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[15px] font-bold text-[var(--text-primary)] hover:underline truncate max-w-[120px]">Neo Matrix</span>
                                    <span className="text-[15px] text-[var(--text-muted)] truncate max-w-[120px]">@the_one</span>
                                </div>
                            </div>
                            <button className="bg-white text-black font-bold text-sm px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors">
                                Follow
                            </button>
                        </div>

                        <div className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--brand-secondary)] flex items-center justify-center text-white font-bold shrink-0">
                                    T
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[15px] font-bold text-[var(--text-primary)] hover:underline truncate max-w-[120px]">Trinity</span>
                                    <span className="text-[15px] text-[var(--text-muted)] truncate max-w-[120px]">@trinity_core</span>
                                </div>
                            </div>
                            <button className="bg-white text-black font-bold text-sm px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors">
                                Follow
                            </button>
                        </div>
                    </div>
                    <Link href="/creators" className="px-4 py-4 text-[15px] text-[var(--brand-primary)] hover:bg-white/5 transition-colors rounded-b-xl">
                        Show more
                    </Link>
                </div>

            </div>
        </aside>
    );
}
