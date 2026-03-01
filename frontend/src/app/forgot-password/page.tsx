"use client"
import { useState } from "react"
import Link from "next/link"
import { AuthContainer, AuthInput, AuthButton } from "@/components/ui/auth/AuthUI"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        await fetch(`${API_URL}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        })
        setLoading(false)
        setSent(true) // Always show success — backend never reveals if email exists
    }

    if (sent) {
        return (
            <AuthContainer title="Check your email 📬" subtitle="If your account exists, a reset link was sent.">
                <p className="text-[var(--text-muted)] text-sm font-mono tracking-widest text-center leading-relaxed">
                    Check your inbox and spam folder for {email}. The reset link expires in 1 hour.
                </p>
                <div className="flex justify-center mt-6">
                    <Link href="/login" className="text-[var(--brand-primary)] hover:underline font-bold font-mono tracking-widest text-sm uppercase">Back to Login</Link>
                </div>
            </AuthContainer>
        )
    }

    return (
        <AuthContainer
            title="Reset Password"
            subtitle="Enter your email to get a password reset link."
            footer={<Link href="/login" className="text-[var(--brand-primary)] hover:underline font-bold transition-colors">Back to Login</Link>}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <AuthInput
                    label="Email Address"
                    type="email"
                    required
                    value={email} onChange={e => setEmail(e.target.value)}
                />

                <AuthButton type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </AuthButton>
            </form>
        </AuthContainer>
    )
}
