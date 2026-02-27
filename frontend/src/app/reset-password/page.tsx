"use client"
import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

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
        if (password !== confirm) { setError("Passwords don't match"); return }
        if (password.length < 8) { setError("Password must be at least 8 characters"); return }
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
                setError(data.detail || "Reset failed. The link may have expired.")
            }
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h1>Invalid reset link</h1>
                    <p>This link is missing the reset token. <Link href="/forgot-password">Request a new one</Link>.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Set a new password</h1>
                <form onSubmit={handleSubmit} className="auth-form">
                    <label>New Password
                        <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
                    </label>
                    <label>Confirm Password
                        <input type="password" required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} />
                    </label>
                    {error && <p className="auth-error">{error}</p>}
                    <button type="submit" className="auth-btn" disabled={loading}>{loading ? "Saving…" : "Reset Password"}</button>
                </form>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="auth-container"><div className="auth-card">Loading…</div></div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}
