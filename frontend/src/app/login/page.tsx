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
            rightContent={
                <>
                    <GoogleAuthButton text="Sign in with Google" onClick={() => signIn("google", { callbackUrl })} />

                    <div className="flex flex-col gap-5 text-center mt-6 p-6 border border-(--border-accent) bg-[var(--bg-base)]/20 rounded-2xl">
                        <span className="text-base text-[var(--text-primary)] font-bold">Having trouble?</span>
                        <Link href="/forgot-password" className="text-sm font-mono tracking-widest uppercase text-[var(--brand-primary)] hover:underline drop-shadow-[0_0_5px_rgba(255,69,0,0.5)]">Memory Wipe? (Reset)</Link>
                        <div className="h-px bg-white/10 w-full my-2" />
                        <span className="text-[var(--text-muted)] text-sm">Don't have an account? <br /><Link href="/signup" className="text-[var(--text-primary)] hover:text-[var(--brand-primary)] font-bold transition-colors inline-block mt-2">Sign up here</Link></span>
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
                    label="Password"
                    type="password"
                    required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />

                {error && <p className="text-red-500 text-xs font-mono font-bold tracking-widest uppercase text-center bg-red-500/10 p-2 rounded-xl border border-red-500/20">{error}</p>}

                <AuthButton type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                </AuthButton>
            </form>
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
