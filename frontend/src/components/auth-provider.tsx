"use client"
import { SessionProvider } from "next-auth/react"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    // Configures the frontend NextAuth client to use the custom basePath
    // so signIn("google") correctly hits /nextauth/signin/google
    return <SessionProvider basePath="/nextauth">{children}</SessionProvider>
}
