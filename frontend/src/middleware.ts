import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: Rewrite /@username → /username
 *
 * Next.js App Router reserves the `@` prefix for parallel route slots.
 * To keep the Twitter-style `/@username` URLs in the browser bar, we
 * intercept those requests here and internally rewrite to `/username`
 * which is served by `src/app/[username]/page.tsx`.
 *
 * The rewrite is transparent to the user — the URL bar still shows `/@username`.
 */

const AUTH_PATHS = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/settings",
    "/submit",
    "/post",
    "/api",
    "/communities",
    "/hot",
    "/private",
    "/_next",
    "/favicon.ico",
    "/images",
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rewrite /@username → /username (profile page)
    if (pathname.startsWith("/@")) {
        const username = pathname.slice(2); // strip the "/@"
        if (username && !username.includes("/")) {
            const url = request.nextUrl.clone();
            url.pathname = `/${username}`;
            return NextResponse.rewrite(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    // Only run middleware on paths starting with /@
    matcher: ["/@:username*"],
};
