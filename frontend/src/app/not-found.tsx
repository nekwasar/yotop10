import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center font-mono text-center px-4 animate-in zoom-in-95 duration-700">
            <div className="relative mb-8">
                <AlertCircle size={120} className="text-[var(--brand-primary)] opacity-20 animate-pulse" />
                <span className="absolute inset-0 flex items-center justify-center text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] drop-shadow-[0_0_25px_rgba(255,0,128,0.5)]">
                    404
                </span>
            </div>

            <h2 className="text-3xl font-bold tracking-[0.2em] uppercase mb-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Void Sector Reached</h2>
            <p className="text-[var(--text-muted)] max-w-md mx-auto mb-10 text-sm tracking-[0.1em] leading-relaxed">
                The debate you are searching for has been eradicated from the public ledger, or the coordinates are invalid.
            </p>

            <Link
                href="/"
                className="
          flex items-center gap-2 px-8 py-3 rounded-full font-mono text-sm tracking-[0.2em] font-bold uppercase
          text-white bg-white/5 border border-white/10 backdrop-blur-xl
          shadow-[0_0_15px_rgba(255,69,0,0.2)] hover:shadow-[0_0_30px_rgba(255,69,0,0.6)]
          hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10
          transition-all duration-300 hover:scale-[1.05] active:scale-95
        "
            >
                Return to Grid
            </Link>
        </div>
    )
}
