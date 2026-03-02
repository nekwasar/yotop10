import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Route Protection Middleware
// - GUEST-ONLY: /login, /signup, /forgot-password, /reset-password, /verify-email
//   → logged-in users are redirected to /
// - AUTH-REQUIRED: /settings/*, /submit, /private, /post/ID/edit
//   → guests are redirected to /login?callbackUrl=...
// - URL rewrite: /at-username → /username (internal rewrite, URL unchanged)

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

    // ── @username rewrite ────────────────────────────────────────────────────
    if (pathname.startsWith("/@")) {
        const username = pathname.slice(2);
        if (username && !username.includes("/")) {
            const url = request.nextUrl.clone();
            url.pathname = `/${username}`;
            return NextResponse.rewrite(url);
        }
    }

    // ── Read JWT session token ───────────────────────────────────────────────
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const isAuthenticated = !!token;

    // ── Guest-only: kick authenticated users to home ─────────────────────────
    const isGuestOnly = GUEST_ONLY.some(p => pathname.startsWith(p));
    if (isGuestOnly && isAuthenticated) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // ── Auth-required: kick guests to login with callbackUrl ─────────────────
    const isAuthRequired = AUTH_REQUIRED.some(p => pathname.startsWith(p));
    if (isAuthRequired && !isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── Post edit pages require auth ─────────────────────────────────────────
    if (pathname.match(/^\/post\/[^/]+\/edit/) && !isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    // Run on all routes except Next.js internals and static files
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|logo.png|images/).*)",
    ],
};
