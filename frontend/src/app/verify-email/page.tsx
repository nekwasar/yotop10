"use client"
import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AuthContainer, AuthButton } from "@/components/ui/auth/AuthUI"
import { signIn } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
const CODE_LENGTH = 6

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const email = searchParams.get("email") || ""

    // 6 individual digit inputs
    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    // Auto-focus first box on mount
    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !digits[idx] && idx > 0) {
            // Move focus back if current box is already empty
            inputRefs.current[idx - 1]?.focus()
        }
    }

    const handleChange = (idx: number, value: string) => {
        // Accept only digits
        const digit = value.replace(/\D/g, "").slice(-1)
        const next = [...digits]
        next[idx] = digit
        setDigits(next)
        setError("")

        if (digit && idx < CODE_LENGTH - 1) {
            // Auto-advance to next box
            inputRefs.current[idx + 1]?.focus()
        }

        // Auto-submit when all 6 digits are filled
        if (digit && idx === CODE_LENGTH - 1) {
            const fullCode = [...next].join("")
            if (fullCode.length === CODE_LENGTH) {
                submitCode(fullCode)
            }
        }
    }

    // Handle paste — spread digits across all boxes
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH)
        const next = Array(CODE_LENGTH).fill("")
        pasted.split("").forEach((ch, i) => { next[i] = ch })
        setDigits(next)
        // Focus last filled or last box
        const lastIdx = Math.min(pasted.length - 1, CODE_LENGTH - 1)
        inputRefs.current[lastIdx]?.focus()
        if (pasted.length === CODE_LENGTH) {
            submitCode(pasted)
        }
    }

    const submitCode = async (code: string) => {
        if (!email) {
            setError("Email not found. Please sign up again.")
            return
        }
        setLoading(true)
        setError("")
        try {
            const res = await fetch(`${API_URL}/auth/verify-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.detail || "Verification failed.")
                setDigits(Array(CODE_LENGTH).fill(""))
                setTimeout(() => inputRefs.current[0]?.focus(), 50)
                return
            }
            // Verification success — sign in and redirect home immediately
            await signIn("credentials", {
                email,
                access_token: data.access_token,
                redirect: false,
            })
            router.push("/")
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const code = digits.join("")
        if (code.length < CODE_LENGTH) {
            setError("Please enter all 6 digits.")
            return
        }
        submitCode(code)
    }

    return (
        <AuthContainer
            title="Check your email 📬"
            subtitle={email ? `We sent a 6-digit code to ${email}` : "Enter the 6-digit code we sent you."}
        >
            <form onSubmit={handleManualSubmit} className="flex flex-col items-center gap-8">
                <p className="text-[var(--text-muted)] text-sm font-mono tracking-widest text-center leading-relaxed">
                    Enter the code below. It expires in <span className="text-[var(--brand-primary)] font-bold">5 minutes</span>.
                </p>

                {/* 6-digit code input boxes */}
                <div className="flex gap-3" onPaste={handlePaste}>
                    {digits.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={el => { inputRefs.current[idx] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleChange(idx, e.target.value)}
                            onKeyDown={e => handleKeyDown(idx, e)}
                            disabled={loading}
                            className={`w-12 h-14 text-center text-2xl font-black font-mono rounded-xl border-2 bg-[var(--bg-base)]/50 text-[var(--text-primary)] outline-none transition-all duration-200
                                ${digit ? "border-[var(--brand-primary)] shadow-[0_0_12px_rgba(255,69,0,0.4)]" : "border-(--border-accent)"}
                                focus:border-[var(--brand-primary)] focus:shadow-[0_0_16px_rgba(255,69,0,0.5)]
                                disabled:opacity-50`}
                        />
                    ))}
                </div>

                {error && (
                    <p className="text-red-500 text-xs font-mono font-bold tracking-widest uppercase text-center bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20 w-full">
                        {error}
                    </p>
                )}

                <AuthButton type="submit" disabled={loading || digits.join("").length < CODE_LENGTH}>
                    {loading ? "Verifying..." : "Verify →"}
                </AuthButton>

                <p className="text-xs text-[var(--text-muted)] font-mono text-center">
                    Didn&apos;t receive the code?{" "}
                    <button
                        type="button"
                        onClick={() => router.push(`/signup`)}
                        className="text-[var(--brand-primary)] font-bold hover:underline"
                    >
                        Sign up again
                    </button>
                </p>
            </form>
        </AuthContainer>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center font-mono animate-pulse text-[var(--brand-primary)]">Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}
