import { ServerCrash } from 'lucide-react'

export default function Unavailable() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center font-mono text-center px-4 animate-in zoom-in-95 duration-700">
            <div className="relative mb-8">
                <ServerCrash size={120} className="text-[#00FFFF] opacity-20 animate-pulse" />
                <span className="absolute inset-0 flex items-center justify-center text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00FFFF] to-[#FF0080] drop-shadow-[0_0_25px_rgba(0,255,255,0.5)]">
                    503
                </span>
            </div>

            <h2 className="text-3xl font-bold tracking-[0.2em] uppercase mb-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Core Offline</h2>
            <p className="text-[var(--text-muted)] max-w-md mx-auto mb-10 text-sm tracking-[0.1em] leading-relaxed">
                The debate engine is currently undergoing maintenance or capacity limits are exceeded. The grid will return shortly.
            </p>

            <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#00FFFF] animate-ping" />
                <span className="text-[#00FFFF] font-bold tracking-[0.2em] text-sm uppercase">Reconnecting...</span>
            </div>
        </div>
    )
}
