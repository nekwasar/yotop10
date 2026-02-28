"use client";
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleEscape);
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Glassmorphism Backdrop Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose} /* Strict requirement: outside click closes */
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                className="relative w-full max-w-lg bg-[var(--bg-surface)] rounded-[var(--radius-ui)] p-6 shadow-2xl border border-(--border-accent) animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold font-body">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
