import { Menu, Search, User } from "lucide-react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";

export function Topbar() {
    return (
        <header className="sticky top-0 z-50 w-full h-[72px] flex items-center justify-between px-6 lg:px-10 border-b border-white/5 bg-[var(--bg-base)]/60 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--bg-base)]/40 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">

            {/* Mobile Branding (Hidden on Desktop since Sidebar has it) */}
            <div className="lg:hidden flex items-center gap-1">
                <span className="font-logo-yo text-2xl text-[var(--brand-primary)] drop-shadow-[0_0_8px_rgba(255,69,0,0.8)]">Yo</span>
                <span className="font-logo-top10 text-xl tracking-widest text-[var(--text-primary)]">TOP10</span>
            </div>

            {/* Futuristic Search Input Centered */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-auto px-8 relative group">
                <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors duration-300">
                    <Search size={16} />
                </div>
                <input
                    type="text"
                    placeholder="Search the debate ground..."
                    className="
             w-full bg-black/20 text-white rounded-full pl-12 pr-6 py-2.5 
             border border-white/10 outline-none transition-all duration-300
             focus:border-[var(--brand-primary)] focus:bg-black/40
             focus:shadow-[0_0_20px_rgba(255,69,0,0.15),inset_0_0_10px_rgba(255,69,0,0.1)]
             placeholder-white/30 font-mono text-sm tracking-wide
           "
                />
                {/* Decorative Neon Slash */}
                <div className="absolute top-1/2 -right-2 w-4 h-[1px] bg-[var(--brand-secondary)] transform -translate-y-1/2 rotate-45 opacity-0 group-focus-within:opacity-100 transition-opacity" />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
                {/* Only show theme switcher in topbar on mobile, otherwise it's in sidebar */}
                <div className="lg:hidden w-32">
                    <ThemeSwitcher />
                </div>

                {/* Futuristic Auth Button */}
                <Link
                    href="/login"
                    className="
            hidden sm:flex items-center gap-2 px-5 py-2 rounded-full font-mono text-sm tracking-widest uppercase
            text-white bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]
            shadow-[0_0_15px_rgba(255,69,0,0.4)] hover:shadow-[0_0_25px_rgba(255,0,128,0.6)]
            transition-all duration-300 hover:scale-[1.02] active:scale-95
          "
                >
                    <User size={16} />
                    <span>Intel</span>
                </Link>

                {/* Mobile Hamburger */}
                <button className="lg:hidden p-2 text-white/70 hover:text-white transition-colors" aria-label="Open Menu">
                    <Menu size={24} />
                </button>
            </div>
        </header>
    );
}
