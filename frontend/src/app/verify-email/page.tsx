"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export default function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const [state, setState] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (!token) {
            setState("error")
            setMessage("No verification token found in the URL.")
            return
        }

        const verify = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/verify-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                })
                if (res.ok) {
                    setState("success")
                } else {
                    const data = await res.json()
                    setState("error")
                    setMessage(data.detail || "Verification failed.")
                }
            } catch {
                setState("error")
                setMessage("Something went wrong. Please try again.")
            }
        }

        verify()
    }, [token])

    return (
        <div className="auth-container">
            <div className="auth-card">
                {state === "loading" && (
                    <>
                        <h1>Verifying your email…</h1>
                        <p>Please wait a moment.</p>
                    </>
                )}
                {state === "success" && (
                    <>
                        <h1>Email verified! ✅</h1>
                        <p>Your account is now active. You can now post, comment, and react.</p>
                        <Link href="/login" className="auth-btn" style={{ display: "inline-block", textAlign: "center", margin: "1rem 0" }}>
                            Log In
                        </Link>
                    </>
                )}
                {state === "error" && (
                    <>
                        <h1>Verification failed ❌</h1>
                        <p>{message}</p>
                        <p>Your link may have expired. <Link href="/resend-verification">Send a new link</Link> or <Link href="/login">log in</Link>.</p>
                    </>
                )}
            </div>
        </div>
    )
}
