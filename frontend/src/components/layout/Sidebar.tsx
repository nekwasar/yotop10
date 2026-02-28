"use client";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { Home, Users, Flame, Globe, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/lib/store";

export function Sidebar() {
    const pathname = usePathname();
    const { navLayout, setNavLayout } = useUIStore();

    return (
        <aside className="hidden lg:flex flex-col w-[260px] h-full border-r border-(--border-accent) bg-[var(--bg-surface)]/60 backdrop-blur-2xl px-5 py-6 z-40 relative shadow-[4px_0_24px_rgba(0,0,0,0.05)]">

            {/* Top spacing */}
            <div className="h-4" />

            {/* Nav Toggles (Duplicated here so they don't disappear when Topbar is hidden) */}
            <div className="mb-8 flex items-center justify-center gap-1 bg-[var(--bg-base)] p-1 rounded-full border border-(--border-accent) shadow-sm">
                <button
                    onClick={() => setNavLayout('side')}
                    className={`p-1.5 rounded-full transition-all ${navLayout === 'side' ? 'bg-[var(--brand-primary)] text-white shadow-[0_0_10px_rgba(255,69,0,0.5)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                    title="Sidebar Only"
                >
                    <Menu size={14} className="transform rotate-90" />
                </button>
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

            <div className="mt-auto pt-6 border-t border-(--border-accent)">
                <p className="text-xs font-mono text-[var(--text-muted)] mb-4 px-2 tracking-[0.2em] font-bold uppercase">Console Theme</p>
                <div className="border border-(--border-accent) rounded-lg p-0.5 bg-[var(--bg-base)] backdrop-blur-md">
                    <ThemeSwitcher />
                </div>
            </div>
        </aside>
    );
}
