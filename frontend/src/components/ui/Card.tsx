import { ReactNode } from "react";

export function PostCard({ children, imageUrl }: { children: ReactNode, imageUrl?: string }) {
    return (
        <article className="
      relative overflow-hidden group 
      bg-[var(--bg-surface)] 
      rounded-[var(--radius-ui)] 
      shadow-[var(--card-shadow)] 
      border border-(--border-accent)
      p-6 mb-8
    ">
            {/* Neon border hover effect (Futuristic mode only) */}
            <div className="absolute inset-0 border-2 border-[var(--brand-secondary)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-[var(--radius-ui)] pointer-events-none" />

            {imageUrl && (
                <div className="w-full h-48 overflow-hidden rounded-[calc(var(--radius-ui)-8px)] mb-4">
                    <img
                        src={imageUrl}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        alt="Card hero"
                    />
                </div>
            )}

            {children}
        </article>
    );
}
