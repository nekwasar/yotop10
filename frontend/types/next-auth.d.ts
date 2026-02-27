// NextAuth v5 TypeScript type extensions
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        accessToken: string
        user: {
            id: string
            username: string
            isVerified: boolean
            isAdmin: boolean
            isAuthor: boolean
        } & DefaultSession["user"]
    }

    interface User {
        accessToken?: string
        refreshToken?: string
        username?: string
        isVerified?: boolean
        isAdmin?: boolean
        isAuthor?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
        refreshToken?: string
        id?: string
        username?: string
        isVerified?: boolean
        isAdmin?: boolean
        isAuthor?: boolean
    }
}
