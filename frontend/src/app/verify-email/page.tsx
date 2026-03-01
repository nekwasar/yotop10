"use client"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AuthContainer, AuthButton } from "@/components/ui/auth/AuthUI"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const [state, setState] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (!token) {
            setState("error")
            setMessage("No verification token found in the payload.")
            return
        }
        const verify = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/verify-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                })
                if (res.ok) {
                    setState("success")
                } else {
                    const data = await res.json()
                    setState("error")
                    setMessage(data.detail || "Handshake rejected.")
                }
            } catch {
                setState("error")
                setMessage("Network fracture. Retain position.")
            }
        }
        verify()
    }, [token])

    if (state === "loading") {
        return (
            <AuthContainer title="Verifying Uplink..." subtitle="Please wait while your identity is hashed.">
                <div className="flex justify-center my-10">
                    <div className="w-10 h-10 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(255,69,0,0.5)]"></div>
                </div>
            </AuthContainer>
        )
    }

    if (state === "success") {
        return (
            <AuthContainer title="Grid Access Granted ✅" subtitle="Your identity is now securely registered.">
                <p className="text-[var(--text-muted)] text-sm font-mono tracking-widest text-center leading-relaxed mb-6">
                    You have clearance to mount operations, engage in intel gathering, and forge connections.
                </p>
                <Link href="/login" className="w-full">
                    <AuthButton type="button">Initiate Sign In</AuthButton>
                </Link>
            </AuthContainer>
        )
    }

    return (
        <AuthContainer title="Access Denied ❌" subtitle="Verification protocol failed.">
            <p className="text-red-500 text-xs font-mono font-bold tracking-widest uppercase text-center bg-red-500/10 p-3 rounded-md border border-red-500/20 mb-6">
                {message}
            </p>
            <p className="text-[var(--text-muted)] text-sm font-mono tracking-widest text-center leading-relaxed mb-6">
                Your payload might have expired.
            </p>
            <Link href="/login" className="w-full text-center">
                <span className="text-[var(--brand-primary)] hover:underline font-bold font-mono tracking-widest text-sm uppercase">Return to Gateway</span>
            </Link>
        </AuthContainer>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center font-mono animate-pulse text-[var(--brand-primary)]">Loading Uplink...</div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}
