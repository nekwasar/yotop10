"use client";
import { useTheme } from "next-themes";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";

export function ThemeLayoutWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent layout shift on initial load by rendering a blank screen or a default skeleton
    if (!mounted) {
        return <div className="min-h-screen bg-[var(--bg-base)]" />;
    }

    const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'].some(p => pathname?.startsWith(p));
    const isSignup = pathname?.startsWith('/signup');

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
                        <Link href="/" className="no-underline text-black" style={{ textDecoration: 'none' }}>
                            <h1 className="text-5xl font-black tracking-tighter uppercase mb-1 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)] hover:opacity-80 transition-opacity duration-200" style={{ textDecoration: 'none' }}>The Daily Debate</h1>
                        </Link>
                        <p className="text-sm font-bold border-t-2 border-black pt-1">YoTop10 • {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                        <nav className="flex flex-wrap gap-4 font-bold text-base uppercase tracking-widest text-black">
                            <Link href="/" className="hover:opacity-70 transition-opacity duration-150">Home</Link>
                            <Link href="/private" className="hover:opacity-70 transition-opacity duration-150">Connections</Link>
                            <Link href="/hot" className="hover:opacity-70 transition-opacity duration-150">Hot Takes</Link>
                            <Link href="/communities" className="hover:opacity-70 transition-opacity duration-150">Communities</Link>
                        </nav>
                        <div className="flex items-center gap-2 mt-2">
                            <Link href="/login" title="Sign In" className="w-10 h-10 border-4 border-black bg-white flex items-center justify-center text-black shadow-[4px_4px_0px_#000]">
                                <User size={20} className="font-bold" />
                            </Link>
                            <div className="w-32 border-4 border-black bg-white font-bold p-0.5 shadow-[4px_4px_0px_#000] text-black">
                                <ThemeSwitcher />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Retro Main Content Wrapper */}
                <main className={`grid gap-8 ${isAuthPage ? 'grid-cols-1 max-w-3xl mx-auto w-full' : 'grid-cols-1 md:grid-cols-[1fr_250px]'}`}>
                    <div className="border-4 border-black p-8 bg-white shadow-[8px_8px_0px_#000] text-black min-h-[600px]">
                        <h2 className="text-3xl font-black mb-6 pb-2 border-b-4 border-black uppercase tracking-widest text-black">
                            {isAuthPage ? "Authentication" : "Main terminal"}
                        </h2>
                        {children}
                    </div>

                    {/* Retro specific Right column (like older blogs) */}
                    {!isAuthPage && (
                        <aside className="hidden md:flex flex-col gap-6">
                            <div className="border-4 border-black p-4 bg-white shadow-[8px_8px_0px_#000] text-black">
                                <h3 className="font-black text-xl border-b-4 border-black pb-1 mb-2 uppercase text-black">Search</h3>
                                <input type="text" className="w-full border-2 border-black p-2 font-mono font-bold placeholder-gray-500 text-black bg-white outline-none" placeholder="Keywords..." />
                                <button className="mt-4 w-full bg-black text-white font-black uppercase tracking-widest p-2">GO</button>
                            </div>
                        </aside>
                    )}
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
                {!isAuthPage ? (
                    <Sidebar />
                ) : (
                    <aside className="hidden lg:flex flex-col w-[350px] xl:w-[450px] h-full z-40 py-16 pl-12 pr-6 justify-center shrink-0 animate-in slide-in-from-left-8 duration-700">
                        <div className="relative w-full aspect-[4/5] rounded-[30px] overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.05)] border border-white/10 group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
                            <img
                                src={isSignup ? "/images/auth/signup.jpg" : "/images/auth/login.jpg"}
                                alt="Welcome to YoTop10"
                                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                            />
                            <div className="absolute bottom-8 left-8 right-8 z-20 transition-transform duration-700 group-hover:translate-y-[-5px]">
                                <h2 className="text-3xl font-black tracking-widest uppercase text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                                    {isSignup ? "Join the Grid." : "Welcome Back."}
                                </h2>
                                <p className="font-mono text-sm text-white/90 mt-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    Authenticate your identity to proceed safely.
                                </p>
                            </div>
                        </div>
                    </aside>
                )}

                <div className="flex-1 overflow-y-auto overflow-x-hidden pt-8">
                    {/* Width logic: If Auth pg, slightly tighter constraint so the form floats nice in the remaining flexible screen space */}
                    <main className={`w-full mx-auto px-4 pb-12 sm:px-6 lg:px-8 flex ${isAuthPage ? 'max-w-6xl justify-center lg:justify-start lg:ml-4' : 'max-w-5xl'}`}>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
