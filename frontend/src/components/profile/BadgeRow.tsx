/**
 * BadgeRow.tsx — Displays a row of earned user badges as clickable pills with hover tooltips.
 * Used on the public profile page and potentially on post cards.
 *
 * Props:
 *   badges  — Array of badge objects with { id, name, icon, description }
 *   size    — "sm" (default) | "lg" for two visual scales
 */
"use client";
import { useState } from "react";

interface Badge {
    id: string;
    name: string;
    icon: string;
    description: string;
}

interface BadgeRowProps {
    badges: Badge[];
    size?: "sm" | "lg";
}

export function BadgeRow({ badges, size = "sm" }: BadgeRowProps) {
    const [hovered, setHovered] = useState<string | null>(null);

    if (!badges || badges.length === 0) return null;

    const pillBase =
        size === "lg"
            ? "relative flex items-center gap-2 px-4 py-2 rounded-full border font-mono font-bold text-sm tracking-widest cursor-default select-none"
            : "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-mono font-bold text-xs tracking-widest cursor-default select-none";

    return (
        <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
                <div
                    key={badge.id}
                    className={`${pillBase} bg-[var(--bg-surface)] border-(--border-accent) text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors duration-200`}
                    onMouseEnter={() => setHovered(badge.id)}
                    onMouseLeave={() => setHovered(null)}
                >
                    <span role="img" aria-label={badge.name} className="text-base leading-none">
                        {badge.icon}
                    </span>
                    <span>{badge.name}</span>

                    {/* Tooltip */}
                    {hovered === badge.id && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[220px] bg-[var(--bg-surface)] border border-(--border-accent) backdrop-blur-xl rounded-xl px-3 py-2 shadow-lg z-50 text-xs text-[var(--text-muted)] text-center leading-relaxed pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                            <span className="text-[var(--text-primary)] font-bold">{badge.name}</span>
                            <br />
                            {badge.description}
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 border-r border-b border-(--border-accent) bg-[var(--bg-surface)] rotate-45 -mt-1" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
