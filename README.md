# YoTop10

> Fact Mine. Debate Ground. Your list vs the world.

A futuristic, debate-first platform for ranked lists, facts, and arguments. Think Medium meets Reddit — but built entirely around top lists, counter lists, and fact-backed debates.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router, TypeScript) |
| Backend | Python FastAPI |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Reverse Proxy | Traefik v3 (multi-app, auto SSL) |
| Image Storage | MinIO (self-hosted S3) |
| Email | Brevo (free tier) |
| CI/CD | GitHub Actions + self-hosted runner |

## Security Features

- **Rate Limiting** - Protection against brute-force attacks on auth endpoints
- **Session Management** - Stateful sessions with device tracking and 90-day duration
- **Token Revocation** - Users can logout from all devices, sessions auto-revoke on password change
- **Email Verification** - Required for sensitive actions
- **Password Strength** - zxcvbn entropy checking prevents weak passwords
- **HttpOnly Cookies** - XSS-protected token storage option
- **Privacy Enforcement** - Profile visibility: Public / Connections-only / Private

## Running Locally (Dev)

### Requirements
- Docker + Docker Compose
- Node.js 20+ with pnpm
- Python 3.11+ with uv

### Setup

```bash
# 1. Clone repo
git clone https://github.com/YOUR_USERNAME/yotop10.git
cd yotop10

# 2. Copy and fill in environment variables
cp .env.example docker/.env
nano docker/.env   # fill in real values

# 3. Start databases (PostgreSQL, Redis, MinIO)
cd docker && docker compose up -d postgres redis minio

# 4. Start frontend
cd ../frontend && pnpm install && pnpm dev

# 5. Start backend
cd ../backend && uv venv && source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend: http://localhost:3000  
API: http://localhost:8000  
API Docs: http://localhost:8000/docs

## Production Deploy

Push to `main` — GitHub Actions handles the rest:
```
git push origin main → GitHub Actions → server rebuilds + restarts containers
```

## Features

### Post Types
- Top List - Ranked items with justifications
- This vs That - Binary comparisons
- Fact Drop - Factual claims with sources
- Best Of / Worst Of - Opinion rankings
- Hidden Gems - Underrated recommendations

### Social
- Fire Reactions 🔥
- Comments & Nested Replies
- Per-Item Challenges
- Counter Lists (Rivals)
- Community Verdicts
- Follows & Connections

### Moderation
- Strike System (1=warning, 2=7-day suspension, 3=ban)
- Auto-Hide Rules Engine
- Report System
- Community Moderators

### Coming Soon
- Multi-Account Device Management (M4.5)
- Ephemeral Threads
- Custom Profile HTML/CSS
- Weekly/Monthly Best Lists

## Docs

- [`product_spec.md`](./product_spec.md) — Full product specification
- [`milestones.md`](./milestones.md) — Build milestones overview
- [`milestones/`](./milestones/) — Detailed milestone implementation guides
- [`milestones/security.md`](./milestones/security.md) — Security architecture review
- [`milestones/multi-account.md`](./milestones/multi-account.md) — Multi-account feature spec
- [`required.md`](./required.md) — Pre-development checklist

## License

MIT
