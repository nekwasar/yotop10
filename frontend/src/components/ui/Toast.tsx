"use client";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

interface ToastProps {
    message: string;
    type?: "success" | "error";
    onClose: () => void;
}

function ToastComponent({ message, type = "success", onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 fade-in duration-200">
            <div className={`
        px-6 py-3 rounded-full shadow-lg font-mono text-sm font-bold tracking-wide
        ${type === 'error' ? 'bg-red-500 text-white' : 'bg-[var(--bg-surface)] text-[var(--brand-secondary)] border-2 border-[var(--brand-secondary)]'}
      `}>
                {message}
            </div>
        </div>
    );
}

// Imperative API for calling toasts from anywhere
export const toast = {
    success: (message: string) => showToast(message, "success"),
    error: (message: string) => showToast(message, "error"),
};

function showToast(message: string, type: "success" | "error") {
    const portalId = "toast-portal";
    let portalElement = document.getElementById(portalId);
    if (!portalElement) {
        portalElement = document.createElement("div");
        portalElement.id = portalId;
        document.body.appendChild(portalElement);
    }

    const wrapper = document.createElement("div");
    portalElement.appendChild(wrapper);
    const root = createRoot(wrapper);

    const cleanup = () => {
        root.unmount();
        if (portalElement?.contains(wrapper)) {
            portalElement.removeChild(wrapper);
        }
    };

    root.render(<ToastComponent message={message} type={type} onClose={cleanup} />);
}
