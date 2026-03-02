import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Route Protection Middleware
// - GUEST-ONLY: /login, /signup, /forgot-password, /reset-password, /verify-email
//   redirects logged-in users to /
// - AUTH-REQUIRED: /settings/*, /submit, /private, /post/ID/edit
//   redirects guests to /login?callbackUrl=...
// - URL rewrite: /at-username internally rewrites to /username

const GUEST_ONLY = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
];

const AUTH_REQUIRED = [
    "/settings",
    "/submit",
    "/private",
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Username URL rewrite: /@someuser → /someuser (internal only, URL bar unchanged)
    if (pathname.startsWith("/@")) {
        const username = pathname.slice(2);
        if (username && !username.includes("/")) {
            const url = request.nextUrl.clone();
            url.pathname = `/${username}`;
            return NextResponse.rewrite(url);
        }
    }

    // Read JWT token — MUST specify cookieName because basePath is /nextauth, not /api/auth
    // NextAuth uses different cookie names depending on the basePath:
    //   default  /api/auth  → __Secure-next-auth.session-token (prod) or next-auth.session-token (dev)
    //   custom   /nextauth  → __Secure-next-auth.session-token (same, but basePath affects the callback URL)
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        // Try both cookie name variants to handle prod (https, Secure prefix) and dev
        cookieName: request.nextUrl.hostname === "localhost"
            ? "next-auth.session-token"
            : "__Secure-next-auth.session-token",
    });

    const isAuthenticated = !!token;

    // Guest-only: redirect authenticated users away
    const isGuestOnly = GUEST_ONLY.some(p => pathname.startsWith(p));
    if (isGuestOnly && isAuthenticated) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Auth-required: redirect guests to login
    const isAuthRequired = AUTH_REQUIRED.some(p => pathname.startsWith(p));
    if (isAuthRequired && !isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Post edit pages require auth
    if (pathname.match(/^\/post\/[^/]+\/edit/) && !isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|logo.png|images/).*)",
    ],
};
