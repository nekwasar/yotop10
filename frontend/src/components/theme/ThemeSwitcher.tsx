"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun, Newspaper } from "lucide-react";

export function ThemeSwitcher() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-10 w-full" />;
    }

    return (
        <div className="flex gap-2 p-1 bg-[var(--bg-base)] border border-(--border-accent) rounded-[calc(var(--radius-ui)/2)] overflow-hidden w-full">
            <button
                onClick={() => setTheme("light")}
                className={`flex-1 flex justify-center py-2 rounded-md transition-colors ${theme === "light" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                title="Light Mode"
            >
                <Sun size={18} />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`flex-1 flex justify-center py-2 rounded-md transition-colors ${theme === "dark" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                title="Dark Mode"
            >
                <Moon size={18} />
            </button>
            <button
                onClick={() => setTheme("retro")}
                // If theme is retro, give it the stark black newspaper look
                className={`flex-1 flex justify-center py-2 rounded-md transition-colors ${theme === "retro" ? "bg-black text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                title="Retro Mode"
            >
                <Newspaper size={18} />
            </button>
            <button
                onClick={() => setTheme("system")}
                className={`flex-1 flex justify-center py-2 rounded-md transition-colors ${theme === "system" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                title="System Default"
            >
                <Monitor size={18} />
            </button>
        </div>
    );
}
