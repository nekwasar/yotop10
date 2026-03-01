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
            <AuthContainer title="Check your email 📬" subtitle={`We sent a verification link to ${form.email}.`}>
                <p className="text-[var(--text-muted)] text-sm font-mono tracking-widest text-center leading-relaxed">
                    Click the link in the email to activate your account. Once verified, you can <Link href="/login" className="text-[var(--brand-primary)] hover:underline font-bold">Sign In</Link>.
                </p>
            </AuthContainer>
        )
    }

    return (
        <AuthContainer
            title="Create an Account"
            subtitle="Join the ultimate debate platform."
            rightContent={
                <>
                    <GoogleAuthButton text="Sign up with Google" onClick={() => signIn("google", { callbackUrl: "/" })} />

                    <div className="flex flex-col gap-5 text-center mt-6 p-6 border border-(--border-accent) bg-[var(--bg-base)]/20 rounded-2xl">
                        <span className="text-base text-[var(--text-primary)] font-bold">Already part of the grid?</span>
                        <div className="h-px bg-white/10 w-full my-1" />
                        <Link href="/login" className="text-sm font-mono tracking-widest uppercase bg-white text-black px-6 py-4 rounded-xl hover:bg-gray-200 transition-colors font-bold mt-2 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-95 duration-300">Sign In Now</Link>
                    </div>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <AuthInput
                    label="Email Address"
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
                <AuthInput
                    label="Display Name"
                    type="text"
                    required minLength={1} maxLength={50}
                    value={form.display_name}
                    onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <AuthInput
                        label="Username"
                        type="text"
                        required minLength={3} maxLength={30}
                        placeholder="[A-Z, 0-9, _]"
                        value={form.username}
                        onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    />
                    <AuthInput
                        label="Password"
                        type="password"
                        required minLength={8}
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    />
                </div>

                {error && <p className="text-red-500 text-xs font-mono font-bold tracking-widest uppercase text-center bg-red-500/10 p-2 rounded-xl border border-red-500/20">{error}</p>}

                <AuthButton type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                </AuthButton>
            </form>
        </AuthContainer>
    )
}
