"use client";
import { useTheme } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

export function AuthContainer({ children, title, subtitle, footer }: { children: ReactNode, title: string, subtitle?: string, footer?: ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="min-h-[70vh] flex items-center justify-center p-4 animate-pulse opacity-50" />;

    if (theme === "retro") {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-4 animate-in fade-in duration-500">
                <div className="w-[70vw] max-w-4xl bg-white border-4 border-black p-8 sm:p-12 shadow-[12px_12px_0px_#000]">
                    <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter mb-2 border-b-4 border-black pb-4">{title}</h1>
                    {subtitle && <p className="text-lg font-bold mb-8 italic">{subtitle}</p>}

                    <div className="flex flex-col gap-6">
                        {children}
                    </div>

                    {footer && (
                        <div className="mt-12 pt-6 border-t-4 border-black text-base font-bold text-center">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Futuristic Neon Glassmorphism Form
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            {/* 70% width constrained to max-4xl to prevent it becoming unreadable on extremely ultra-wide screens, but massive on typical screens */}
            <div className="w-[85vw] md:w-[70vw] max-w-4xl bg-[var(--bg-surface)]/40 backdrop-blur-3xl border border-white/10 p-8 sm:p-12 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden">

                {/* Subtle sweeping gradient background to give it that next-gen feel */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--brand-primary)] to-transparent opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/5 via-transparent to-[var(--brand-secondary)]/5 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <ShieldCheck className="text-[var(--brand-primary)] drop-shadow-[0_0_8px_rgba(255,69,0,0.8)]" size={32} />
                        <h1 className="text-3xl sm:text-4xl font-mono tracking-widest font-bold uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{title}</h1>
                    </div>

                    {subtitle && <p className="text-[var(--text-muted)] text-base sm:text-lg tracking-wide font-mono mb-10">{subtitle}</p>}

                    <div className="flex flex-col gap-6">
                        {children}
                    </div>

                    {footer && (
                        <div className="mt-10 pt-8 border-t border-white/10 text-center font-mono text-base tracking-wide text-white/60">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function AuthInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    const { theme } = useTheme();

    if (theme === "retro") {
        return (
            <div className="flex flex-col gap-2">
                <label className="font-bold underline text-base uppercase tracking-wider">{props.label}</label>
                <input
                    {...props}
                    className="w-full border-4 border-black p-4 text-xl bg-[#EFECE6] focus:bg-white outline-none font-mono placeholder:text-gray-500"
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-mono tracking-widest uppercase text-[var(--brand-primary)] drop-shadow-[0_0_5px_rgba(255,69,0,0.5)] pl-1">{props.label}</label>
            <input
                {...props}
                className="
          w-full bg-black/30 text-white rounded-xl px-5 py-4 text-base sm:text-lg
          border border-white/10 outline-none transition-all duration-300
          focus:border-[var(--brand-primary)] focus:bg-black/60
          focus:shadow-[0_0_20px_rgba(255,69,0,0.15),inset_0_0_10px_rgba(255,69,0,0.1)]
          placeholder-white/20 font-mono tracking-wide
        "
            />
        </div>
    );
}

export function AuthButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { theme } = useTheme();

    if (theme === "retro") {
        return (
            <button
                {...props}
                className="w-full bg-black text-white font-black text-2xl p-4 uppercase tracking-widest mt-4 hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
                {props.children}
            </button>
        );
    }

    return (
        <button
            {...props}
            className="
        w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-mono text-base tracking-widest font-bold uppercase
        text-white bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]
        shadow-[0_0_15px_rgba(255,69,0,0.4)] hover:shadow-[0_0_30px_rgba(255,0,128,0.7)] hover:scale-[1.01]
        transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed
      "
        >
            {props.children}
        </button>
    );
}

export function GoogleAuthButton({ onClick, text }: { onClick: () => void, text: string }) {
    const { theme } = useTheme();

    if (theme === "retro") {
        return (
            <button
                type="button"
                onClick={onClick}
                className="w-full bg-white border-4 border-black font-black text-xl p-4 flex items-center justify-center gap-4 hover:bg-gray-100 transition-colors"
            >
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                {text}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className="
        w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-mono text-base tracking-widest font-bold uppercase
        text-white bg-white/5 border border-white/10 backdrop-blur-xl
        hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-white/10
        transition-all duration-300 hover:scale-[1.01] active:scale-95
      "
        >
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            {text}
        </button>
    );
}
