"use client";
import { Menu, Search, Zap } from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { useUIStore } from "@/lib/store";

export function Topbar() {
    const { navLayout, setNavLayout } = useUIStore();

    return (
        <header className="sticky top-0 z-50 w-full h-[88px] flex items-center justify-between px-6 lg:px-10 border-b border-white/5 bg-[var(--bg-surface)]/30 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.3)]">

            {/* Massive Desktop Logo & Nav Toggles */}
            <div className="flex items-center gap-6">
                {/* Toggle navigation layout for Futuristic Mode */}
                <div className="hidden lg:flex items-center gap-1 bg-black/20 p-1 rounded-full border border-white/5 backdrop-blur-md shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={() => setNavLayout('side')}
                        className={`p-1.5 rounded-full transition-all ${navLayout === 'side' ? 'bg-[var(--brand-primary)] text-white shadow-[0_0_10px_rgba(255,69,0,0.5)]' : 'text-white/50 hover:text-white'}`}
                        title="Sidebar Only"
                    >
                        <Menu size={14} className="transform rotate-90" />
                    </button>
                    <button
                        onClick={() => setNavLayout('top')}
                        className={`p-1.5 rounded-full transition-all ${navLayout === 'top' ? 'bg-[var(--brand-primary)] text-white shadow-[0_0_10px_rgba(255,69,0,0.5)]' : 'text-white/50 hover:text-white'}`}
                        title="Topbar Only"
                    >
                        <Menu size={14} />
                    </button>
                    <button
                        onClick={() => setNavLayout('both')}
                        className={`p-1.5 rounded-full transition-all ${navLayout === 'both' ? 'bg-[var(--brand-primary)] text-white shadow-[0_0_10px_rgba(255,69,0,0.5)]' : 'text-white/50 hover:text-white'}`}
                        title="Both Navigations"
                    >
                        <Menu size={14} className="transform -rotate-45" />
                    </button>
                </div>

                <Link href="/" className="flex items-center gap-1 hover:scale-105 transition-transform duration-300">
                    <span className="font-logo-yo text-[56px] text-[var(--brand-primary)] drop-shadow-[0_0_15px_rgba(255,69,0,0.8)] leading-none italic">Yo</span>
                    <span className="font-logo-top10 text-lg tracking-[0.2em] text-[var(--text-primary)] mt-3 opacity-90 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">TOP10</span>
                </Link>
            </div>

            {/* Epic Futuristic Search Input Centered */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-auto px-8 relative group">
                <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors duration-500 z-10">
                    <Search size={18} className="animate-pulse group-focus-within:animate-none" />
                </div>
                <input
                    type="text"
                    placeholder="SCAN THE DEBATE GROUND..."
                    className="
             w-full bg-black/30 text-white rounded-full pl-12 pr-6 py-3 
             border border-white/5 outline-none transition-all duration-500
             focus:border-[var(--brand-primary)] focus:bg-black/80 focus:scale-[1.02]
             focus:shadow-[0_0_30px_rgba(255,69,0,0.2),inset_0_0_20px_rgba(255,69,0,0.1)]
             placeholder-white/30 font-mono text-sm tracking-[0.15em]
             backdrop-blur-xl
           "
                />
                {/* Decorative Sweeping Scanner Beam on Focus */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--brand-primary)]/30 to-transparent opacity-0 group-focus-within:opacity-100 group-focus-within:animate-[scan_2s_ease-in-out_infinite] pointer-events-none rounded-full overflow-hidden mx-8" />

                {/* Decorative Neon Slash Targets */}
                <div className="absolute top-1/2 -right-4 w-6 h-[1px] bg-[var(--brand-secondary)] transform -translate-y-1/2 -rotate-45 opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 shadow-[0_0_10px_var(--color-brand-secondary)]" />
                <div className="absolute top-1/2 -left-4 w-6 h-[1px] bg-[var(--brand-primary)] transform -translate-y-1/2 rotate-45 opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 shadow-[0_0_10px_var(--color-brand-primary)]" />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6">
                <div className="hidden lg:block w-32 border border-white/5 rounded-lg p-0.5 bg-black/20 backdrop-blur-md shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                    <ThemeSwitcher />
                </div>

                {/* Fully Glassmorphic Auth Button */}
                <Link
                    href="/login"
                    className="
            hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full font-mono text-sm tracking-[0.2em] font-bold uppercase
            text-[var(--text-primary)] bg-white/5 border border-white/10 backdrop-blur-xl
            shadow-[0_0_15px_rgba(255,69,0,0)] hover:shadow-[0_0_25px_rgba(255,69,0,0.5)]
            hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 hover:text-white
            transition-all duration-300 hover:scale-[1.05] active:scale-95
          "
                >
                    <Zap size={16} className="text-[var(--brand-primary)] drop-shadow-[0_0_8px_rgba(255,69,0,1)]" />
                    <span>Intel</span>
                </Link>

                {/* Mobile Hamburger */}
                <button className="lg:hidden p-2 text-white/70 hover:text-[var(--brand-primary)] transition-colors hover:scale-110 duration-200 drop-shadow-[0_0_8px_rgba(255,69,0,0)] hover:drop-shadow-[0_0_8px_rgba(255,69,0,0.8)]" aria-label="Open Menu">
                    <Menu size={28} />
                </button>
            </div>
        </header>
    );
}
