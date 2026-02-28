export function VerdictMeter({ stats }: { stats: { debunked: number, contested: number, hotTake: number, confirmed: number } }) {
    const total = stats.debunked + stats.contested + stats.hotTake + stats.confirmed;

    if (total === 0) return null;

    return (
        <div className="w-full mt-4">
            <div className="flex justify-between text-xs font-mono text-[var(--text-muted)] mb-1 uppercase">
                <span>VERDICT: CONTESTED</span>
                <span>{total} votes</span>
            </div>
            {/* The Temperature Bar */}
            <div className="h-2 w-full flex rounded-full overflow-hidden bg-[var(--bg-base)] ring-1 ring-inset ring-black/10">
                <div style={{ width: `${(stats.debunked / total) * 100}%` }} className="bg-blue-500 transition-all duration-500" title={`Debunked: ${stats.debunked}`} />
                <div style={{ width: `${(stats.contested / total) * 100}%` }} className="bg-yellow-400 transition-all duration-500" title={`Contested: ${stats.contested}`} />
                <div style={{ width: `${(stats.hotTake / total) * 100}%` }} className="bg-[var(--brand-primary)] transition-all duration-500" title={`Hot Take: ${stats.hotTake}`} />
                <div style={{ width: `${(stats.confirmed / total) * 100}%` }} className="bg-green-500 transition-all duration-500" title={`Confirmed: ${stats.confirmed}`} />
            </div>
        </div>
    );
}
