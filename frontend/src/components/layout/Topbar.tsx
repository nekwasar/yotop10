"use client";
import { Menu, Search, User, Home, Users, Flame, Globe } from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { useUIStore } from "@/lib/store";
import { usePathname } from "next/navigation";

export function Topbar() {
    const { navLayout, setNavLayout } = useUIStore();
    const pathname = usePathname();

    return (
        <div className="sticky top-0 z-50 flex flex-col w-full">
            <header className="w-full h-[88px] flex items-center justify-between px-6 lg:px-10 border-b border-(--border-accent) bg-[var(--bg-surface)]/60 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative z-20">

                <div className="flex items-center gap-6">
                    {/* Toggle navigation layout for Futuristic Mode */}
                    <div className="hidden lg:flex items-center gap-1 bg-[var(--bg-base)] p-1 rounded-full border border-(--border-accent) shadow-sm">
                        <button
                            onClick={() => setNavLayout('top')}
                            className={`p-1.5 rounded-full transition-all ${navLayout === 'top' ? 'bg-[var(--brand-primary)] text-white shadow-[0_0_10px_rgba(255,69,0,0.5)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            title="Topbar Only"
                        >
                            <Menu size={14} />
                        </button>
                        <button
                            onClick={() => setNavLayout('both')}
                            className={`p-1.5 rounded-full transition-all ${navLayout === 'both' ? 'bg-[var(--brand-primary)] text-white shadow-[0_0_10px_rgba(255,69,0,0.5)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            title="Both Navigations"
                        >
                            <Menu size={14} className="transform -rotate-45" />
                        </button>
                    </div>

                    <Link href="/" className="flex items-center gap-1 hover:scale-105 transition-transform duration-300">
                        <span className="font-logo-yo text-[56px] text-[var(--brand-primary)] drop-shadow-[0_0_15px_rgba(255,69,0,0.8)] leading-none italic">Yo</span>
                        <span className="font-logo-top10 text-lg tracking-[0.2em] text-[var(--text-primary)] mt-3 opacity-90">TOP10</span>
                    </Link>
                </div>

                <div className="hidden md:flex flex-1 max-w-2xl mx-auto px-8 relative group">
                    <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors duration-500 z-10">
                        <Search size={18} className="animate-pulse group-focus-within:animate-none" />
                    </div>
                    <input
                        type="text"
                        placeholder="SEARCH THE GRID..."
                        className="
                w-full bg-[var(--bg-base)] text-[var(--text-primary)] rounded-full pl-12 pr-6 py-3 
                border border-(--border-accent) outline-none transition-all duration-500
                focus:border-[var(--brand-primary)] focus:bg-[var(--bg-surface)] focus:scale-[1.02]
                focus:shadow-[0_0_30px_rgba(255,69,0,0.2),inset_0_0_20px_rgba(255,69,0,0.1)]
                placeholder-[var(--text-muted)] font-mono text-sm tracking-[0.15em]
                backdrop-blur-xl
            "
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--brand-primary)]/10 to-transparent opacity-0 group-focus-within:opacity-100 group-focus-within:animate-[scan_2s_ease-in-out_infinite] pointer-events-none rounded-full overflow-hidden mx-8" />

                    <div className="absolute top-1/2 -right-4 w-6 h-[1px] bg-[var(--brand-secondary)] transform -translate-y-1/2 -rotate-45 opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 shadow-[0_0_10px_var(--color-brand-secondary)]" />
                    <div className="absolute top-1/2 -left-4 w-6 h-[1px] bg-[var(--brand-primary)] transform -translate-y-1/2 rotate-45 opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 shadow-[0_0_10px_var(--color-brand-primary)]" />
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden lg:block w-32 border border-(--border-accent) rounded-lg p-0.5 bg-[var(--bg-base)] backdrop-blur-md">
                        <ThemeSwitcher />
                    </div>

                    <Link
                        href="/login"
                        className="
                hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full font-mono text-sm tracking-[0.2em] font-bold uppercase
                text-[var(--text-primary)] bg-[var(--bg-surface)] border border-(--border-accent) backdrop-blur-xl
                shadow-[0_0_15px_rgba(255,69,0,0)] hover:shadow-[0_0_25px_rgba(255,69,0,0.5)]
                hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10
                transition-all duration-300 hover:scale-[1.05] active:scale-95 no-underline
            "
                    >
                        <User size={16} className="text-[var(--brand-primary)] drop-shadow-[0_0_8px_rgba(255,69,0,1)]" />
                        <span>Sign in</span>
                    </Link>

                    <button className="lg:hidden p-2 text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors hover:scale-110 duration-200" aria-label="Open Menu">
                        <Menu size={28} />
                    </button>
                </div>
            </header>

            {/* Secondary Nav Bar when Topbar Only is selected */}
            {navLayout === 'top' && (
                <nav className="w-full border-b border-(--border-accent) bg-[var(--bg-surface)]/40 backdrop-blur-2xl px-6 lg:px-10 py-3 flex items-center justify-center gap-8 relative z-10 animate-in slide-in-from-top-12 duration-300">
                    <Link href="/" className={`no-underline flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs tracking-widest font-bold uppercase transition-all duration-300 ${pathname === '/' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)] border border-transparent'}`}>
                        <Home size={14} className={pathname === '/' ? '' : 'opacity-70'} />
                        <span>Public Feed</span>
                    </Link>
                    <Link href="/private" className={`no-underline flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs tracking-widest font-bold uppercase transition-all duration-300 ${pathname === '/private' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)] border border-transparent'}`}>
                        <Users size={14} className={pathname === '/private' ? '' : 'opacity-70'} />
                        <span>Connections</span>
                    </Link>
                    <Link href="/hot" className={`no-underline flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs tracking-widest font-bold uppercase transition-all duration-300 ${pathname === '/hot' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)] border border-transparent'}`}>
                        <Flame size={14} className={pathname === '/hot' ? '' : 'opacity-70'} />
                        <span>Hot Takes</span>
                    </Link>
                    <Link href="/communities" className={`no-underline flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs tracking-widest font-bold uppercase transition-all duration-300 ${pathname === '/communities' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30' : 'bg-transparent text-[var(--text-muted)] hover:bg-black/20 hover:text-[var(--text-primary)] border border-transparent'}`}>
                        <Globe size={14} className={pathname === '/communities' ? '' : 'opacity-70'} />
                        <span>Communities</span>
                    </Link>
                </nav>
            )}
        </div>
    );
}
