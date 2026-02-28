import Link from 'next/link'
import { Lock } from 'lucide-react'

export default function Forbidden() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center font-mono text-center px-4 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="relative mb-8">
                <Lock size={120} className="text-[#FFB800] opacity-20" />
                <span className="absolute inset-0 flex items-center justify-center text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#FFB800] to-[#FF4500] drop-shadow-[0_0_25px_rgba(255,184,0,0.5)]">
                    403
                </span>
            </div>

            <h2 className="text-3xl font-bold tracking-[0.2em] uppercase mb-4 text-[var(--text-primary)] drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Access Denied</h2>
            <p className="text-[var(--text-muted)] max-w-md mx-auto mb-10 text-sm tracking-[0.1em] leading-relaxed">
                You don't have permission to view this page.
            </p>

            <Link
                href="/"
                className="
          flex items-center gap-2 px-8 py-3 rounded-full font-mono text-sm tracking-[0.2em] font-bold uppercase
          text-[var(--text-primary)] bg-[var(--bg-surface)] border border-(--border-accent) backdrop-blur-xl
          hover:shadow-[0_0_30px_rgba(255,184,0,0.4)] hover:border-[#FFB800] hover:bg-[#FFB800]/10
          transition-all duration-300 hover:scale-[1.05] active:scale-95 no-underline
        "
            >
                Go Back Home
            </Link>
        </div>
    )
}
