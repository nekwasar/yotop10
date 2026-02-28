export function SkeletonListCard() {
    return (
        <div className="w-full h-48 bg-[var(--bg-surface)] rounded-[var(--radius-ui)] p-6 border border-(--border-accent) animate-pulse flex flex-col gap-4">
            <div className="w-3/4 h-8 bg-[var(--bg-base)] rounded-[calc(var(--radius-ui)/2)]" />
            <div className="w-1/4 h-4 bg-[var(--bg-base)] rounded-[calc(var(--radius-ui)/2)]" />
            <div className="w-full h-full mt-4 bg-[var(--bg-base)] rounded-[calc(var(--radius-ui)-8px)]" />
        </div>
    );
}

export function SkeletonProfileHeader() {
    return (
        <div className="w-full h-32 bg-[var(--bg-surface)] rounded-[var(--radius-ui)] p-6 border border-(--border-accent) animate-pulse flex items-center gap-6">
            <div className="w-20 h-20 bg-[var(--bg-base)] rounded-full" />
            <div className="flex-1 flex flex-col gap-3">
                <div className="w-1/3 h-6 bg-[var(--bg-base)] rounded-[calc(var(--radius-ui)/2)]" />
                <div className="w-1/4 h-4 bg-[var(--bg-base)] rounded-[calc(var(--radius-ui)/2)]" />
            </div>
        </div>
    );
}
