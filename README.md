# YoTop10

> Fact Mine. Debate Ground. Your list vs the world.

A debate-first platform for ranked lists, facts, and arguments. Think Medium meets Reddit — but built entirely around top lists, counter lists, and fact-backed debates.

## What is YoTop10?

YoTop10 is a social platform where users create and share ranked lists on any topic. Other users can react, comment, challenge individual items, or create counter-lists (rivals). The community verdict system tracks whether lists are considered accurate or controversial.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router, TypeScript) |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| Cache | Redis |
| Image Storage | MinIO |

## Features

- Create ranked lists with justifications and sources
- React with fire 🔥 to show agreement
- Challenge individual list items
- Create rival counter-lists
- Community verdict tracking
- Follow users and join communities
- Multiple themes (Retro / Futuristic)

## Quick Start

```bash
# Clone and setup
git clone https://github.com/nekwasar/yotop10.git
cd yotop10

# Start databases
cd docker && docker compose up -d

# Run frontend
cd ../frontend && pnpm install && pnpm dev

# Run backend  
cd ../backend && pip install -r requirements.txt && uvicorn main:app --reload
```

## Documentation

- [Product Specification](./docs/product_spec.md)
- [Build Milestones](./docs/milestones.md)
- [User Onboarding](./docs/milestones/m3.6.md)

## License

Copyright © 2026 YoTop10 Project. All rights reserved.

See [LICENSE](./LICENSE) for full license details.
