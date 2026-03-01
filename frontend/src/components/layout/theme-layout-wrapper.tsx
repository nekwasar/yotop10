"use client";
import { useTheme } from "next-themes";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { useUIStore } from "@/lib/store";

export function ThemeLayoutWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();
    const navLayout = useUIStore(state => state.navLayout);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent layout shift on initial load by rendering a blank screen or a default skeleton
    if (!mounted) {
        return <div className="min-h-screen bg-[var(--bg-base)]" />;
    }

    // ============================================================================
    // THEME B: RETRO NEWSPAPER (MYSPACE CLONE)
    // Completely different structural layout. No Sidebar. Topbar is built-in blocky.
    // ============================================================================
    if (theme === "retro") {
        return (
            <div className="min-h-screen font-body flex flex-col pt-4 pb-12 px-4 sm:px-8 max-w-5xl mx-auto">
                {/* Retro Header / Nav */}
                <header className="border-4 border-black bg-white p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-5xl font-bold tracking-tighter uppercase mb-1">The Daily Debate</h1>
                        <p className="text-sm font-bold border-t-2 border-black pt-1">YoTop10 • {new Date().toLocaleDateString()} • Public Feed</p>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                        <nav className="flex gap-4 font-bold text-lg underline">
                            <Link href="/">Home</Link>
                            <Link href="/private">Connections</Link>
                            <Link href="/hot">Hot Takes</Link>
                        </nav>
                        <div className="w-32">
                            <ThemeSwitcher />
                        </div>
                    </div>
                </header>

                {/* Retro Main Content Wrapper */}
                <main className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-8">
                    <div className="border-2 border-black p-6 bg-white shadow-[8px_8px_0px_#000]">
                        <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-black">LATEST LISTS</h2>
                        {children}
                    </div>

                    {/* Retro specific Right column (like older blogs) */}
                    <aside className="hidden md:flex flex-col gap-6">
                        <div className="border-2 border-black p-4 bg-white shadow-[8px_8px_0px_#000]">
                            <h3 className="font-bold border-b-2 border-black pb-1 mb-2">Search</h3>
                            <input type="text" className="w-full border-2 border-black p-1" placeholder="Search..." />
                            <button className="mt-2 w-full bg-black text-white font-bold p-1">GO</button>
                        </div>
                    </aside>
                </main>
            </div>
        );
    }

    // ============================================================================
    // THEME A: FUTURISTIC (NEON GLASSMORPHISM)
    // NextGen layout. Full-width topbar + Sidebar. Extreme Sci-Fi Glass styling.
    // ============================================================================
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-500 relative">
            {/* Deep ambient glow layer so background color feels cohesive everywhere */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/5 via-[var(--bg-base)] to-[var(--brand-secondary)]/10 pointer-events-none z-0" />

            {/* Topbar spans full 100vw width and is always visible in Futuristic mode */}
            <div className="relative z-50">
                <Topbar />
            </div>

            <div className="relative flex flex-1 overflow-hidden z-10 w-full">
                <Sidebar />
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {/* Ultra-airy single column constraint */}
                    <main className="w-full max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
