"use client";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { Home, Users, Flame, Globe } from "lucide-react";
import { usePathname } from "next/navigation";

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex flex-col w-[260px] h-full border-r border-white/5 bg-[var(--bg-surface)]/20 backdrop-blur-2xl px-5 py-6 z-40 relative shadow-[4px_0_24px_rgba(0,0,0,0.15)]">

            {/* Top spacing to account for the lack of logo, aligning the menu nicely */}
            <div className="h-6" />

            <nav className="flex flex-col gap-3">
                <Link href="/" className={`group flex items-center gap-4 px-4 py-3.5 rounded-[calc(var(--radius-ui)/2)] font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 border backdrop-blur-md ${pathname === '/' ? 'bg-white/10 border-white/20 text-white shadow-[inset_2px_0_15px_rgba(255,69,0,0.3)]' : 'bg-transparent border-transparent text-white/50 hover:bg-white/5 hover:text-white hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,69,0,0.1)]'}`}>
                    <Home size={18} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/' ? 'text-[var(--brand-primary)] drop-shadow-[0_0_8px_rgba(255,69,0,0.8)]' : ''}`} />
                    <span>Public Feed</span>
                </Link>

                <Link href="/private" className={`group flex items-center gap-4 px-4 py-3.5 rounded-[calc(var(--radius-ui)/2)] font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 border backdrop-blur-md ${pathname === '/private' ? 'bg-white/10 border-white/20 text-white shadow-[inset_2px_0_15px_rgba(255,69,0,0.3)]' : 'bg-transparent border-transparent text-white/50 hover:bg-white/5 hover:text-white hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,69,0,0.1)]'}`}>
                    <Users size={18} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/private' ? 'text-[var(--brand-primary)] drop-shadow-[0_0_8px_rgba(255,69,0,0.8)]' : ''}`} />
                    <span>Connections</span>
                </Link>

                <Link href="/hot" className={`group flex items-center gap-4 px-4 py-3.5 rounded-[calc(var(--radius-ui)/2)] font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 border backdrop-blur-md ${pathname === '/hot' ? 'bg-white/10 border-white/20 text-white shadow-[inset_2px_0_15px_rgba(255,69,0,0.3)]' : 'bg-transparent border-transparent text-white/50 hover:bg-white/5 hover:text-white hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,69,0,0.1)]'}`}>
                    <Flame size={18} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/hot' ? 'text-[var(--brand-primary)] drop-shadow-[0_0_8px_rgba(255,69,0,0.8)]' : ''}`} />
                    <span>Hot Takes</span>
                </Link>

                <Link href="/communities" className={`group flex items-center gap-4 px-4 py-3.5 rounded-[calc(var(--radius-ui)/2)] font-mono text-sm tracking-[0.15em] font-bold uppercase transition-all duration-300 border backdrop-blur-md ${pathname === '/communities' ? 'bg-white/10 border-white/20 text-white shadow-[inset_2px_0_15px_rgba(255,69,0,0.3)]' : 'bg-transparent border-transparent text-white/50 hover:bg-white/5 hover:text-white hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,69,0,0.1)]'}`}>
                    <Globe size={18} className={`transition-transform duration-300 group-hover:scale-110 ${pathname === '/communities' ? 'text-[var(--brand-primary)] drop-shadow-[0_0_8px_rgba(255,69,0,0.8)]' : ''}`} />
                    <span>Communities</span>
                </Link>
            </nav>

            <div className="mt-auto pt-6 border-t border-white/10">
                <p className="text-xs font-mono text-white/30 mb-4 px-2 tracking-[0.2em] font-bold uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]">Console Theme</p>
                <div className="border border-white/5 rounded-lg p-0.5 bg-black/20 backdrop-blur-md shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                    <ThemeSwitcher />
                </div>
            </div>
        </aside>
    );
}
