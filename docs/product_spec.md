# YoTop10 — Product Specification v0.1

> A futuristic, debate-first platform where facts and opinions collide through ranked lists, comparisons, and community verdicts.

---

## 1. Brand Identity

| Field | Value |
|---|---|
| **Name** | YoTop10 *(may rebrand later — see Section 21 for name ideas)* |
| **Tagline** | *"Fact mine. Debate ground. Your list vs the world."* |
| **Positioning** | Medium × Reddit × Myspace — built for lists, facts & arguments |
| **Tone** | Passionate, controversial, credible, community-driven |
| **Audience** | Global. Anyone with a hot take backed by facts. |

---

## 2. Core Concept

YoTop10 is a **social publishing platform** centered on:
- **Top lists** (Top 10, Top 5, Top 25, etc.)
- **Debates** (This vs That, Who Is Better, Best Of)
- **Fact drops** (sourced opinion pieces disguised as ranked content)

The mission: **build the internet's best fact mine and debate ground** — where quality content gets argued, verified, and ranked by real people with real passion. No algorithm. No ads. No monetization pressure. Pure content.

---

## 3. Post / Content Types

| Type | Description | Example |
|---|---|---|
| **Top List** | Ranked items with written justification per item | "Top 10 Most Influential Scientists Ever" |
| **This vs That** | Two-item head-to-head comparison | "Kendrick vs Drake: Who Really Won?" |
| **Who Is Better** | Multi-candidate comparison | "Messi, Ronaldo, Pelé — Final Verdict" |
| **Fact Drop** | Short sourced statement or discovery | "5 facts about X that nobody talks about" |
| **Best Of [Period]** | Time-scoped curated lists | "Best Movies of 2024" |
| **Worst Of** | Inverse list (controversy magnet) | "Top 10 Most Overrated Albums" |
| **Hidden Gems** | Underrated/undiscovered topic lists | "10 Countries No One Talks About" |
| **Counter List** | A direct rival to an existing list | "My rebuttal to [Author]'s Top 10 Rappers" |

> All post types support images per item and optional source citations.

---

## 4. List Format Rules

- **Length**: Flexible (Top 5 to Top 25+), but default and preferred is **Top 10**
- **Items**: Each item requires a **title + written justification** (mandatory)
- **Sources**: Optional but strongly encouraged — a "sourced" badge is awarded
- **Images**: One image per item (optional). No videos. Clean reading experience.
- **Editing**: Authors have a **2-hour window** that starts at **review approval** to edit. After that, locked. ✅
- **Categories**: Every post must be tagged with at least one category (see Section 10)

---

## 5. User Roles & Tiers

### Anonymous User
- Created with: **name + password only** (no email required)
- Platform stores device cookies/fingerprint to prevent spam (disclosed in ToS)
- Can post, comment, vote, react, follow, connect

### Standard User (Email/Google)
- Created with: **Google OAuth** or **email + verify + password + name**
- All anonymous user capabilities + email digest + notification preferences

### Author ⭐
- Unlocked after **20 posts approved** by editorial review
- Benefits: Posts pushed higher in public feed, Author badge on profile, priority review queue

### Editor / Admin (internal)
- Reviews submitted posts for public feed qualification
- Can feature lists, manage communities, resolve reports

---

## 6. Feed System

> **Core principle: No algorithm. Chronological by default. No filter bubbles.**

### Public Feed (Global)
- Shows all **editorially approved** posts, newest first
- Anyone can see it, logged in or not
- Paginated, no infinite scroll rage-bait tricks

### Personal / Connection Feed
- Shows posts from **people you follow or are connected with**
- Includes posts that didn't pass editorial review (private-quality posts)
- Can be set to **private mode** (only YOU see your own posts, others can't see them unless approved)

### Hot Takes Page (separate)
- The most **controversial and debated** posts right now
- Separate page — doesn't pollute the main feed
- Ranked by debate activity (replies, counter-lists, per-item challenges)

### Weekly / Monthly Best Pages
- Editorial + community-voted best lists of the week/month
- Static pages updated on schedule

### List of the Year
- Annual community + editorial award for best list

---

## 7. Review & Moderation System

- All new posts enter a **review queue** before hitting the public feed
- **Authors** (20+ approved posts) get **priority review** — faster pipeline
- If a post is **not approved**, it still lands in the author's personal/connection feed
- Review criteria: Is it on-topic? Is it reasonably sourced? Is it quality writing?
- **Moderator at launch**: Founder solo. Community moderators can be appointed per-community as the platform scales.

### Strike System
- Users accumulate **strikes** for violations (spam, abuse, misinformation, etc.)
- Strikes are manually issued by admin/moderators
- **Default thresholds** (editable in admin dashboard):
  | Strikes | Consequence |
  |---|---|
  | 1 | Warning only — user notified |
  | 2 | 7-day account suspension |
  | 3 | Permanent ban |
- Admin can override thresholds for any individual user at any time

### Auto-Hide Rules (Suggested Standards)
Admin sets conditions from dashboard — all individually toggleable:

| Condition | Default Threshold | Notes |
|---|---|---|
| **Report threshold** | 5 reports within 2 hours | Most common trigger |
| **Keyword filter** | Configurable banned word list | Auto-hides on match |
| **Anonymous spam** | >3 posts in 30 minutes from same device | Anti-spam |
| **New user rapid posting** | >5 posts in 1 hour for accounts <7 days old | Reduces bot activity |
| **Engagement anomaly** | Mass reports from accounts created same day | Coordinated attack detection |

- All thresholds are editable from the admin dashboard
- Auto-hidden posts go into an **admin review queue** — not deleted
- Post stays visible to the author in their personal feed

---

## 8. Engagement & Reaction System

> **Not likes. Something that means something.**

### Reaction System (v1 — evolving)
- **MVP reaction**: 🔥 **Fire** (single reaction, clean and simple for launch)
- Will evolve post-launch into richer system as community grows
- Reactions apply to: posts, individual list items, and comments

> [!NOTE]
> The real engagement goal is driven by **structural actions** — replies, counter lists, per-item challenges, rival lists — not just reaction icons. Reactions are supplementary. The debate mechanics ARE the engagement system.

### Reaction system sits alongside:
- Replying to a comment
- Challenging a specific item (⚡ per-item debate thread)
- Publishing a Counter/Rival List
- Voting on the Community Version of a list
- Endorsing a position in a Battle View

### Voting System (Futuristic)
Not Reddit upvotes. Instead, a **"Verdict Meter"** system:
- Each post accumulates a **community verdict** based on reactions and engagement
- Verdicts: `CONFIRMED` / `CONTESTED` / `HOT TAKE` / `DEBUNKED` / `UNDECIDED`
- Displayed as a **animated meter/bar** on the post card — not a number
- High-engagement posts trigger a **"Jury's Out"** spotlight on the Hot Takes page

### Per-Item Challenges
- Any user can **challenge a specific ranked item** in a list
- Challenge opens a threaded debate anchored to that item
- The challenged item gets a ⚡ indicator on the list
- Author can optionally respond to defend their ranking

### Rival Lists / Counter Lists
- Any author can publish a **Counter List** directly linked to another list
- **No review process** — Counter Lists publish immediately
- On the original list page, the **original list is always prominently displayed** alongside any counter lists
- A **"Rivals" button** appears on any list that has been countered
- Clicking it shows all rival lists in Battle View

### Community Version
- Once a list reaches a high engagement threshold, a **"Community Version"** is auto-generated
- Readers can vote to reorder items — the community ranking sits alongside the author's original
- Shows: Author's ranking vs Community's ranking (side by side)

---

## 9. Comment System

- **Two comment modes** on any post:
  1. **Item Comment** — anchor your comment to a specific list item (item is highlighted, comment threads off it)
  2. **Full Post Comment** — comment on the list as a whole
- Comment threads support **nested replies** (max 3 levels to keep it readable)
- Comments support **reactions** too (🔥 Fire for now, evolving later)
- A comment can itself become a **mini-debate** if it gets enough engagement

---

## 10. Categories & Communities

### Categories (Post Tags — Broad)
Film & TV · Music · Sports · Science & Tech · History · Politics · Food & Drink · Travel · Gaming · Books & Literature · Pop Culture · Business · Environment · Philosophy · True Crime · Other

### Discussion Communities (Curated by Owner)
- Not Reddit-style open subreddits
- **Hand-picked** topics that work well as ongoing communities
- Owner (you) can expand the list over time
- Examples: `#FilmDebates` `#MusicCourt` `#SportsTribunal` `#ScienceFacts`
- Users can **post into** a community or just **follow** it

---

## 11. Author Profiles

- Every user has a **public profile page**
- Futuristic default style (matching site theme)
- **Custom theme option**: Users can write their own **HTML + CSS** to customize their profile (Spacehey-style)
  - Sandbox environment to prevent malicious code
  - Preview before applying
- Profile shows: Posts, Reactions received, Author tier, Badges, Communities followed

---

## 12. Badges & Ranks

| Badge | Trigger |
|---|---|
| ⭐ Author | 20 posts approved |
| 🔥 Hot Lister | 3+ posts on Hot Takes page |
| ✅ Fact Master | 10+ posts with "Verified" community verdict |
| ⚔️ Rival Champion | Won 3+ Battle View votes |
| 🏆 List of the Year | Annual award winner |
| 💀 Most Controversial | Most "Challenge" reactions in a month |
| 🧠 Mind Changer | Post changed the most minds (Big Brain reactions) |

---

## 13. Virality Features

| Feature | How it drives virality |
|---|---|
| **Shareable List Cards** | Auto-generated OG image for each list (looks great on Twitter/X, WhatsApp) |
| **Battle Cards** | Side-by-side rival list image, perfect for "who's right?" shares |
| **Verdict Cards** | Shareable image showing community verdict + reaction breakdown |
| **Hot Takes Page** | Curated controversy = people screenshot and share |
| **Counter List mechanic** | Authors publicly challenging each other = drama = shares |
| **Community Verdict meter** | "This list is 73% CONTESTED" — people share to prove their point |
| **"Most Argued" badge** | Authors flex their controversial reputation |
| **Email digest** | "Most argued list this week" re-engages dormant users |
| **Newest-first feed** | Fair visibility for all — no algorithm gatekeeping, everyone has a shot |

---

## 14. Authentication & Privacy

| Method | Details |
|---|---|
| **Anonymous** | Name + Password only. Device cookie/fingerprint stored (disclosed in ToS). No email ever. |
| **Google OAuth** | One-click, email pulled from Google |
| **Email** | Email + verification code + password + display name |

- All account types can post, vote, and comment
- Privacy settings: Public profile / Connections-only / Private
- Post visibility: Public (pending review) / Connections-only / Private (drafts)
- **No traditional DMs** — the only private interaction is via **Ephemeral Community Threads** (see Section 22)

---

## 15. Language & Localization

- Browser `Accept-Language` header detected automatically on first visit
- If detected language is supported, UI switches to it
- User can manually override language in settings
- ⚠️ *Note: Browser itself does NOT auto-translate your site — you must provide translations. Consider `next-i18next` for Next.js. Prioritize English first, expand later.*

---

## 16. Design System

### Theme 1: Futuristic (Default)
- **Palette**: Orange-Red Neon `#FF4500` · Hot Pink `#FF0080` · Pure White `#FFFFFF` · Deep Black `#0A0A0A`
- **Feel**: Premium, clean, minimal but electric
- **Dark/Light toggle**: Yes
- **Typography**: Modern geometric sans (e.g., Space Grotesk, Outfit, or Sora)
- **Micro-animations**: Glow effects, smooth transitions, reaction burst animations
- **Card style**: Glassmorphism with neon border accents

### Theme 2: Retro (Optional, user-selectable)
- **Palette**: Classic Myspace palette — hot pink, teal, lime, dark navy
- **Feel**: Nostalgic, raw, expressive — like early 2000s internet
- **Dark/Light toggle**: None — retro mode has one fixed look
- **Typography**: Old-school web fonts (Comic Sans as Easter egg? Impact, Verdana, etc.)
- **Custom profiles**: Even more expressive in retro mode

---

## 17. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router) |
| **Backend** | Python + FastAPI |
| **Database** | PostgreSQL *(recommended — relational data fits well)* |
| **Auth** | NextAuth.js (Google OAuth + Credentials) + FastAPI JWT |
| **File Storage** | Cloudinary or Supabase Storage (for images) |
| **Email** | Resend or SendGrid (for digest + verification) |
| **Hosting** | Vercel (frontend) + Railway/Render (FastAPI backend) |
| **Language Detection** | `next-i18next` + browser `Accept-Language` |
| **Custom Profile Sandbox** | CSS sandboxed iframe with allowlist |
| **OG Image Generation** | `@vercel/og` or Puppeteer (for shareable cards) |

---

## 18. Page Structure (Routes)

```
/                        → Homepage (Public Feed, newest first)
/hot                     → Hot Takes Page
/weekly                  → Weekly Best
/monthly                 → Monthly Best
/year                    → List of the Year
/post/[id]               → Single List/Post page (blog view)
/post/[id]/battle        → Battle View (rival lists)
/post/[id]/community     → Community Version of a list
/communities             → Browse Communities
/c/[slug]                → Single Community feed
/profile/[username]      → Author Profile
/profile/[username]/edit → Profile editor (HTML/CSS)
/submit                  → New Post composer
/auth/login              → Login page
/auth/signup             → Signup (anon, email, Google)
/settings                → Account/privacy settings
/admin                   → Editorial review queue (admin only)
```

---

## 20. Resolved Decisions (All Questions Answered ✅)

| Question | Decision |
|---|---|
| Platform name | **YoTop10** (may rebrand later) |
| Edit window | Starts at **review approval**, 2-hour window |
| Moderation at launch | **Founder solo**, scale with hires when viral |
| Reaction system | **🔥 Fire** for MVP |
| Verdict Meter | `CONFIRMED / CONTESTED / HOT TAKE / DEBUNKED / UNDECIDED` |
| Private interaction | **Ephemeral Threads** only (within communities) |
| Auto-hide | 5 conditions, all editable in admin dashboard |
| Strike thresholds | 1=Warning, 2=7-day suspend, 3=Permanent ban (editable) |
| Counter List review | **No review** — publishes instantly, original post highlighted |
| Report routing | **Both** community mod + admin receive simultaneously |
| User reports | Content only (posts/comments) — cannot report users directly |
| Moderator powers | **Granular permission list** set by admin per moderator |
| Anonymous fingerprinting | Device fingerprinting (disclosed in ToS) |
| Timeline | Whenever it's ready — passion project |

---

## 20. Open Questions (Still Need Answers)

> [!IMPORTANT]
> These decisions still need your input.

1. **Anonymous fingerprinting**: Device fingerprinting or lighter method (IP rate limiting)?
2. **Counter List approval**: Goes through review, or Authors post them directly?
3. **Auto-hide conditions**: What specific conditions trigger auto-hiding a post? (e.g., X reports in Y hours, specific keywords, unverified sources?)
4. **Strike thresholds**: How many strikes before warning / suspension / ban? (e.g., 1=warning, 2=7-day suspend, 3=permanent ban)
5. **Community reports**: How does the report system work inside communities? (Who sees it? What happens auto vs manual?)
6. **Timeline**: Passion project or launch deadline?

---

## 21. Admin Dashboard

> Massive solo-operated dashboard. Built to scale — hire moderators when viral.

### Content & Post Control
- **Review queue**: Accept / Reject posts only (no editing user content)
- **Feature/pin** a post to the top of the public feed
- **Schedule** Weekly Best / Monthly Best picks from dashboard
- Auto-hidden posts queue for manual review

### Strike & Ban System
- Issue strikes manually to users
- View full strike history per user
- Warn / Suspend / Permanently ban accounts
- Strike thresholds: *(TBD — see Open Questions)*

### Community Management
- Create / Edit / Rename / Archive communities
- Pin posts inside a community
- Appoint community moderators:
  - **Internal**: Tag-invite via Ephemeral Thread (see Section 22)
  - **External**: Send a one-time invite link via email (expires in 10 minutes)
- **Set per-moderator permissions** from a granular permissions list (see below)
- Community moderators have only the powers you explicitly grant them

#### Moderator Permission Options (Admin selects per moderator)
| Permission | What It Allows |
|---|---|
| `pin_posts` | Pin/unpin posts in community feed |
| `remove_posts` | Hide/remove posts from community feed |
| `approve_posts` | Community-level post approval before appearing in feed |
| `warn_members` | Send an official warning to a community member |
| `kick_members` | Remove a user from the community (not platform ban) |
| `ban_from_community` | Ban a user from the community permanently |
| `review_reports` | See community report queue |
| `dismiss_reports` | Close/dismiss a reported content without action |
| `issue_community_strike` | Issue a community-scoped strike (escalates to admin for platform strike) |
| `edit_community_info` | Edit community name, description, rules, banner |
| `create_announcements` | Post pinned announcements visible to all community members |
| `invite_members` | Invite specific users to join the community |
| `view_community_analytics` | See engagement stats for the community |
| `manage_community_threads` | View and close ephemeral threads if abuse reported |

### User Management
- View user profiles, post history, strike records
- Manually **grant or revoke Author status** at any time
- No user impersonation (user privacy respected)
- Future: Verified badge (not yet)

### Analytics (Real-Time)
- Live active users
- Most debated posts (by reply/challenge volume)
- Top authors (by engagement + approvals)
- Daily/weekly active users
- Post approval rate
- Most shared lists
- Strike + ban activity log
- Feed health (posts submitted vs approved ratio)

### Report & Flag Management
- See all reported content in one unified queue (posts + comments, all communities)
- Reports routed to **both** the community moderator AND admin simultaneously
- Users can only report **content** (posts/comments) — not other users directly
- Filter by: type (post / comment), community, severity, status
- Resolve reports: Dismiss / Warn User / Remove Content / Strike User
- Community moderators see only their community's reports and can act within their permissions

---

## 22. Ephemeral Thread System (Community Private Threads)

> The ONLY form of private interaction on the platform. Inspired by Discord threads + Snapchat burn timer.

### How It Works
1. Any user inside a community can **create a Private Thread**
2. They **tag/invite** one or more users by username
3. The thread is **visible only to participants**
4. Creator sets a **burn timer**:
   - Auto-expire: X minutes/hours **after the last recipient responds**
   - Auto-burn: Delete **before the recipient even sees it** (ephemeral drafts)
5. Once the timer hits, the thread and all messages are **permanently deleted** — no archive

### Key Rules
- Only works **inside a community** (not platform-wide)
- Cannot be screenshot-notified (best-effort, platform won't block screenshots but won't encourage them)
- Admin can appoint moderators via thread — the invite is the moderator nomination
- External moderator hire: Admin sends a 10-minute expiry **email invite link** to join the community and see the thread
- No media in threads for MVP (text only to start)

### Why This vs DMs
- Keeps the platform focused on **public debate**
- Prevents clique formation and backroom drama
- Burn timers reinforce the ethos: say what matters, then let it go
- Privacy by design — nothing persists

---

## 23. MVP Scope (Suggested)

For a first working version, focus on:

**Core**
- [ ] User auth (email + anonymous + Google)
- [ ] Submit all post types (Top List, This vs That, Fact Drop, etc.)
- [ ] Editorial review queue (admin panel — accept/reject, pin, feature)
- [ ] Public feed (newest first, paginated)
- [ ] Personal/connection feed
- [ ] Single post page (blog view with item justifications + images)
- [ ] 🔥 Fire reaction (posts, items, comments)
- [ ] Comment system (item-anchored + full-post mode, nested replies)
- [ ] Categories & basic search/filter
- [ ] Basic profile page (futuristic theme default)
- [ ] Dark/light toggle
- [ ] Per-item challenge threads ⚡
- [ ] Rival/Counter List mechanic + Rivals button
- [ ] Verdict Meter (CONFIRMED / CONTESTED / HOT TAKE / DEBUNKED / UNDECIDED)
- [ ] Strike system + ban controls
- [ ] Auto-hide rules engine
- [ ] Admin dashboard (review queue, analytics, user management, community tools)

**Post-MVP (v2)**
- Battle View (rival lists side by side)
- Community Version of a list
- Curated Discussion Communities
- Ephemeral Thread System
- Custom HTML/CSS profile editor
- Retro theme
- Shareable OG cards (list cards, battle cards, verdict cards)
- Email digest
- Badge & rank system
- Weekly/Monthly Best pages
- List of the Year
