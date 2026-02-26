# YoTop10 — Dev Log

---

## 📅 2026-02-26

**Milestone:** M1 — Project Foundation

**Done today:**
- Set up server (UFW, SSH, Docker, Docker Compose)
- Traefik running on ports 80 + 443 with auto SSL
- Scaffolded Next.js (frontend) + FastAPI (backend)
- Docker Compose wired up — all 5 containers running (frontend, backend, postgres, redis, minio)
- Set up MinIO + created `yotop10-media` bucket with public download
- Pushed code to GitHub (github.com/nekwasar/yotop10)
- GitHub Actions self-hosted runner installed + running as service
- CI/CD deploy pipeline working — push to main auto-deploys to server
- `https://yotop10.com/api/health` returning `{"status":"ok","app":"YoTop10"}` ✅
- Organized docs into `docs/` folder

**Problems hit:**
- `create-next-app` initialized its own `.git` inside `frontend/` — caused it to be tracked as a git submodule. Fixed by removing embedded `.git` and re-adding as regular files.
- MinIO `localhost:9000` unreachable from host — port not exposed by design. Fixed by getting container's internal Docker IP.
- GitHub SSH key belonged to a different account (`jioka0/asabak`). Generated a new key for `nekwasar`.
- Server cloned repo via HTTPS — caused CI/CD `git pull` to fail. Fixed by adding a deploy key and switching remote to SSH.
- `psycopg2-binary 2.9.9` had no Python 3.13 wheel — bumped to 2.9.10.

**Tomorrow / Next:**
- Verify CI/CD deploy job is fully green
- Check `https://yotop10.com` loads in browser
- M2 — run Alembic migration to create all 21 database tables

**Mood:** 💪 Solid day. Full stack is live.

---

## 📅 YYYY-MM-DD

**Milestone:**

**Done today:**
-

**Problems hit:**
-

**Tomorrow / Next:**
-

**Mood:**

---
