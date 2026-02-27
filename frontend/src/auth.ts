import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://yotop10.com/api"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null
                try {
                    const res = await fetch(`${API_URL}/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    })
                    if (!res.ok) return null
                    const data = await res.json()
                    return {
                        id: data.user.id,
                        name: data.user.display_name,
                        email: data.user.email,
                        image: data.user.avatar_url,
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token,
                        isVerified: data.user.is_verified,
                        isAdmin: data.user.is_admin,
                        isAuthor: data.user.is_author,
                        username: data.user.username,
                    }
                } catch {
                    return null
                }
            },
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            // For Google sign-in, send Google ID token to our backend
            if (account?.provider === "google" && account.id_token) {
                try {
                    const res = await fetch(`${API_URL}/auth/google`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id_token: account.id_token }),
                    })
                    if (!res.ok) return false
                    const data = await res.json()
                    // Store backend tokens in user object for jwt callback
                    user.accessToken = data.access_token
                    user.refreshToken = data.refresh_token
                    user.id = data.user.id
                    user.username = data.user.username
                    user.isVerified = data.user.is_verified
                    user.isAdmin = data.user.is_admin
                    user.isAuthor = data.user.is_author
                } catch {
                    return false
                }
            }
            return true
        },

        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken
                token.refreshToken = user.refreshToken
                token.id = user.id
                token.username = user.username
                token.isVerified = user.isVerified
                token.isAdmin = user.isAdmin
                token.isAuthor = user.isAuthor
            }
            return token
        },

        async session({ session, token }) {
            session.accessToken = token.accessToken as string
            session.user.id = token.id as string
            session.user.username = token.username as string
            session.user.isVerified = token.isVerified as boolean
            session.user.isAdmin = token.isAdmin as boolean
            session.user.isAuthor = token.isAuthor as boolean
            return session
        },
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
})
