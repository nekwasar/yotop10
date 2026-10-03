# RAM.md — Random Access Memory: Current Task State

> **Last updated**: 2026-10-03
> **Working tree**: Clean — committed and pushed (only untracked `ref-yotop10/` + `backend/uploads/migrations-backups/`, both intentionally not committed)
> **Branch**: main → up to date with origin/main
> **Latest commits**: `af5c1ed [M32.4]`, `522d53a [M32.3 docs]`, `f36dfbd [M32.3]`, `ad93544 [M32.2 docs]`, `39a0546 [M32.2]`
> **Active milestone**: **M32 — UGC & Search Compliance** (planned 2026-10-03, plan in `docs/plans-m32-ugc-search-compliance.md`)

---

## Current Health

All gates run **inside the dev container** (`docker exec yotop10_dev`), which now ships
`.eslintrc.json` + `vitest.config.ts` for both packages as of [M31.6].

| Check | Status |
|-------|--------|
| Backend typecheck (`tsc --noEmit`) | ✅ 0 errors |
| Frontend typecheck (`tsc --noEmit`) | ✅ 0 errors |
| Backend lint | ✅ 0 errors, 0 warnings |
| Frontend lint | ✅ 0 errors, 0 warnings |
| Backend build (`tsc`) | ✅ 0 errors |
| Frontend build (`next build`) | ✅ exit 0 (scratch-dir `NODE_ENV=production` build + `Dockerfile.frontend` prod image) |
| Backend tests (vitest) | ✅ 57 files (56 passed, 1 skipped), 798 passed, 4 skipped |
| Frontend tests (vitest) | ✅ 24 files, 188 passed |
| Prod stack (compose `-p yotop10`) | ✅ 7/7 containers healthy |
| Dev stack (compose `-p yotop10dev`) | ✅ `yotop10_dev` up, :3200 / :8200 200 |

---

## What Has Been Done

### Recent commits (top of main):
1. **[M31.16]** `/c/[...slug]` 404s only on a real 404 — outages render a retry screen (`ApiError` + `isNotFound`, `ssrLoad` terminal-error predicate)
2. **[M31.15]** New public `GET /api/stats/platform` (Zod + 60s Redis cache) behind the always-hidden DesktopStats rail
3. **[M31.14]** Homepage rails read the payloads the API actually returns (`featured`, `trending[].query`)
4. **[M31.13]** Categories: check `r.ok` + array shape before rendering
5. **[M31.12]** Arguments: stop the mount refetch from blanking server-rendered posts
6. **[M31.11]** Homepage: all 5 feeds through `ssrLoad`, browser API base fallback fixed, outage state
7. **[M31.10]** SSR failures render a retry state instead of a false empty state
8. **[M31.9]** Fingerprint grace: exempt SSR via shared secret, cap 10 → 30 (root-cause fix for B5)
9. **[M31.8]** Gitignore `ref-yotop10/` + `backend/uploads/migrations-backups/`
10. **[M31.7]** Docs sync: ram.md health table, M31.5/M31.6 log, Docker runbook
11. **[M31.5]–[M31.6]** Tablet nav duplicate icons; Docker bring-up fixes (ES healthcheck, nginx depends_on, dev image ships lint+test configs)
12. **[M31.1]–[M31.4]** YoTop10 handbook (7 chapters, print CSS, PDF/EPUB pipeline) + design template PDF moved into docs/handbook
13. **[M30.1]–[M30.8]** OG image overhaul (light cards, www domain, a11y alt)

### Milestones completed (all checked ✅):
M1 (Foundation), M2 (Schema), M3 (Submit), M4 (Feed), M5 (Post Detail), M6 (Categories), M7 (Comments), M9 (Admin Auth), M10 (Admin Dashboard), M11 (User System), M12 (Search), M13 (Arguments), M14 (Hall of Fame), M15 (Identity), M17 (Moderator System)

### ROM issues resolved ✅ (14 of 19):
Hardcoded JWT, orphaned setInterval, $regex injection, stub 200s, health check ordering, dynamic import on approval, module-level cron, 'unknown' fingerprint, Redis singleton, route barrel export, localStorage crashes, 425 infinite recursion, XSS in JSON-LD, Eruda safety guards

---

## What Remains Open

### Still open ROM issues (5 marked ⏳):
| # | Issue | Notes |
|---|-------|-------|
| 1.9 | MongoDB replica set for transactions | `withTransaction()` crashes on standalone |
| 1.10 | Orphaned comments on deletion | Grandchildren may be orphaned |
| 2.7 | TOCTOU rate limit race | Non-atomic zRemRange/zCard/zAdd |
| 2.8 | findOne→findOneAndUpdate race | Display name update in users.ts |
| 2.10 | Non-null assertion after findById | `!` in posts.ts:488 |

### Unfinished features:
- **M32** — UGC & Search Compliance: 9 tasks (M32.1–M32.9), approved 2026-10-03, 5 of 9 done
  (M32.1 link qualification `cec40df`, M32.9 unique identity URLs `ee8da1d`, M32.2 index
  hygiene `61af11b` + `39a0546`, M32.3 authorship structured data `f36dfbd`, M32.4
  guidelines + reporting `af5c1ed`)
- **M5.6** — Counter-List System (The Arena): challenge/rebuttal, comparison engine, SEO governance
- **M10.7** — Categories Management frontend: tree view, drag-drop, bulk ops, analytics
- **M10.14** — Admin UI components: StatsChart, CategoryTree, UserBadge, SearchInput, DateRangePicker, ExportButton, ConfirmDialog
- **V2.x** — Post changelog/revisions, email notifications, design themes
- **Deployment** — "Deployed and verified" unchecked
- **V1 MVP** — "Deployed and verified" unchecked

### Code quality items (from ROM):
- `any` escapes in fingerprint.ts, rate limit type mismatch, AudioContext leak, hash & hash no-op, magical category count formula

---

## Next Steps (Priority Suggestion)

1. **M32 — UGC & Search Compliance** *(ACTIVE, approved 2026-10-03)* — 9 tasks, execute in
   this order: ~~`M32.1` link qualification~~ ✅ `cec40df` → ~~`M32.9` unique identity URLs~~
   ✅ `ee8da1d` → ~~`M32.2` index hygiene~~ ✅ `61af11b` + `39a0546` → ~~`M32.3`
   authorship/structured data~~ ✅ `f36dfbd` → ~~`M32.4` guidelines + report flow~~ ✅
   `af5c1ed` → `M32.8` AI-assisted badge → `M32.5` discussion structured data →
   `M32.6` guard tests → `M32.7` Search Console verification + docs. Full plan:
   `docs/plans-m32-ugc-search-compliance.md`.
2. **Lock in stability** — Fix 5 remaining ROM issues (crash/data integrity)
3. **Complete admin UI** — Categories tree view, remaining components
4. **Build the Arena** — M5.6 Counter-List System (major feature)
5. **Deploy & verify** — Production deployment
6. **Post-MVP** — V2 features, theming, notifications

---

## M32 — UGC & Search Compliance (planned 2026-10-03)

**Research conclusion (Google primary sources)**: Google has **no real-name and no
human-authorship requirement**. It requires content created for people (people-first doc,
updated 2026-10-01), authored by a **genuine, non-fabricated source** (QRG §4.5.3 fails
AI-generated/made-up author profiles), and **not mass-produced to manipulate rankings**
(scaled-content-abuse policy — method-agnostic: automation, humans, or a combination). For
UGC, Google's own position is "if you publish it, it's your content": publish an abuse policy,
let users report, `noindex` posts from users with no reputation (lift later), and mark
user-placed links `rel="ugc"`/`nofollow`.

**Adopted decisions (D1–D9)** — full table in `docs/plans-m32-ugc-search-compliance.md` §2:

| ID | Decision |
|----|----------|
| D1 | **Anonymous but accountable** — no real-name rule; byline → permanent profile with history/approval-rate/trust tier *is* the "Who" |
| D2 | **No fabricated identity** — no AI headshots, fake credentials, or synthetic (`any_seed`) authors in prod |
| D3 | **Judge the post, not the tool** — AI vs human is never an index/rank/moderation signal |
| D4 | **Reputation gate** — indexable only if author has ≥1 approved post ∧ age ≥ 7d ∧ `trust_score` ≥ 1.0, else `noindex` (auto-lift) |
| D5 | **Optional AI disclosure** — author-toggled `Post.ai_assisted` badge + policy line in `/docs/guidelines`; never a signal |
| D6 | **`rel="ugc nofollow noopener noreferrer"`** on every user-placed outbound link |
| D7 | **Thin profiles noindexed** — empty bio ∧ 0 approved posts, and excluded from `sitemap-profiles.xml` |
| D8 | **Keep the 14 machine-named anonymous profiles** (real users) — contain via D7, do not purge |
| D9 | **Unique identity URLs** — fix `toPublicSlug` 4-hex collision (`a_dbb4_aed5` → `/a/dbb4`) ✅ shipped `ee8da1d` |

**Audit findings F1–F10** (file-level evidence in the plan doc §3), the biggest being:
no `rel="ugc"` anywhere in the frontend (F1), all 17 profiles indexable with no `robots` meta
and no sitemap filter (F2), and the noindex/sitemap rule mismatch (F3).

**Status**: 5 of 9 tasks done — **M32.1** link qualification (`cec40df` + `a91c8fe` docs),
**M32.9** unique identity URLs (`ee8da1d`), **M32.2** index hygiene (`61af11b` + `39a0546`,
D4 extended to articles per `docs/product_spec.md` §22.2), **M32.3** authorship structured
data (`f36dfbd`), **M32.4** abuse policy + public reporting (`af5c1ed`, endpoint docs in
`docs/product_spec.md` §22.6). Each task = one gated, pushed commit `[M32.n]`, docs synced
per AGENTS.md §3.0. Next: `M32.8` AI-assisted badge.

---

## Latest Verification

- **M32.4 abuse policy + public reporting (2026-10-03)** — commit `af5c1ed` (23 files).
  Gates: backend tsc 0 / lint 0-0 / **798 tests** (57 files, 4 skipped); frontend tsc 0 /
  lint 0-0 / **188 tests** (24 files); scratch-dir production `next build` exit 0.
  New `Report` model + `schemas/report.ts` + `routes/reports.ts`: `POST /api/reports` =
  require-user → Zod validate → restricted 403 → `atomicCheckRateLimit` 10/h → resolve
  target (404 when missing/deleted) → self-report 400 → idempotent open-report `200
  {duplicate:true}` → `201 {report_id}` + `report_content` audit; comment targets also
  mirror into the legacy flag queue (`flag_type: 'user_report'`, only when currently
  unflagged). Admin: `GET /api/admin/reports` (status filter incl. `all`, enriched
  target preview: exists/title/excerpt/href) + `PATCH /api/admin/reports/:id`
  (actioned/dismissed; dismissing clears a mirrored comment flag; `action_report` /
  `dismiss_report` audits), permissions `comments:read` / `comments:moderate` registered
  in `permissionMap.ts` **and** the route list in `permissionGuard.test.ts`.
  Frontend: `components/ReportButton.tsx` (reason dialog → POST; 401/429/400/duplicate
  toasts; dialog links to the guidelines) wired into the post header, comment action row
  and article header; `/docs/guidelines` (7 sections, `robots: index, follow`) linked from
  the docs index `LEGAL` list, the footer (footer now exposes Docs/Guidelines/Terms/
  Privacy/Cookies) and `/new`; `/admin/reports` queue page + nav entry (`comments:read`)
  + `user_report` badge label in the comments queue. Tests: `routes/reports.test.ts`
  (17: auth, validation, rate limit, self-report, idempotency, comment mirror, admin
  list/resolve/404/400), `ReportButton.test.tsx` (9), `docs/guidelines/page.test.tsx` (6:
  metadata indexable + content coverage). Live probes: `POST /api/reports` → 401 and
  `GET /api/admin/reports` → 401 without credentials (both routes registered); production
  build serves `/docs/guidelines` 200 with `<meta name="robots" content="index, follow">`,
  footer/docs-index/`/new` links present, and post + article SSR emit the Report trigger.

- **M32.3 authorship structured data (2026-10-03)** — commit `f36dfbd` (8 files, +461).
  Gates: frontend tsc 0 / lint 0-0 / **173 tests** (22 files); backend unchanged but re-run:
  tsc 0 / lint 0-0 / **781 tests**; scratch-dir production `next build` exit 0.
  New `frontend/src/lib/seo/structuredData.ts` builds `ProfilePage` + `Person`
  (name = `toPublicSlug`, url, bio, image, `sameAs` from the three visible social links,
  member-since as `OrganizationMembership.startDate`, all omitted when absent — no invented
  fields) and `Article` (headline, 160-char description mirroring the meta description,
  image/cover, `datePublished`/`dateModified`, `articleSection`, `author` Person → profile
  URL); `components/AuthorCard.tsx` renders the standardized byline: avatar →
  `By {name}` → profile link → `Member since {date}` → `History` →
  `/a/{slug}#post-history` (anchor added to the profile posts tab). Wired on
  `/a/[username]` and `/articles/[slug]` (member-since via one cached
  `GET /users/{author}` read, `revalidate: 3600`); post pages untouched (plan scope).
  Tests: `structuredData.test.ts` (13) + `AuthorCard.test.tsx` (4) assert exact schema
  shapes, the byline↔JSON-LD URL equivalence and that empty optionals stay absent.
  Live production-build probe: profile emits `ProfilePage`/`Person` with
  `@id …#profile`/`…#person`; article emits `"@type":"Article"` with
  `"author":{"@type":"Person","name":"cyprianzube","url":"https://yotop10.com/a/cyprianzube"}`,
  byline/`History` anchors and `id="post-history"` all resolve, `robots` still
  `noindex, follow` (M32.2 unchanged).
- **M32.2 index hygiene (2026-10-03)** — commits `61af11b` (20 files, +1190) + `39a0546`
  (D4 on articles). In-container gates: backend tsc 0 / lint 0-0 / **781 tests** (55 files,
  4 skipped); frontend tsc 0 / lint 0-0 / **156 tests** (20 files); frontend production build
  exit 0 (scratch-dir `NODE_ENV=production`), fast gate ~3.5 min. Rule engine consolidated:
  `backend/src/lib/seoGuard.ts` (`shouldNoIndex` + `min_content_length` + `author_reputable` +
  `profileRobots`) and new `backend/src/lib/reputation.ts` (D4: ≥1 approved post ∧ account age
  ≥7d ∧ `trust_score` ≥1.0, batched by author, fail-closed when the author is unknown) drive
  **both** `/posts/:idOrSlug` and `/articles/:slug` detail responses plus new
  `GET /posts/sitemap`, `GET /articles/sitemap` and the `/users/:username` → `robots` field;
  frontend `frontend/src/lib/seo/indexability.ts` mirrors the rules for every
  `generateMetadata` and the posts/articles sitemap filters (F3 closed by construction).
  Verified on a **production build + `next start` probe** (stale port-3999 server from a prior
  session was killed first — it had been answering with an old build):
  `/claim` and `/username-history` → `<meta name="robots" content="noindex, follow"/>`
  (F4); thin profile `noindex` / `cyprianzube` `index, follow`; `sitemap-posts.xml` = 0 `<loc>`,
  `sitemap-articles.xml` = 0 (4 of 5 pre-D4), `sitemap-profiles.xml` = only
  `https://yotop10.com/a/cyprianzube`. Dev-stack re-verify after `pm2 restart frontend-dev`
  (the dev Next data cache still held the pre-filter 17-profile list):
  profile sitemap = 1, both other sitemaps = 0, article page `noindex, follow`.
  **Live D4 impact (auto-lifts)**: the single content author account is 2 days old, so all 25
  posts and all 5 articles are `noindex, follow` until **2026-10-08**; `trust_score` defaults
  to 1.0 (range 0.1–2.0), so only the age gate currently blocks.
- **M32.1 + M32.9 (2026-10-03)** — gates in-container: backend tsc 0 / lint 0-0 / **736 tests**;
  frontend tsc 0 / lint 0-0 / **136 tests**; frontend production build exit 0 (scratch-dir
  `NODE_ENV=production npx next build`, 3m32s). Live on the dev stack (same DB as prod):
  `GET /api/users/dbb4` → `canonical_url: /a/dbb4_aed5`; `/a/cyprianzube` unchanged;
  `sitemap-profiles.xml` emits `/a/dbb4_aed5`, `/a/a726_8c7f`, … ; canonical profile URLs
  render with **zero** meta-refresh tags (no loop); legacy `/a/dbb4` serves a
  `meta http-equiv=refresh` hand-off to the canonical URL plus `rel=canonical` (page-level
  `redirect()` cannot set a status because App Router has already flushed the stream — the
  same app-wide reason every `notFound()` returns 200).
- **Fast build gate adopted**: scratch-dir build in `yotop10_dev` (~3.5 min) as the per-commit
  gate, `Dockerfile.frontend` image build (~11.5 min) as the definitive one — never build in
  place at `/app/frontend`, and always force `NODE_ENV=production` (the container exports
  `NODE_ENV=development`, which fails `next build` at the `/404` prerender).

- **Empty-state sweep (M31.7–M31.17, 2026-10-03)** — reported symptom: every page could render
  an empty state ("Be the first to rank your top 10", "No articles yet", "No active debates")
  on reload despite a populated DB; homepage worst.
  **Root cause (live-reproduced before the fix)**: `fingerprint.ts` counted every cookie-less
  request against one per-IP Redis grace budget keyed by the frontend container's IP, so SSR
  burned it instantly — 14 cookie-less calls returned `200×10` then `425×4`, Redis held
  `grace:::ffff:172.18.0.3 = 25`, and 6 rapid homepage reloads produced 44,853-byte pages with
  2× `Welcome to YoTop10` while HTTP said 200 and all 5 backend calls said 425. 14 distinct
  contributors were then enumerated and fixed:
  1. **[M31.9]** SSR sends `X-Internal-Request` (`INTERNAL_API_SECRET`, required in both compose
     files); `isInternalRequest()` mints an anonymous identity without touching the counter
     (timing-safe, fails closed). `MAX_GRACE_REQUESTS` 10 → 30. +6 backend, +3 frontend tests.
  2. **[M31.10]** `ssrLoad` (3 attempts, 200/400ms backoff, `{data,failed}`) + `useInitialFailure`
     + `DataLoadError` + `ReloadButton` on `/articles`, `/explore`, `/hall-of-fame`.
  3. **[M31.11]** Homepage: all 5 feeds through `ssrLoad`; `getBaseUrl()` no longer falls back to
     `http://backend:8000/api` in the browser (that hostname does not resolve client-side);
     `contentUnavailable` renders an outage screen with `ReloadButton`.
  4. **[M31.12]** `/arguments` mount refetch no longer `catch → setPosts([])`; query-key guard
     skips the identical immediate refetch; empty branch renders `DataLoadError` when `failed`.
  5. **[M31.13]** `/categories` checks `r.ok` + `Array.isArray` + retry button (was `as any`).
  6. **[M31.14]** `DesktopHallOfFame` read `entries` (API sends `featured`), `DesktopTrending`
     read `terms` (API sends `trending[].query`); both unmount-cancelled + contract tests.
  7. **[M31.15]** New public `GET /api/stats/platform` (Zod `schemas/stats.ts`, 60s Redis cache,
     cache best-effort) — `DesktopStats` had been calling a route that never existed, plus
     `.toLocaleString()` hardening. **Test-harness bug found here**: `beforeEach(() => x.mockReset())`
     returns the Mock, which vitest records as an onTestFinished cleanup hook and *calls* after
     the test — that was the phantom second `apiFetch` and the bogus "425 Too Early" failures.
  8. **[M31.16]** `ApiError` + `isNotFound` carry the HTTP status (message format unchanged for
     the 5 screens parsing `API Error: (\d+)`); `ssrLoad` gained `error` + `isTerminal`; `/c/[...slug]`
     404s only on a real 404, outages show a retry screen, bare `/c` is a missing page.
  **Gates (in-container, 2026-10-03)**: backend tsc ✅ lint ✅ 0/0 build ✅ 52 files / 713 tests ✅;
  frontend tsc ✅ lint ✅ 0/0 build ✅ (prod image, exit 0) 17 files / 120 tests ✅.
  Note: never build in place at `/app/frontend` inside `yotop10_dev` — it fights the running
  `frontend-dev` pm2 process for `.next` (leaves `ENOENT prerender-manifest.json`). Fast
  build gate (~3.5 min): copy sources to `/tmp/febuild` (exclude `.next`/`node_modules`,
  symlink `node_modules`) and run `NODE_ENV=production npx next build` — the container's
  exported `NODE_ENV=development` otherwise fails the build at `/404` with
  `<Html> should not be imported outside of pages/_document`. Definitive gate (~11.5 min):
  the `Dockerfile.frontend` prod image build. Repair only if the dev server is hit anyway:
  `pm2 stop frontend-dev && rm -rf .next && pm2 start frontend-dev`.
  **Prod verification (`docker compose -p yotop10 up -d --build`, 6/6 healthy)**:
  - 35 cookie-less backend calls → `200×30` then `425` (cap 30); wrong `X-Internal-Request`
    → 425 (fails closed); real secret → 200 immediately after exhaustion.
  - 70-request SSR burst (20× `/` plus 10× each `/articles`, `/explore`, `/arguments`,
    `/c/sports`, `/hall-of-fame`, 8 workers, 16.1s): **70/70 HTTP 200, byte-identical per page
    (276,015 / 65,191 / 84,965 / 135,617 / 96,950 / 59,724), zero false-empty markers.**
  - `GET /api/stats/platform` 200 on :8100 and through the frontend rewrite; `refresh=nope` → 400.
  - `/c/sports` → `Sports & Athletics — YoTop10`; `/c/nope-cat-xyz` → `Category Not Found`
    (no failure card, no empty list); backend stopped → `Category — YoTop10` + retry card.
  - Commits `972a90a`…`dabc49f` ([M31.9]–[M31.16]) pushed to `origin/main`; docs synced in this
    [M31.17] commit (`bugs.md` B5 closed, `rom.md` +5 resolved rows, `product_spec.md` §6,
    `detailed.md` endpoint contract).

- **Abuse response (M20.1–M20.3, 2026-09-14)** — bot flood (19 accounts/24h in pairs, zero-cluster
  fp collisions, 36-second handle squat) met with: simple math challenge + per-IP rate limits on
  identity creation; middleware read-only on bootstrap paths (it was minting before the route's
  challenge ran — caught live, fixed, re-verified 400/403/200); cookie-round-trip gate (428) on
  rename/seed-key/device-link/merge-confirm; SHA-256 client fingerprint hash; fp aliases with
  rotation of the exposed nabbed identity (seamless via alias); cross-user-only demotion with audit
  receipts. DB surgery: 20 bot + 11 test accounts removed (zero content each, verified first),
  3 ghost-authored seed posts re-homed, admin password rotated + sessions killed (old pw 401s).
  Users: exactly 3 legit remain. Admin password rotated + sessions killed (old pw 401s).
  Follow-up M20.4: refused to merge the "stranger" account (its fingerprint is a hand-set bot
  value looping re-mints — merging would have armed it with the cutie identity); deleted it and
  denied the value instead (403 on mint, grace-heal on reads). Backend typecheck ✅ lint ✅
  tests ✅ 674 passed.
- **Loop-breaker (M21, 2026-09-14)** — the math question cost scripts nothing (one more bot
  account appeared mid-session and solved it). Replaced with proof-of-effort: 20-bit SHA-256
  puzzle, ~1-3s silent compute per new device, ~3.4M hashes verified live per mint. Minting now
  requires the issued cookie (one-shot scripts: 428); wrong/empty solutions 403/400. Renames and
  seed keys frozen for young untrusted accounts (7 days or trust ≥ 1.0). Live verified end to
  end, test accounts removed (3 legit users remain). Backend ✅ 678 tests pass. Frontend
  typecheck ✅ lint ✅ **build ✅ EXIT 0, zero errors** (1 pre-existing hall-of-fame test fail,
  untouched). Frontend PoW solver + stale share-button tests fixed alongside.
- **Re-link (2026-09-14)** — the "new user every visit" loop was the owner's own browser: its
  stable cookie survived each cleanup, so the 425 auto-mint silently re-minted after every
  deletion (same cookie behind a_222a and a_eadd). Deleted a_eadd (zero content), aliased the
  owner's cookie to cutie, verified live that the cookie now resolves to cutie (user_id
  54f39ac86e1f07ab, bio + posts intact). No bot-farm activity in logs — flood is over.
- **M22 fixes (2026-09-14)** — rename 403 was the maturity lock firing on the stranger account
  (young + untrusted), correct behavior; rename form now shows the server's real reason instead
  of a generic failure. Missing seed images regenerated locally (gradient covers, exact
  filenames) — all 4 serve 200. Bio placeholder rewritten to invite a real bio. Frontend
  typecheck ✅ lint ✅ build ✅ EXIT 0.
- **M22.1 (2026-09-14)** — seed posts use the standard imageless background (DB refs nulled,
  generated covers removed — no fake art). Bot still trickling (~1/min, PoW-bound): 3 more
  removed, mint limits tightened to 5/hr/IP, their rename attempts blocked by the maturity lock
  (the 403s in logs are the bot's, not the owner's — cutie is mature and exempt). Rename form
  now surfaces validation messages too.
- **M23 pending articles (2026-09-14)** — admin had zero article moderation (articles sat in
  pending_review with no UI and no API). Added: Article rejection_reason, article notification
  types, articles:read/approve permissions (catalog, map, presets), 7 admin endpoints
  (list/detail/approve/reject/cancel/bulk), full review UI (queue + detail) + sidebar entry.
  Verified live with admin session; 1 flood-debris article waiting in the queue for the owner.
  Backend 682 tests ✅, frontend build ✅ EXIT 0.
- **M22.2 (2026-09-14)** — article/list-image validators demanded absolute URLs while the
  uploader returns site-relative paths (every uploaded cover 400'd). Shared `uploadUrl`
  validator + tests, used by both routes; verified live with the reporter's exact file
  (400 → 401 fail-closed on auth, validation clean; file itself serves 200). Note: dev
  backend needed a manual pm2 restart — tsx watch did not pick up the change. Frontend typecheck ✅ lint ✅ **build ✅ EXIT 0, zero errors**.
- **Profile hydration (M18.6)** — `/a/cutie` hydration mismatch traced to a STALE cached app-page
  chunk in the browser (old `md:hidden` mobile-wrapper bundle hydrating fresh server HTML; the served
  chunk and server HTML were verified fresh and matching). Immediate fix for the viewer: hard refresh.
  Hardening committed: owner-only upgrade (`isOwn`, auth `trustScore`) applies after mount, so SSR HTML
  and first client render always agree. Frontend typecheck ✅ lint ✅ build ✅.
- **One-brain identity (M15.1)** — `backend/src/middleware/fingerprint.ts` rewritten: cookie is the
  single authoritative identity, `X-Device-Fingerprint` header is a recovery hint only (adopted when
  the cookie names nobody but the header names a known user). Reads NEVER mint users — anonymous
  requests flow through without `req.user`. Single creation site `createUserForFingerprint()` used by
  write paths + new `POST /api/users/init` (explicit bootstrap; ignores grace-fresh fingerprints,
  425s without client identity). Duplicate `declare module 'express'` block removed — sole `Request`
  extension is `backend/src/types/express.d.ts`. Fixed pre-existing unused `customShortForNew` in users.ts.
- **Real views (M5.7)** — new `backend/src/lib/viewCounting.ts` (`shouldCountView`: skips `X-No-Count`,
  prefetch/prerender, bots/crawlers/scrapers incl. curl/undici/empty-UA). Post + article detail skip
  increment for non-real fetches and author self-views. `POST /api/explore/view` locked: 400/401/404 +
  per-identity hourly dedup, returns `{counted}`. Frontend: `getPost/getArticle(..., {noCount})` used by
  all metadata/OG/history server fetches; ShareButton no longer tracks modal-open (copy-only in ShareModal).
- **Single-flight frontend** — `AuthInitializer` (no more 4s poll) + `useAuthStore.fetchUser` share one
  in-flight resolution; 425 triggers one explicit `POST /init`, then load. Logout claims via `/init`.
- **Live verified on yotop10.com (dev stack)**: post detail 200, curl views frozen (2→2), `/init` 425
  without identity / 200 with header, `/explore/view` 400 on empty body. Smoke-test users removed from DB.
- Backend typecheck ✅, frontend typecheck ✅, backend lint ✅ 0/0, frontend lint ✅,
  backend build ✅, frontend build ✅ EXIT=0, backend tests ✅ 671 passed (667 + 4 new viewCounting)

### Previous verification notes (kept for history)

- **Removed** faulty service worker entirely (13 files deleted) — SW was serving stale cached HTML, no CSS fix could overcome it
- **Replaced** all Tailwind responsive display utilities with plain CSS classes (`.hide-desktop`, `.show-desktop`) outside Tailwind's `@layer` to guarantee cascade wins. The `.show-from-sm` / `.show-from-sm-block` pair was removed in [M31.5] — see the tablet-nav entry under Latest Verification.
- **Fixed** hydration instability: removed empty `<Suspense>` wrapper around `<DynamicIsland>` that caused React to remount and strip className attributes
- **Lowered** `.hide-desktop`/`.show-desktop` breakpoint from 1024px to 980px to match Chrome Android "Request Desktop Site" viewport behavior
- **Committed and pushed** to `origin/main` — commits `7aa16346 [M00.7]` and `7958e402 [M00.8]`
- Frontend typecheck ✅, lint ✅ (0 errors), build compiled ✅, 32/32 static pages generated ✅

### Production deploy + relink (2026-09-15)
- **Host cutover**: fresh server, restore `yotop10-db.archive` via `mongorestore --drop` → 5 users / 24 posts / 5 articles / 341 categories (matches source). Archive shredded post-restore.
- **uploads_data**: `backend/uploads/` (22 files) copied into the named volume before backend start.
- **nginx.conf bug fix**: production upstreams corrected (`yotop10_dev` → `frontend`/`backend`) — was a copy-paste from dev compose; nginx was crashing with `host not found in upstream` until fixed.
- **Real TLS**: certbot `certonly --webroot` issued Let's Encrypt cert for `yotop10.com` + `www.yotop10.com`, expires 2026-12-14, YR1 issuer. Init-nginx.sh auto-detected, no self-signed fallback. Auto-renew installed by certbot.
- **`.env` + Dockerfile.frontend + docker-compose.yml**: converted hardcoded `NEXT_PUBLIC_*` to build args sourced from `.env`. www is now canonical, apex 301s → www. CORS allows both apex and www.
- **Relink on cutover (per docs/relink.md)**:
  - `/a/3a54` (a_3a54_037b) → **gojominitia**: full procedure. Fingerprint `0ce6930b3d4938877a1c52d37a3277724981a104ee555c6b75fe83580503d2be` aliased to user `cbd41aeb6627d62a`. Proved live: `/api/users/me` with the old fp returns gojominitia, server re-binds cookie to canonical `ebd94b05...`.
  - `/a/40b0` (a_40b0_4b3a) → **cutiee**: refused per safety check 2. Fingerprint `00000000695088c4` was 16 chars (not 32) and matched `isLowEntropyFingerprint()` (6 leading zeros), same family as the existing denied value `000000000f6f92bf` and cutiee's existing alias `000000000f6f`. **Same scenario as M20.4** (cutiee relink refused for the same reason). Stranger deleted, value NOT aliased.
- **Denylist extended**: added `00000000695088c4` to `DENIED_FINGERPRINTS` (`backend/src/middleware/fingerprint.ts:50`). Live test: `curl -b 'device_fingerprint=00000000695088c4' /api/users/me` → 425 with `Set-Cookie: device_fingerprint=16ce7c4fee0b27282910bb7570558b20` (fresh 32-char grace-heal). No mint.
- **Auto-reject low-entropy fingerprints**: wired `isLowEntropyFingerprint()` into `fingerprintMiddleware` so any value matching `/^0{6,}[0-9a-f]*$/i` is dropped to undefined the same way `DENIED_FINGERPRINTS` entries are. The grace generator produces 32-char random hex at ~1 in 16M for 6 leading zeros, so any match is hand-set by a script. New unit tests cover denylist + low-entropy helpers (`backend/src/middleware/fingerprint.test.ts`). Live verified: `00000000deadbeef` (not in the explicit set, just structurally bot-like) → 425 + fresh grace-heal. Grace generator output (`16ce7c4fee0b27282910bb7570558b20`) and 5-leading-zero strings (below threshold) pass through unchanged.
- **Backend typecheck ✅, lint ✅ (0/0), build ✅, 689 tests passed (4 skipped; +7 from the new fingerprint.test.ts)**. Frontend typecheck/lint/build ✅. Backend rebuilt + restarted; uploads_data volume preserved.

### SEO + OG platform overhaul (2026-09-15, [M24.1]–[M24.5])
- **Bug A (P0)**: `GET /api/posts/:idOrSlug` omitted `slug` from the `post` object while the list/counter/edit endpoints all included it. Every post page rendered `canonical` + `og:url` as `https://www.yotop10.com/undefined`. Fixed in `backend/src/routes/posts.ts:471`. Frontend now also uses `params.slug` (defense in depth).
- **Bug B (P0)**: `frontend/src/app/layout.tsx:53` hardcoded `openGraph.url: "https://yotop10.com"` (apex). Now env-driven (`NEXT_PUBLIC_SITE_URL`), structured og:image object with width/height/alt/type.
- **OG generators rewritten** (`[slug]/opengraph-image.tsx`, `articles/[slug]/opengraph-image.tsx`): previous versions used Satori-incompatible CSS (`display: -webkit-box`, `WebkitLineClamp`, `system-ui`/`monospace` fonts Satori cannot load), no `alt`, no immutable cache headers, per-request font I/O. New versions: Geist Sans/Mono TTF loaded once at module scope (`lib/seo/ogFonts.ts`), shared Satori-safe JSX primitives (`lib/seo/ogImageLayout.tsx`), `export const alt`, `runtime = 'nodejs'`, `Cache-Control: public, immutable, no-transform, max-age=31536000`.
- **New OG routes**: `app/opengraph-image.tsx` (homepage, live top-6 titles), `app/a/[username]/opengraph-image.tsx` (profile card), `app/og/category/route.tsx` (category card — route handler, NOT file convention, because `c/[[...slug]]` is a catch-all and Next.js forbids children after catch-alls; nginx proxies `/api/*` to backend so `/og/*` path used). `twitter-image.tsx` re-exports for homepage/post/article/profile (zero duplication).
- **Metadata standards** (`lib/seo/metadata.ts`): `buildArticleMetadata` / `buildProfileMetadata` / `buildWebsiteMetadata` builders. `og:type` per page (article/profile/website), structured og:image everywhere, `article:{publishedTime,authors,section,tags}`, `twitter:{site,creator,images}`, profile `username/firstName/lastName`. Category page gained `generateMetadata`. Homepage + 10 static pages gained canonical + og:url. Search/saved/notifications/pending marked `noindex`.
- **Article body bug fixed**: `articles/[slug]/page.tsx` was CSR-only (`ArticleDetailClient` fetched in `useEffect`, title rendered "Article Not Found" while metadata succeeded). Refactored to SSR-fetch + `initialArticle` prop, matching the post page pattern.
- **Sitemap cadence**: posts/articles `revalidate` 3600 → 300; categories/profiles stay 3600.
- **IndexNow** (`backend/src/lib/indexnow.ts` + tests): fire-and-forget POST to `api.indexnow.org` on post/article single + bulk approve. Inert without `INDEXNOW_API_KEY` (returns false, warn-log only, never blocks admin response). Key-file name helper for the `{key}.txt` ownership file.
- **Live verified**: post canonical/og:url/og:type/og:image:alt all www-correct; article title + h1 render server-side; all 6 sitemaps + robots 200; all 5 OG routes + category API route return valid 1200×630 PNGs (70–119KB); `Cache-Control: immutable` confirmed; profile og:image uses real avatar photo.
- **Gates**: backend typecheck ✅ lint ✅ build ✅ tests ✅ 693 passed (+4 indexnow); frontend typecheck ✅ lint ✅ build ✅. Commits [M24.0]–[M24.5].

### Device-dependent theme default + light-mode overhaul (2026-09-15, [M25.1])
- **Default**: desktop (≥980px, matches nav breakpoint) → light; mobile + tablet → dark. Stored `yotop10_theme` always wins; toggle writes storage permanently. No OS `prefers-color-scheme` detection (unchanged policy).
- **Infra**: new `frontend/src/lib/theme.ts` (`getPreferredTheme`/`applyTheme`/`persistTheme` + `THEME_INIT_SCRIPT` string constant so the blocking head script and the component can't drift). `layout.tsx` head script now applies stored-or-device default pre-paint + syncs `theme-color` meta; `viewport` uses per-scheme themeColor + `colorScheme: "dark light"`. `ThemeToggle` uses the shared helper.
- **globals.css extension** (~110 rules): solid dark surfaces (`bg-zinc-900` + `/70/80/90/95`, `bg-zinc-800`, `bg-black` page bg — scrims `bg-black/40|50|60` and on-photo badges deliberately untouched), all 9 `text-white/*` variants, `bg-white/15|20|25|30|40|50` + `/[0.06]`, rings (`ring-white/*`, `ring-zinc-700`), `divide-white/5`, `border-white/[0.03]`, gradient stops (`from-zinc-900`, `via-zinc-800`, `to-black`, …), gradient-button `text-white` guard (keeps white on CTAs by specificity), full `hover:`/`placeholder:` variant coverage, accent text darkening (`*-400` → `-700` + accent hover mappings) with same-element `bg-black/50|60` guards so on-photo badges keep bright hues, theme vars (`--color-muted/surface/border`) flip, glass/slab/spatial/wiki/scrollbar light variants, profile hero + trust-knob classes.
- **Component fixes**: profile hero banner + avatar fallback get dedicated light gradients; docs privacy/terms/cookies `bg-black` → `bg-[var(--color-bg)]`; trust slider knob gets `trust-knob` class (dark knob on light track); `new/client` type-picker h3 drops conflicting `text-white` (accent map now drives both modes).
- **Out of scope (deliberate)**: modal scrims + on-photo badges stay dark; OG PNG generators unaffected (not HTML theming); `AdminAlertBell` hardcoded-light inline styles noted as inverse issue for later.
- **Gates**: frontend typecheck ✅ lint ✅ build ✅. Live verified: head script contains `matchMedia('(min-width: 980px)')`, all new selectors present in served CSS, profile page 200, stack all healthy.

### Public loading skeletons + light-for-all + super-admin rotation (2026-09-15, [M26.1]–[M26.2])- **Skeletons (public only, admin excluded per scope)**: new `SearchSkeleton`, `NotificationDetailSkeleton`, `HistorySkeleton` (shared by post + username history) in `frontend/src/components/`, matching existing skeleton conventions (`animate-pulse` + `bg-white/*`, all light-mode covered). Wired into `search/client` (initial results), `notifications/[id]/client`, `[slug]/history/client`, `username-history/client`.
- **Light default for all devices**: `getPreferredTheme()` fallback is now unconditional `'light'`; head script simplified (stored-or-light). `DESKTOP_MIN_WIDTH`/`isDesktopWidth` exports retained as dead code per explicit instruction.
- **Super-admin rotation via sanctioned setup flow**: `adminusers` BSON backup to `/tmp` (since shredded post-verify), minted 15-min setup token, `POST /api/admin/setup` (`AdminUser.deleteMany` + bcrypt-12 create — no manual hash surgery). Verified: new login 200 + `super_admin`, `/api/admin/me` OK, `adminusers` count = 1 (new `_id`, old JWTs dead), token marked used. Temp secrets shredded.
- **Gates**: frontend typecheck ✅ lint ✅ build ✅. Live verified: head script fallback `'light'`, no `matchMedia` remnant, skeleton routes 200, stack all healthy.

### Admin edit overhaul: images, sources, required reasons + author notifications (2026-09-15, [M27.1]–[M27.3])
- **Post edit page** (`admin/posts/[id]/edit`): added hero image (`ImageUploader` reuse), per-item `image_url` + `source_url` fields, and a required reason picker (6 presets + custom ≤500 chars, blocks save until filled). GET `fields=` extended; PATCH body extended.
- **Article edit (new)**: backend `GET /admin/articles/:id` (any status) + `PATCH /admin/articles/:id` (title/body/category/cover/sources, no version lock — Article has no version field), frontend `admin/articles/[id]/edit/` page. **All Articles merged into All Posts**: `/admin/posts` is now tabbed All Content (Posts | Articles) with per-type stats/filters/tables/bulk actions; standalone `/admin/articles` list removed (pending routes + edit page stay).
- **Dropdown light-mode sweep**: last hard-hex `bg-[#0a0a14]` (CustomDropdown) → `bg-zinc-900`; on-image button text guards (`bg-black/60` + `text-white/80`/`hover:text-white` keep white). Verified zero `bg-[#hex]` remain; all other absolute menus already covered or deliberate scrims.
- **Notifications**: new `post_edited` / `article_edited` enum types; backend fires on every edit with the reason in the message; Bell + list + `[id]` detail render them explicitly (Pencil icon, "An admin edited your …", article links route to /articles).
- **Backend**: `lib/editReasons.ts` (presets + normalize/validate, tested), items image/source persisted incl. journal rollback path, audit `edit_post`/`edit_article` now carry `edit_reason`.
- **Live verified with temp super_admin (deleted after)**: PATCH without reason → 400 on both; PATCH with reason → 200 + correct notifications in DB. Test wiped one post's items — reconstructed 10 items + neutral intro via a second PATCH (disclosed).
- **Gates**: backend typecheck ✅ lint ✅ build ✅ tests ✅ 697 passed; frontend typecheck ✅ lint ✅ build ✅.

### Ranking order setting + mobile bell dot (2026-09-15, [M29.1]–[M29.2])
- **Mobile bell**: `DynamicIsland` had its own number badge (the one seen on mobile) → dot, matching the desktop bell fix.
- **`list_order: 'asc'|'desc'`** in `SystemConfig` (default `asc` = today's behavior), plumbed through `DEFAULT_CONFIG`/`leanToShape`/`updateConfig` (+audit) and `configUpdateSchema`; `PUT /admin/config` rejects non-super-admin with 403 (mirrors `double_blind` precedent).
- **Ordering helper** (`lib/listOrder.ts`, tested): `RANKED_LIST_TYPES` = top_list/best_of/worst_of/hidden_gems/counter_list; `orderItemsForDisplay` reverses per post type, no-ops otherwise. Rank numbers stay attached (no renumbering).
- **Public read paths**: posts list top-3 (now top-3 *of display order*), post detail, explore top-3. Untouched: revision history, admin/pending/edit/review paths (canonical ascending), compare diff engine (rank-keyed, order-independent).
- **`/admin/config` page** (super_admin, desktop nav entry): asc/desc radio cards + save; explains scope and countdown semantics.
- **Live verified**: desc → detail 10→1 numbers intact, list/explore show highest ranks first, this_vs_that unchanged [1,2]; invalid value → 400; mod+config:write → 403; reverted to asc → [1..10] restored. Temp verification admins deleted.
- **Gates**: backend typecheck ✅ lint ✅ build ✅ tests ✅ 700 passed; frontend typecheck ✅ lint ✅ (build in deploy step).

### Light OG cards per mockups + real post/article images (2026-09-15, [M30.1]–[M30.2])
- **Assets**: pulled remote `757def5` (user-uploaded `og-image.png` brand card + `og-image (2).png` user template, both 1200×630). Brand PNG converted to JPEG 47KB → replaced `public/og-image.jpg` (was 32KB, now on-brief). Root uploads consumed (kept in git history).
- **All 5 generators rebuilt light**: homepage = brand bars card (matches mockup 1); profile = logo + tier-colored trust pill + `{name} on YoTop10` + live stats + red CTA + avatar disc with real photo or monogram (matches mockup 2); post/article = logo + type badge + title + top items + **real hero/cover photo side panel when present**; category = light + top-3.
- **Two runtime bugs found by live logs and fixed**: (1) Satori multi-text-node div (`{category} · yotop10.com`) threw "explicit display:flex" → single template string; (2) Satori cannot decode WebP (`Unsupported image type`) → generators skip `.webp`/unknown extensions, fall back to text/monogram cards.
- **Gates**: frontend typecheck ✅ lint ✅ (0 errors) build ✅. All 5 routes 200 with valid 1200×630 PNGs; visually inspected home/profile/post renders against the mockups.

### OG corrections: exact homepage bytes, CTAs everywhere, profile 200px fix (2026-09-15, [M30.5]–[M30.6])
- **Homepage as-sent**: `app/opengraph-image.png` + `app/twitter-image.png` serve the exact uploaded bytes (321,398B verified). Lesson: static file-convention routes keep their extension (`/opengraph-image.png`); the extensionless URL is code-convention-only and was serving homepage HTML. Homepage meta updated accordingly.
- **CTAs added** (were missing): black "Join the Fun!" on post, article, and category cards.
- **Profile 200×200 fix**: metadata used to prefer the raw avatar URL (200px upload, falsely labeled 1200×630) → validators failed it on X/LinkedIn/WhatsApp/Slack. Now always the generator route (true 1200×630, avatar composited inside). Verified by resolving the tagged URL and reading PNG dims.
- **Post card verified visually**: real title, badge, www domain line, ranked items, CTA, external hotlinked photo renders fine.

### Tablet nav duplication + Docker bring-up fixes (2026-10-02, [M31.5]–[M31.6])
- **Bug reported**: on tablet screens the bottom nav *and* the top nav both rendered Search + notification bell → duplicate icons.
- **Root cause**: two visibility systems with different thresholds. `DynamicIsland` (bottom nav) hides at **980px** via `.hide-desktop`, but `DesktopTopBar`'s search input and bells appeared from **640px** via `.show-from-sm` / `.show-from-sm-block`. Every portrait tablet (768–912px: iPad, iPad mini, Surface Go, Android tabs) sits in the 640–979px overlap → both bars showed Search and Bell. Profile was never duplicated (top-bar profile only shows ≥980px).
- **Fix [M31.5]**: both elements switched to `.show-desktop` (≥980px) in `DesktopTopBar.tsx:35,48`; dead `.show-from-sm` / `.show-from-sm-block` rules deleted from `globals.css`. Below 980px the header is logo + hamburger and the bottom nav owns Search/Bell/Profile; from 980px the bottom nav is gone and the header carries search + bells + profile. Verified in served HTML: `show-from-sm` count 0, `show-desktop` present.
- **Docker defects found while bringing prod + dev up from clean [M31.6]**:
  1. ES healthcheck `start_period: 30s` (retries 5) but ES needs ~2min → first `compose up` aborted with `dependency failed to start: container yotop10-elasticsearch-1 is unhealthy`. Raised to **90s**.
  2. nginx had no `depends_on: frontend` → crash-looped on `host not found in upstream "frontend:3000"` until frontend existed. Added `depends_on: frontend: service_started`.
  3. `Dockerfile.dev` only COPYed postcss/tsconfig/next.config, so **`.eslintrc.json` and `vitest.config.ts` never reached the container** — `pnpm lint` died with `No files matching the pattern "src/"` and `pnpm test` failed 9/11 files with `Cannot find package '@/lib/api/client'`. COPYs added for frontend+backend eslint + vitest configs.
- **Runbook** (project dir is `/root/top10`, so `-p` must be passed to reuse the `yotop10_*` volumes/networks):
  - prod: `docker compose -p yotop10 -f docker-compose.yml up -d --build` → :80/:443/:3100/:8100
  - dev: `docker compose -p yotop10dev -f docker-compose.dev.yml up -d --build` → :3200/:8200
  - dev's external networks `yotop10_frontend_net` / `yotop10_backend_net` are created by the prod project, so **prod must come up first**.
- **Gates (all in-container, 2026-10-02)**: backend typecheck ✅ lint ✅ 0/0 build ✅ 700 tests ✅; frontend typecheck ✅ lint ✅ 0/0 build ✅ (prod image, exit 0) 84 tests ✅; prod 7/7 healthy; dev :3200 200 / :8200 200. Commits `e62fe9e [M31.5]`, `b80830a [M31.6]` pushed to `origin/main`.
