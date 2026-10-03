# Bug Tracker

> Last updated: 2026-10-03 — M31 empty-state sweep ([M31.9]–[M31.16]) closed B5.

## Open

### Data Integrity

| # | Area | Description | Priority |
|---|---|---|---|
| B1 | Category post_count | `post_count` shows 0 for first 5 minutes after server boot. Reconciler cron runs every 5 minutes. First tick corrects all counts. No startup race (reconciler runs immediately on boot), but if that initial run fails silent, counts stay stale until the cron fires. **Fix**: add retry with exponential backoff on startup, or fetch counts on-demand via aggregation per category view. | Medium |
| B2 | Orphaned posts | If `category_id` existed but `category_slug` migration resolved to `__orphan__`, those posts have no valid category. Currently 0 orphaned posts in dev. But no admin UI to view or reassign them. **Fix**: admin dashboard widget showing orphaned post count with bulk reassign. | Low |
| B3 | Duplicate index warnings | MongoDB logs `Duplicate schema index on {"slug":1}` and `{"normalized_title":1}`. Both fields declare `index: true` in the schema AND have `schema.index()` calls later. Only one definition needed per field. **Fix**: remove `index: true` from schema fields that have explicit `schema.index()` definitions. | Low |

### Route / API

| # | Area | Description | Priority |
|---|---|---|---|
| B4 | Dead comments routes | Comments router is mounted at `/api/comments` with routes like `GET /api/comments/posts/:id/comments`. But comments are also served from the posts router at `/api/posts/:idOrSlug/comments`. Two code paths. The comments router's `/posts/:id/comments` and `POST /posts/:id/comments` were already removed. Remaining: `GET /api/comments/comments/:id` (double-comments URL) for PATCH/DELETE/SPARK. These work but the URL pattern is unclean. **Fix**: mount comments router at `/api/comments` with clean paths `/:id`, `/:id/spark` (no `/comments/comments` prefix). | Medium |

### Frontend

| # | Area | Description | Priority |
|---|---|---|---|
| B6 | Submit page — missing match display | Check-title endpoint returns `matches: [{title, slug, category_slug, similarity}]`. The frontend only displays blocked/warning/allowed status text. It never renders the actual matching post titles. User sees "⚠️ Similar titles found" but has no idea WHICH titles. **Fix**: render match titles as clickable links below the title input when matches exist. | Medium |
| B7 | Post detail — empty category display | Post detail page shows `category_slug` (e.g., "sports/football-soccer") as raw text in the metadata line. Ideally this should be the human-readable name like "Football (Soccer)". **Fix**: load categories on mount, build slug→name map, display resolved name. | Low |
| B8 | Admin pending post detail — no category display | Admin pending post detail page shows `category_slug` as raw text (same as B7). **Fix**: same slug→name resolution, or include category name in the pending post API response. | Low |

### Documentation / Cleanup

| # | Area | Description | Priority |
|---|---|---|---|
| B9 | Outdated milestones.md | References `category_id`, "1-25 items", "Next.js 14", "max 3 levels", "5-300 chars", "Admin CRUD for categories". All outdated. | Medium |
| B10 | Outdated plans.md | `PostSubmission` interface uses `category_id` and `checkTitle` signature passes `categoryId`. Both changed to `category_slug` and global check. | Medium |
| B11 | Outdated product_spec.md | Post type count says 1-25, title min length 5, comment depth 3, admin dashboard routes list `/admin/dashboard` which doesn't exist. | Medium |
| B12 | Stale bugs.md header | Previously said "No known bugs at this time" — false. | Done |

### Elasticsearch

| # | Area | Description | Priority |
|---|---|---|---|
| B13 | Elasticsearch unused | ES is connected at startup but has zero indexes, zero search endpoints, zero data flowing into it. It's a running container consuming memory with no purpose. **Fix**: either implement M12 search, or disable ES container in dev compose to save resources. | Low |

---

## Recently Fixed (2026-10-03 — M31 empty-state sweep, [M31.9]–[M31.16])

| Fix | Description |
|-----|-------------|
| `[972a90a]` | **B5 (was High)** SSR exempt from the fingerprint grace counter: SSR requests send `X-Internal-Request` with `INTERNAL_API_SECRET`, backend `isInternalRequest()` mints an anonymous identity without touching Redis; cap 10 → 30 |
| `4372481` | Shared `ssrLoad` retry (3 attempts, backoff) + `DataLoadError`/`ReloadButton` on `/articles`, `/explore`, `/hall-of-fame` |
| `cc4a1e0` | Homepage: all 5 feeds through `ssrLoad`, `getBaseUrl` no longer falls back to `backend:8000` in the browser, outage screen instead of "Welcome to YoTop10" |
| `3ee1812` | `/arguments`: no mount refetch over SSR data; failure keeps the retry affordance instead of blanking to `[]` |
| `695aba6` | `/categories`: check `r.ok` + array shape before rendering |
| `5a28578` | `DesktopHallOfFame` reads `featured` (was `entries`), `DesktopTrending` reads `trending[].query` (was `terms`) |
| `edf8041` | New `GET /api/stats/platform` (Zod + 60s Redis cache) behind the always-hidden DesktopStats rail |
| `dabc49f` | `/c/[...slug]` 404s only on an explicit 404; outages render a retry screen, not a dead link |

---

## Recently Fixed (2026-05-05 Session)

| Fix | Description |
|-----|-------------|
| `[86a06bf]` | Slug-based categories — eliminated all 8 post-category mapping flaws |
| `[de45ecd]` | Admin retry (revision request) — no trust score penalty |
| `[86a06bf]` | Global check-title — no category silo, 200-post max |
| `[86a06bf]` | Category delete protection — hierarchy-aware prefix match |
| `[86a06bf]` | Reconciler — diff-aware post_count aggregation, startup + 5min cron |
| `[7b82b9e]` | Admin auth deadlock — router-level whitelist |
| `[7b82b9e]` | Session revocation — token_version in JWT |
| `[7b82b9e]` | Brute force protection — account-lock with cascading cooldowns |
| `[7b82b9e]` | Error codes — code-based API responses for proper frontend handling |
| `[0f81fe2]` | Admin fingerprint exemption — admin routes bypass fingerprint middleware |
| `[e650321]` | Seed script resilience — service layer, post_count hook fix |
| `[6b1d39f]` | Missing check-title route — placed before /:idOrSlug catch-all |
| `[e409d1e]` | NaN guards on rate limits — trust_score + activeBoost guards |
| `[0759b25]` | Comment NaN guard — rate limit limit=NaN fix |
| `[6aae44d]` | Hydration fix — useRef counter, force-dynamic on error pages |
