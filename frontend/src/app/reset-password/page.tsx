"use client"
import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AuthContainer, AuthInput, AuthButton } from "@/components/ui/auth/AuthUI"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token") || ""
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        if (password !== confirm) { setError("Cryptographic keys do not align."); return }
        if (password.length < 8) { setError("Key must be 8+ units long."); return }
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, new_password: password }),
            })
            if (res.ok) {
                router.push("/login?reset=success")
            } else {
                const data = await res.json()
                setError(data.detail || "Handshake failed. Protocol expired.")
            }
        } catch {
            setError("Server grid fractured. Hold position.")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <AuthContainer title="Malformed Token" subtitle="The identity link provided lacks a payload.">
                <div className="flex justify-center mt-6">
                    <Link href="/forgot-password" className="text-[var(--brand-primary)] hover:underline font-bold font-mono tracking-widest text-sm uppercase">Request New Signal</Link>
                </div>
            </AuthContainer>
        )
    }

    return (
        <AuthContainer title="Establish New Key" subtitle="Re-encrypt your identity pass to enter the grid.">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <AuthInput
                    label="New Security Passphrase"
                    type="password"
                    required minLength={8}
                    value={password} onChange={e => setPassword(e.target.value)}
                />
                <AuthInput
                    label="Confirm Passphrase"
                    type="password"
                    required minLength={8}
                    value={confirm} onChange={e => setConfirm(e.target.value)}
                />

                {error && <p className="text-red-500 text-xs font-mono font-bold tracking-widest uppercase text-center bg-red-500/10 p-2 rounded-md border border-red-500/20">{error}</p>}

                <AuthButton type="submit" disabled={loading}>
                    {loading ? "Encrypting..." : "Finalize Key"}
                </AuthButton>
            </form>
        </AuthContainer>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center font-mono animate-pulse text-[var(--brand-primary)]">Loading Decoder...</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}
