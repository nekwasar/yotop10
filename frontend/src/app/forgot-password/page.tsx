"use client"
import { useState } from "react"
import Link from "next/link"

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
            <div className="auth-container">
                <div className="auth-card">
                    <h1>Check your inbox 📬</h1>
                    <p>If <strong>{email}</strong> is registered, a reset link has been sent. It expires in 1 hour.</p>
                    <p><Link href="/login">Back to login</Link></p>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Forgot your password?</h1>
                <p className="auth-subtitle">Enter your email and we&apos;ll send you a reset link.</p>
                <form onSubmit={handleSubmit} className="auth-form">
                    <label>Email
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                    </label>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Sending…" : "Send Reset Link"}
                    </button>
                </form>
                <p className="auth-footer"><Link href="/login">Back to login</Link></p>
            </div>
        </div>
    )
}
