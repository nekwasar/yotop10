"use client";
import Link from "next/link";
import { Home, Users, Flame, Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/lib/store";

export function Sidebar() {
    const pathname = usePathname();
    const navLayout = useUIStore(state => state.navLayout);

    // If both layout is on, we shrink the discovery col by hiding the 3rd item
    const isBoth = navLayout === 'both';

    return (
        <aside className="hidden lg:flex flex-col w-[300px] h-full z-40 relative py-8 gap-6 pr-4">
            {/* Top Block: Primary Navigation */}
            {isBoth && (
                <nav className="flex flex-col gap-1 bg-[var(--bg-surface)] backdrop-blur-3xl px-4 py-4 rounded-r-3xl border border-l-0 border-(--border-accent) shadow-[8px_0_30px_rgba(0,0,0,0.1)]">
                    <Link href="/" className={`no-underline group flex items-center gap-4 px-4 py-3 rounded-2xl font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 ${pathname === '/' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)]'}`}>
                        <Home size={20} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/' ? '' : 'opacity-70'}`} />
                        <span>Public Feed</span>
                    </Link>

                    <Link href="/private" className={`no-underline group flex items-center gap-4 px-4 py-3 rounded-2xl font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 ${pathname === '/private' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)]'}`}>
                        <Users size={20} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/private' ? '' : 'opacity-70'}`} />
                        <span>Connections</span>
                    </Link>

                    <Link href="/hot" className={`no-underline group flex items-center gap-4 px-4 py-3 rounded-2xl font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 ${pathname === '/hot' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)]'}`}>
                        <Flame size={20} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/hot' ? '' : 'opacity-70'}`} />
                        <span>Hot Takes</span>
                    </Link>

                    <Link href="/communities" className={`no-underline group flex items-center gap-4 px-4 py-3 rounded-2xl font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 ${pathname === '/communities' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)]'}`}>
                        <Globe size={20} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/communities' ? '' : 'opacity-70'}`} />
                        <span>Communities</span>
                    </Link>
                </nav>
            )}

            {/* Bottom Block: Trending / Top Creators Column */}
            <div className={`flex flex-col gap-4 bg-[var(--bg-surface)] backdrop-blur-3xl px-4 py-5 rounded-r-3xl border border-l-0 border-(--border-accent) shadow-[8px_0_30px_rgba(0,0,0,0.1)] mb-8 ${!isBoth ? 'mt-0 py-6 gap-6' : ''}`}>

                {/* Trending Debates (X/Twitter Style) */}
                <div className="flex flex-col">
                    <div className="px-4 mb-2">
                        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">What&apos;s trending</h2>
                    </div>

                    <div className="flex flex-col">
                        <Link href="/search?q=AI" className="no-underline flex flex-col gap-0.5 px-4 py-2 hover:bg-[var(--bg-base)] transition-colors cursor-pointer rounded-xl">
                            <div className="flex justify-between items-center text-[12px] text-[var(--text-muted)]">
                                <span>1 • Technology • Trending</span>
                                <span className="text-[15px] leading-none tracking-widest cursor-pointer hover:bg-[var(--brand-primary)]/20 hover:text-[var(--brand-primary)] rounded-full w-6 h-6 flex items-center justify-center transition-colors">...</span>
                            </div>
                            <span className="text-[14px] sm:text-[15px] font-bold text-[var(--text-primary)]">Top 10 AI Milestones</span>
                            <span className="text-[12px] sm:text-[13px] text-[var(--text-muted)]">125K posts</span>
                        </Link>

                        <Link href="/search?q=Gaming" className="no-underline flex flex-col gap-0.5 px-4 py-2 hover:bg-[var(--bg-base)] transition-colors cursor-pointer rounded-xl">
                            <div className="flex justify-between items-center text-[12px] text-[var(--text-muted)]">
                                <span>2 • Gaming • Trending</span>
                                <span className="text-[15px] leading-none tracking-widest cursor-pointer hover:bg-[var(--brand-primary)]/20 hover:text-[var(--brand-primary)] rounded-full w-6 h-6 flex items-center justify-center transition-colors">...</span>
                            </div>
                            <span className="text-[14px] sm:text-[15px] font-bold text-[var(--text-primary)]">Best Games of 2026</span>
                            <span className="text-[12px] sm:text-[13px] text-[var(--text-muted)]">84.2K posts</span>
                        </Link>

                        {!isBoth && ( // Hides 3rd trending if nav is "both" to save space
                            <Link href="/search?q=Movies" className="no-underline flex flex-col gap-0.5 px-4 py-2 hover:bg-[var(--bg-base)] transition-colors cursor-pointer rounded-xl">
                                <div className="flex justify-between items-center text-[12px] text-[var(--text-muted)]">
                                    <span>3 • Entertainment • Trending</span>
                                    <span className="text-[15px] leading-none tracking-widest cursor-pointer hover:bg-[var(--brand-primary)]/20 hover:text-[var(--brand-primary)] rounded-full w-6 h-6 flex items-center justify-center transition-colors">...</span>
                                </div>
                                <span className="text-[14px] sm:text-[15px] font-bold text-[var(--text-primary)]">Worst Sequels Ever</span>
                                <span className="text-[12px] sm:text-[13px] text-[var(--text-muted)]">45.8K posts</span>
                            </Link>
                        )}
                    </div>
                    <Link href="/trends" className="px-4 py-2 text-[14px] text-[var(--brand-primary)] hover:bg-[var(--bg-base)] transition-colors rounded-xl font-bold mt-1">
                        Show more
                    </Link>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-(--border-accent) to-transparent opacity-30" />

                {/* Top Creators (Who to follow style) */}
                <div className="flex flex-col">
                    <div className="px-4 mb-2">
                        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Top Creators</h2>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between px-4 py-2 hover:bg-[var(--bg-base)] transition-colors cursor-pointer rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[var(--brand-primary)] flex items-center justify-center text-white font-bold shrink-0">
                                    N
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[14px] sm:text-[15px] font-bold text-[var(--text-primary)] hover:underline truncate max-w-[100px]">Neo Matrix</span>
                                    <span className="text-[12px] sm:text-[14px] text-[var(--text-muted)] truncate max-w-[100px]">@the_one</span>
                                </div>
                            </div>
                            <button className="bg-[var(--text-primary)] text-[var(--bg-base)] font-bold text-[13px] px-3 sm:px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                                Follow
                            </button>
                        </div>

                        {!isBoth && ( // Hides 2nd creator if nav is "both" to save space
                            <div className="flex items-center justify-between px-4 py-2 hover:bg-[var(--bg-base)] transition-colors cursor-pointer rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[var(--brand-secondary)] flex items-center justify-center text-white font-bold shrink-0">
                                        T
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] sm:text-[15px] font-bold text-[var(--text-primary)] hover:underline truncate max-w-[100px]">Trinity</span>
                                        <span className="text-[12px] sm:text-[14px] text-[var(--text-muted)] truncate max-w-[100px]">@trinity_core</span>
                                    </div>
                                </div>
                                <button className="bg-[var(--text-primary)] text-[var(--bg-base)] font-bold text-[13px] px-3 sm:px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                                    Follow
                                </button>
                            </div>
                        )}
                    </div>
                    <Link href="/creators" className="px-4 py-2 text-[14px] text-[var(--brand-primary)] hover:bg-[var(--bg-base)] transition-colors rounded-xl font-bold mt-1">
                        Show more
                    </Link>
                </div>

            </div>
        </aside>
    );
}
