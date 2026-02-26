# YoTop10

> Fact Mine. Debate Ground. Your list vs the world.

A futuristic, debate-first platform for ranked lists, facts, and arguments. Think Medium meets Reddit — but built entirely around top lists, counter lists, and fact-backed debates.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router, TypeScript) |
| Backend | Python FastAPI |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Reverse Proxy | Traefik v3 (multi-app, auto SSL) |
| Image Storage | MinIO (self-hosted S3) |
| Email | Brevo (free tier) |
| CI/CD | GitHub Actions + self-hosted runner |

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

## Docs

- [`product_spec.md`](./product_spec.md) — Full product specification
- [`milestones.md`](./milestones.md) — Build milestones overview
- [`milestones/`](./milestones/) — Detailed milestone implementation guides
- [`required.md`](./required.md) — Pre-development checklist

## License

MIT
