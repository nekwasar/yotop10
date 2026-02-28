import React from "react";

export function NeonInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={`
        w-full px-4 py-3 bg-[var(--bg-base)] text-[var(--text-primary)]
        border border-(--border-accent) rounded-[calc(var(--radius-ui)/2)]
        transition-all duration-200 outline-none
        focus:border-[var(--brand-primary)] focus:shadow-[0_0_15px_rgba(255,69,0,0.2)]
        placeholder-[var(--text-muted)]
        ${props.className || ""}
      `}
        />
    );
}

export function NeonTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            className={`
        w-full px-4 py-3 bg-[var(--bg-base)] text-[var(--text-primary)]
        border border-(--border-accent) rounded-[calc(var(--radius-ui)/2)]
        transition-all duration-200 outline-none resize-y min-h-[120px]
        focus:border-[var(--brand-primary)] focus:shadow-[0_0_15px_rgba(255,69,0,0.2)]
        placeholder-[var(--text-muted)]
        ${props.className || ""}
      `}
        />
    );
}
