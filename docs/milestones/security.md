# YoTop10 Architecture, Security & Workflow Review

This document outlines the structural vulnerabilities, architectural deficiencies, and workflow bottlenecks in the YoTop10 codebase (M2-M4 scope) when compared against industry-standard platforms like Twitter, Medium, or Reddit.

## Part 1: Security Vulnerabilities (🔴 Critical & 🟡 Moderate)

### 1. 🔴 Complete Lack of Rate Limiting (Brute-Force & OTP Bypass)
The FastAPI backend currently implements zero rate limiting.
*   **OTP Bypass**: The email verification code is a 6-digit number (1,000,000 combinations) valid for 5 minutes. A simple script can make 1 million `POST /verify-email` requests within 5 minutes, trivially bypassing email ownership verification.
*   **Credential Stuffing**: `POST /login` can be hit infinitely. Attackers can test databases of leaked passwords against registered emails until they find a match.
*   **Remediation**: Implement `fastapi-limiter` (Redis) to strictly rate-limit `/login` (5/min), `/verify-email` (5/min), and `/register` by IP.

### 2. 🔴 Stateless Refresh Tokens (No Revocation)
When a user logs in, they receive a JWT `refresh_token` valid for 90 days.
*   **The Loophole**: This token is entirely stateless. If a user clicks "Sign Out of All Accounts" or changes their password, the backend has no way to invalidate existing tokens. If a hacker steals a refresh token, they possess guaranteed access for 90 days, and the server cannot stop them without rotating the master `SECRET_KEY`.
*   **Remediation**: Store explicit `Session` records in PostgreSQL or Redis. Validate the refresh token against the database on every `/refresh` call, allowing individual sessions to be revoked.

### 3. 🔴 XSS Session Hijacking via Local Storage
The multi-account switcher stores the `refreshToken` in `localStorage`.
*   **The Loophole**: `localStorage` is accessible to JavaScript. If YoTop10 ever introduces a Cross-Site Scripting (XSS) vulnerability (e.g., through user Markdown rendering, comment inputs, or profile bios), a malicious script can silently read `localStorage['yotop10-accounts']` and permanently hijack the accounts.
*   **Remediation**: Migrate the multi-account architecture to use multiple `HttpOnly`, `Secure` cookies managed entirely by Next.js server-side code.

### 4. 🔴 Email Verification Bypass on Protected Routes
*   **The Loophole**: The core dependency `get_current_user` in `app/core/deps.py` enforces `is_active` and `is_banned`, but ignores `is_verified`. An attacker can sign up with an email they don't own, never verify it, and still interact with the backend API as an authenticated user.
*   **Remediation**: Update FastAPI's `get_current_user` or create a new `get_verified_user` dependency to strictly block unverified users from sensitive mutations (posting, commenting, etc.).

### 5. 🟡 Account Enumeration at Registration
*   **The Loophole**: `POST /register` returns a `409 Conflict - Email already registered`. An attacker can throw an email dictionary list at the API to determine exactly who is using YoTop10.
*   **Remediation**: Return a success message regardless of whether the email exists, and silently send an "account already exists" email to the user if they try to register twice.

### 6. 🟡 Weak Password Enforcement
*   **The Loophole**: The password schema requires 8 characters but allows completely insecure passwords like "password".
*   **Remediation**: Enforce entropy checks (zxcvbn) and check against compromised password lists (HIBP).

---

## Part 2: Structural & Architecture Deficiencies

While the project is functional, its backend architecture resembles a basic CRUD app rather than a scalable social platform (like Reddit or Twitter).

### 1. Synchronous External I/O (Blocking the Event Loop)
*   **The Issue**: When a user registers, the FastAPI backend sends the Brevo email synchronously within the request lifecycle via `requests`/`urllib`. Because Python's `requests` is blocking, the entire FastAPI worker thread halts until Brevo responds. If Brevo takes 2 seconds to respond, your server throughput drops to near-zero.
*   **Industry Standard**: Heavy I/O or third-party API calls (emails, push notifications, image processing) MUST be offloaded to a background task queue.
*   **Remediation**: Implement **Celery** or **Arq** (with your existing Redis instance) as a background worker. The API should instantly return `201 Created` while Celery sends the email asynchronously.

### 2. Lack of Centralized Frontend API Client (Workflow Bottleneck)
*   **The Issue**: Throughout the Next.js frontend, API calls are made using raw `fetch()` strings (`fetch(`${API_URL}/users/${username}`)`). There is no centralized error handling, request interception, or automatic token injection.
*   **Industry Standard**: Enterprise React codebases use centralized API clients (like `axios` instances or structured custom `fetch` wrappers) combined with query managers (like `TanStack Query` / React Query) for automatic caching, re-fetching, and optimistic UI updates.
*   **Remediation**: Build a centralized API wrapper class and implement React Query for data fetching to prevent duplicate network requests and improve UI responsiveness.

### 3. Missing Output Caching for Heavy Reads
*   **The Issue**: `GET /users/{username}` hits the PostgreSQL database every single time. As YoTop10 grows, public profiles (which rarely change) will crush the database under read-heavy traffic.
*   **Industry Standard**: Platforms like Twitter cache frequently accessed read-models in Redis.
*   **Remediation**: Add a Redis caching layer to the user profile and post discovery endpoints, invalidating the cache only when the user updates their profile.

### 4. Overly-Coupled ORM and API Layers
*   **The Issue**: The `users.py` router manually maps ORM objects into Pydantic responses (`_build_profile_response`). This tightly couples the database structure to the JSON presentation layer.
*   **Industry Standard**: Using the Data Transfer Object (DTO) pattern or strict Pydantic `from_attributes=True` separation.
*   **Remediation**: Shift formatting and computation logic out of the routers and into dedicated Service or Transformer classes.

### 5. Silent Failures on Background Dependencies
*   **The Issue**: If MinIO or Redis goes down, FastAPI attempts to connect during a user request, times out, and returns a generic `500 Internal Server Error` with no graceful degradation.
*   **Industry Standard**: Implement a robust `/health` endpoint that checks all backing services (Postgres, Redis, MinIO) and use circuit breakers (e.g., `pybreaker`) to instantly return `503 Service Unavailable` when a dependency is known to be down, rather than hanging the application.

## Conclusion
To elevate YoTop10 to an industry-standard backend architecture:
1. Move to **Stateful Sessions** via Redis/Postgres for true auth revocation.
2. Introduce a **Background Task Worker** (Celery/RQ) for all emails and heavy processing.
3. Implement **Rate Limiting** API-wide.
4. Adopt **React Query** and a centralized API client on the frontend.
