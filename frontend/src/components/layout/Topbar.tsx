import { Menu, Search } from "lucide-react";

export function Topbar() {
    return (
        <header className="sticky top-0 z-50 w-full h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-(--border-accent) bg-[var(--bg-surface)]/80 backdrop-blur-md">
            {/* Search Input Centered */}
            <div className="flex-1 max-w-xl mx-auto relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    placeholder="Search debates, lists, users..."
                    className="w-full bg-[var(--bg-base)] text-[var(--text-primary)] rounded-[var(--radius-ui)] pl-10 pr-4 py-2 border border-(--border-accent) focus:border-[var(--brand-primary)] outline-none transition-all focus:shadow-[0_0_15px_rgba(255,69,0,0.1)] placeholder-[var(--text-muted)]"
                />
            </div>

            {/* Mobile Hamburger (Hidden on Desktop) */}
            <div className="lg:hidden ml-4">
                <button className="p-2 text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors" aria-label="Open Menu">
                    <Menu size={24} />
                </button>
            </div>
        </header>
    );
}
