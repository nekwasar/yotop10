# YoTop10 — Build Milestones

## M1 — Project Foundation
- Monorepo structure setup
- Next.js frontend scaffold
- FastAPI backend scaffold
- PostgreSQL database setup
- Environment configuration
- CI/CD pipeline setup
- GitHub repository + open source setup

## M2 — Database Schema
- Users table
- Posts table
- List items table
- Categories table
- Comments table
- Reactions table
- Follows table
- Connections table
- Communities table
- Community members table
- Reports table
- Strikes table
- Badges table
- Ephemeral threads table
- Verdicts table

## M3 — Authentication System
- Email signup + verification
- Google OAuth
- Anonymous account creation
- Device fingerprinting (anonymous spam prevention)
- JWT session management
- Password reset flow
- Account privacy settings (public / connections-only / private)

## M4 — Core User Profiles
- Public profile page
- Display name, bio, avatar
- Profile post history
- Badges display
- Author tier display
- Follow / connect buttons
- Profile privacy enforcement

## M5 — Post Submission
- Post composer (all post types: Top List, This vs That, Fact Drop, Best Of, Worst Of, Hidden Gems)
- List item builder (title + justification + optional image per item)
- Category tagging
- Source citation fields
- Post privacy selection
- Draft saving
- Submission to review queue

## M6 — Editorial Review Queue (Admin Core)
- Admin login + protected routes
- Review queue (pending posts list)
- Accept / Reject post actions
- Rejected post notification to author
- Approved post goes to public feed
- Unapproved post stays in personal feed
- Priority queue for Author-tier users

## M7 — Public Feed
- Newest-first chronological feed
- Pagination (no infinite scroll)
- Post cards with verdict meter placeholder
- Category filter
- Guest access (no login required)

## M8 — Personal / Connection Feed
- Feed from followed users + connections
- Includes unapproved posts from connections
- Post visibility enforcement (private posts hidden)
- Switch between public and personal feed

## M9 — Post Detail Page (Blog View)
- Full blog-style post rendering
- Ranked list items with justifications + images
- Sources display
- Author info + follow button
- Category tags
- Rivals button (if counter lists exist)
- Community Version button (if threshold reached)
- Verdict Meter display
- Edit window indicator (2-hour countdown after approval)

## M10 — Follow & Connection System
- Follow an author
- Follow a category/topic
- Send / accept / decline connection requests
- Connection feed visibility rules
- Manage following / connections in settings

## M11 — Reactions
- 🔥 Fire reaction on posts
- Fire reaction on list items
- Fire reaction on comments
- Reaction count display
- Reaction toggle (react / unreact)

## M12 — Comment System
- Full post comment thread
- Item-anchored comment (highlights specific list item)
- Nested replies (max 3 levels)
- Reactions on comments
- Comment pagination
- Comment count on post card

## M13 — Per-Item Challenge System
- Challenge button on each list item
- Challenge opens a debate thread anchored to that item
- ⚡ indicator on challenged items
- Author can reply to defend ranking
- Challenge thread nested under item

## M14 — Counter List (Rival List) System
- Counter List post type linked to an original list
- Instant publish (no review required)
- Rivals button appears on original post
- Original list always prominently displayed alongside counter lists

## M15 — Verdict Meter
- Community verdict calculation (based on reactions + engagement)
- Verdict states: CONFIRMED / CONTESTED / HOT TAKE / DEBUNKED / UNDECIDED
- Animated meter display on post card and post detail page
- Verdict updates in real time as engagement changes

## M16 — Battle View
- Side-by-side view of original list vs all counter lists
- Community vote on which list is better
- Battle score display per list

## M17 — Community Version of a List
- Auto-generate community version when post hits engagement threshold
- Readers vote to reorder items
- Community ranking displayed alongside author's original ranking

## M18 — Strike System
- Manual strike issuance (admin + community moderators)
- Strike history per user
- Auto-consequence enforcement (1=warning, 2=7-day suspension, 3=ban)
- Editable thresholds in admin dashboard
- User notification on strike received

## M19 — Auto-Hide Rules Engine
- Report threshold trigger
- Keyword filter (configurable banned word list)
- Anonymous spam detection
- New user rapid posting detection
- Engagement anomaly detection
- Auto-hidden posts queue in admin
- All thresholds configurable from admin dashboard

## M20 — Report System
- Report button on posts and comments
- Report reason selection
- Reports routed to admin + community moderator simultaneously
- Report queue in admin dashboard
- Resolve actions: Dismiss / Warn / Remove Content / Strike User

## M21 — Badge & Rank System
- Author badge (20 approved posts)
- Hot Lister badge
- Fact Master badge
- Rival Champion badge
- List of the Year badge
- Most Controversial badge
- Mind Changer badge
- Badge display on profile and post cards
- Admin manual grant/revoke Author status

## M22 — Hot Takes Page
- Separate page for most debated content
- Ranked by debate activity (replies, challenges, counter lists)
- Jury's Out spotlight for highest-engagement posts
- Does not appear on main feed

## M23 — Weekly / Monthly Best Pages
- Editorially curated best lists per week / month
- Admin schedules picks from dashboard
- Static display pages

## M24 — List of the Year
- Annual community + editorial award
- Nomination and voting system
- Winner badge awarded

## M25 — Discussion Communities
- Community creation (admin only)
- Community feed (post/comment style)
- Join / follow a community
- Post inside a community
- Community rules display
- Browse communities page

## M26 — Community Moderation & Permissions
- Moderator appointment via admin dashboard
- Internal appointment via Ephemeral Thread tag-invite
- External appointment via 10-minute expiry email invite link
- 14-permission granular system (pin, remove, approve, warn, kick, ban, review reports, dismiss reports, issue strike, edit info, announcements, invite, analytics, manage threads)
- Moderator scoped to their community only

## M27 — Ephemeral Thread System
- Private thread creation inside a community
- Tag/invite users by username
- Burn timer settings (expire after response / auto-burn before seen)
- Permanent deletion on timer expiry
- Admin can appoint moderators via thread
- Text-only for MVP

## M28 — Custom HTML/CSS Profile Editor
- Profile editor with HTML + CSS input
- Sandboxed iframe rendering (CSS allowlist, no JS)
- Live preview before applying
- Reset to default option
- Retro theme profiles especially expressive

## M29 — Admin Dashboard — Full Build
- Review queue (accept/reject, pin, feature post)
- User management (profiles, post history, strike records, Author grant/revoke)
- Community management (create/edit/rename/archive, pin, moderator appointment)
- Strike & ban management (issue, view history, warn/suspend/ban)
- Report management (unified queue, filters, resolve actions)
- Auto-hide rules configuration
- Feed control (feature/pin post to top of public feed)
- Weekly/Monthly Best scheduling
- Real-time analytics dashboard (live users, top posts, top authors, approval rate, share volume, ban log, feed health)

## M30 — Futuristic Theme (Design System)
- Design tokens (orange-red neon, hot pink, white, deep black)
- Typography (Space Grotesk / Outfit / Sora)
- Component library (cards, buttons, inputs, modals, verdict meter, feed items)
- Glassmorphism card style with neon border accents
- Micro-animations (glow, transitions, reaction bursts)
- Dark mode
- Light mode
- Dark/light toggle

## M31 — Retro Theme
- Myspace-inspired palette and layout
- Fixed single appearance (no dark/light toggle)
- Retro typography
- Enhanced compatibility with custom HTML/CSS profiles

## M32 — Shareable OG Cards
- Auto-generated OG image for each list post
- Battle card (original vs rival side by side)
- Verdict card (community verdict + reaction breakdown)
- Optimized for Twitter/X, WhatsApp, Instagram

## M33 — Email System
- Email verification (signup)
- Weekly "Most Argued" digest
- Strike / suspension notifications
- Support auto-reply
- Moderator invite email (10-min expiry link)
- Opt-in / opt-out preferences

## M34 — Localization & Language Detection
- Browser Accept-Language header detection
- Manual language override in settings
- i18n setup (next-i18next)
- English first; framework ready for future languages

## M35 — PWA & Mobile Optimization
- Responsive design across all pages
- Progressive Web App manifest
- Offline fallback page
- Mobile-optimized feed, post, and comment UX
- App installable from browser (Add to Home Screen)

## M36 — Help Center & Documentation
- /help page with full-text search
- All user doc sections (account, content, engagement, feeds, communities, threads, safety, badges, settings, themes)
- FAQ (pre-written, expandable)
- Support contact form → support email
- Strike/ban appeal form
- Bug report → GitHub Issues link

## M37 — Launch Preparation
- End-to-end QA across all features
- Performance audit
- Security audit (auth, sandbox, fingerprinting, API)
- SEO setup (meta tags, OG tags, sitemaps)
- Launch announcement post written (on YoTop10 itself)
- README and contributing guide finalized
- Open source repository published

## M38 — Post-Launch
- Monitor real-time analytics
- First editorial review wave
- FAQ updated from real user questions
- Bug triage from GitHub Issues
- Community seeding (first hand-picked communities live)
- First Weekly Best published
- Roadmap published (v2 features)
