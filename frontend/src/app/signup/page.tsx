"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthContainer, AuthInput, AuthButton, GoogleAuthButton } from "@/components/ui/auth/AuthUI"

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
            <AuthContainer title="Verification Sent 📬" subtitle={`Check your transmission logs at ${form.email}.`}>
                <p className="text-[var(--text-muted)] text-sm font-mono tracking-widest text-center leading-relaxed">
                    Execute the link contained in the payload to mount your identity. Once authorized, proceed to <Link href="/login" className="text-[var(--brand-primary)] hover:underline font-bold">Sign In</Link>.
                </p>
            </AuthContainer>
        )
    }

    return (
        <AuthContainer
            title="Create Identity"
            subtitle="Establish your node in the debate grid."
            footer={<span className="text-[var(--text-muted)]">Already initialized? <Link href="/login" className="text-[var(--text-primary)] hover:text-[var(--brand-primary)] font-bold transition-colors">Sign In</Link></span>}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <AuthInput
                    label="Grid Identity (Email)"
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
                <AuthInput
                    label="Public Moniker (Display Name)"
                    type="text"
                    required minLength={1} maxLength={50}
                    value={form.display_name}
                    onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                />
                <AuthInput
                    label="System Handle (Username)"
                    type="text"
                    required minLength={3} maxLength={30}
                    placeholder="[A-Z, 0-9, _]"
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                />
                <AuthInput
                    label="Security Passphrase"
                    type="password"
                    required minLength={8}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />

                {error && <p className="text-red-500 text-xs font-mono font-bold tracking-widest uppercase text-center bg-red-500/10 p-2 rounded-md border border-red-500/20">{error}</p>}

                <AuthButton type="submit" disabled={loading}>
                    {loading ? "Generating..." : "Transmit Creation Request"}
                </AuthButton>
            </form>

            <div className="my-6 relative flex items-center justify-center">
                <div className="absolute inset-x-0 h-px bg-white/10 dark:bg-white/10 bg-black/10 data-[theme=retro]:bg-black" />
                <span className="relative bg-[var(--bg-surface)] backdrop-blur-xl px-4 text-xs font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] data-[theme=retro]:bg-white data-[theme=retro]:border-[2px] data-[theme=retro]:border-black data-[theme=retro]:py-1 data-[theme=retro]:text-black font-bold">External Network</span>
            </div>

            <GoogleAuthButton text="Register via Google" onClick={() => signIn("google", { callbackUrl: "/" })} />
        </AuthContainer>
    )
}
