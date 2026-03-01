"use client"
import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AuthContainer, AuthInput, AuthButton, GoogleAuthButton } from "@/components/ui/auth/AuthUI"

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") || "/"
    const [form, setForm] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        const result = await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
        })
        setLoading(false)
        if (result?.error) {
            setError("Invalid email or password")
        } else {
            router.push(callbackUrl)
        }
    }

    return (
        <AuthContainer
            title="Welcome Back"
            subtitle="Sign in to your account to continue."
            footer={<span className="text-[var(--text-muted)]">Don't have an account? <Link href="/signup" className="text-[var(--text-primary)] hover:text-[var(--brand-primary)] font-bold transition-colors">Sign up here</Link></span>}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <AuthInput
                    label="Email Address"
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />

                <div className="flex flex-col gap-1">
                    <AuthInput
                        label="Password"
                        type="password"
                        required
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    />
                    <Link href="/forgot-password" className="text-xs text-[var(--brand-primary)] hover:underline self-end mt-1 font-mono uppercase tracking-widest drop-shadow-[0_0_5px_rgba(255,69,0,0.5)]">Forgot password?</Link>
                </div>

                {error && <p className="text-red-500 text-xs font-mono font-bold tracking-widest uppercase text-center bg-red-500/10 p-2 rounded-xl border border-red-500/20">{error}</p>}

                <AuthButton type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                </AuthButton>
            </form>

            <div className="my-6 relative flex items-center justify-center">
                <div className="absolute inset-x-0 h-px bg-white/10 dark:bg-white/10 bg-black/10 data-[theme=retro]:bg-black" />
                <span className="relative bg-[var(--bg-surface)] backdrop-blur-xl px-4 text-xs font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] data-[theme=retro]:bg-white data-[theme=retro]:border-[2px] data-[theme=retro]:border-black data-[theme=retro]:py-1 data-[theme=retro]:text-black font-bold">Or</span>
            </div>

            <GoogleAuthButton text="Sign in with Google" onClick={() => signIn("google", { callbackUrl })} />
        </AuthContainer>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center font-mono animate-pulse text-[var(--brand-primary)]">Loading...</div>}>
            <LoginForm />
        </Suspense>
    )
}
