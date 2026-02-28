"use client"
import confetti from 'canvas-confetti';
import { useState } from 'react';

export function FireButton({ count }: { count: number }) {
    const [active, setActive] = useState(false);

    const triggerSparks = (e: React.MouseEvent) => {
        setActive(true);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
            particleCount: 15,
            spread: 40,
            origin: { x, y },
            colors: ['#FF4500', '#FF0080', '#FFA500'],
            ticks: 50, // fast decay
            gravity: 2
        });
    };

    return (
        <button
            onClick={triggerSparks}
            className={`
        flex items-center gap-2 px-3 py-1.5 
        rounded-[var(--radius-ui)] font-mono text-sm transition-colors
        ${active ? 'text-[var(--brand-primary)] bg-[var(--brand-primary)]/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--brand-primary)] border border-(--border-accent)'}
      `}
        >
            <span className="text-lg">🔥</span>
            <span>{count + (active ? 1 : 0)}</span>
        </button>
    );
}
