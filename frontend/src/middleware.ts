// Route Protection Middleware — NextAuth v5 (Auth.js beta)
// Uses the auth() export from @/auth directly — handles all cookie/token
// logic automatically regardless of basePath or cookie naming.
//
// GUEST-ONLY (redirect signed-in → /):
//   /login, /signup, /forgot-password, /reset-password, /verify-email
//
// AUTH-REQUIRED (redirect guests → /login?callbackUrl=...):
//   /settings/*, /submit, /private, /post/ID/edit
//
// URL REWRITE: /@username → /username (internal only)

import { auth } from "@/auth";
import { NextResponse } from "next/server";

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

export default auth((request) => {
    const { nextUrl, auth: session } = request as any;
    const pathname = nextUrl.pathname;
    const isAuthenticated = !!session;

    // ── @username URL rewrite ────────────────────────────────────────────────
    if (pathname.startsWith("/@")) {
        const username = pathname.slice(2);
        if (username && !username.includes("/")) {
            const url = nextUrl.clone();
            url.pathname = `/${username}`;
            return NextResponse.rewrite(url);
        }
    }

    // ── Guest-only: signed-in users → home ──────────────────────────────────
    const isGuestOnly = GUEST_ONLY.some(p => pathname.startsWith(p));
    if (isGuestOnly && isAuthenticated) {
        return NextResponse.redirect(new URL("/", nextUrl));
    }

    // ── Auth-required: guests → login with callbackUrl ───────────────────────
    const isAuthRequired = AUTH_REQUIRED.some(p => pathname.startsWith(p));
    if (isAuthRequired && !isAuthenticated) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── Post edit pages require auth ─────────────────────────────────────────
    if (pathname.match(/^\/post\/[^/]+\/edit/) && !isAuthenticated) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }
});

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|logo.png|images|api/).*)",
    ],
};
