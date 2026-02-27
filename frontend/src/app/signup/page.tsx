"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export default function SignupPage() {
    const router = useRouter()
    const [form, setForm] = useState({ email: "", password: "", username: "", display_name: "" })
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.detail || "Registration failed")
                return
            }
            setSuccess(true)
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h1>Check your email 📬</h1>
                    <p>We sent a verification link to <strong>{form.email}</strong>.</p>
                    <p>Click the link in the email to activate your account, then <Link href="/login">log in</Link>.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Create your account</h1>
                <p className="auth-subtitle">The debate-first list platform</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label>Email
                        <input type="email" required value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </label>
                    <label>Display Name
                        <input type="text" required minLength={1} maxLength={50} value={form.display_name}
                            onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} />
                    </label>
                    <label>Username
                        <input type="text" required minLength={3} maxLength={30} placeholder="letters, numbers, underscores"
                            value={form.username}
                            onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                    </label>
                    <label>Password
                        <input type="password" required minLength={8} value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                    </label>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Creating account…" : "Create Account"}
                    </button>
                </form>

                <div className="auth-divider"><span>or</span></div>

                <button className="auth-btn-google" onClick={() => signIn("google", { callbackUrl: "/" })}>
                    <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Continue with Google
                </button>

                <p className="auth-footer">Already have an account? <Link href="/login">Log in</Link></p>
            </div>
        </div>
    )
}
