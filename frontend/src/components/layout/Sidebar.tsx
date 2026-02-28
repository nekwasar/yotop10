import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { Home, Users, Flame, Globe } from "lucide-react";

export function Sidebar() {
    return (
        <aside className="hidden lg:flex flex-col w-64 h-full border-r border-(--border-accent) bg-[var(--bg-surface)] p-6 z-40 relative">
            <Link href="/" className="flex items-center gap-1 mb-10 hover:opacity-80 transition-opacity">
                <span className="font-logo-yo text-3xl text-[var(--brand-primary)]">Yo</span>
                <span className="font-logo-top10 text-3xl tracking-widest text-[var(--text-primary)]">TOP10</span>
            </Link>

            <nav className="flex flex-col gap-2">
                <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-ui)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors font-medium">
                    <Home size={20} />
                    <span>Public Feed</span>
                </Link>
                <Link href="/private" className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-ui)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors font-medium">
                    <Users size={20} />
                    <span>Connections</span>
                </Link>
                <Link href="/hot" className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-ui)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors font-medium">
                    <Flame size={20} />
                    <span>Hot Takes</span>
                </Link>
                <Link href="/communities" className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-ui)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors font-medium">
                    <Globe size={20} />
                    <span>Communities</span>
                </Link>
            </nav>

            <div className="mt-auto pt-6 border-t border-(--border-accent)">
                <p className="text-xs font-mono text-[var(--text-muted)] mb-3 px-2 uppercase tracking-wide">Interface</p>
                <ThemeSwitcher />
            </div>
        </aside>
    );
}
