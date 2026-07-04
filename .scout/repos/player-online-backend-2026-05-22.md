---
repo: player-online-backend
owner: Guihal
source: local
scanned_at: 2026-05-22T20:43:00+03:00
language: TypeScript
stars: 0
last_pushed: 2026-03-23T20:31:41+03:00
commits_count: 8
tech_stack: [ElysiaJS, Bun, TypeScript, PostgreSQL, Drizzle ORM, MinIO, S3, FFmpeg, JWT, Docker, Nodemailer]
portfolio_worthy: true
screenshot_needed: false
priority: 7
---

# player-online-backend / Music Streaming API

**Status:** NOT FOUND on GitHub (local-only) — remote `player-backend` returns 404  
**Category:** Product — music streaming backend  
**Local path:** `/usr/projects/Плеер-онлайн/backend`

## What it is

Backend API for a self-hosted music streaming service. Designed with a 3-tier architecture: Frontend (Nuxt) → Backend (ElysiaJS) → Storage (MinIO/S3). The backend acts as a proxy/ gateway between users and isolated file storage, enforcing auth, quotas, and access auditing.

## Architecture & Stack

- **ElysiaJS** (Bun runtime) — fast, lightweight web framework with built-in TypeScript
- **PostgreSQL + Drizzle ORM** — type-safe database layer with migrations
- **MinIO / S3** — isolated audio file storage (access restricted to backend IP)
- **FFmpeg + fluent-ffmpeg** — server-side audio conversion (to OGG for streaming)
- **JWT (jose)** — stateless auth with cookie-based sessions
- **Nodemailer** — email verification / password reset
- **Docker** — containerized deployment with `docker-compose.yml`
- **Rate limiting** — per-endpoint middleware
- **Audit logging** — all file accesses tracked

## Key modules (from `src/`)

| Module | Purpose |
|--------|---------|
| `auth` | JWT auth, email verification, session management |
| `upload` | File upload pipeline → S3 with type validation |
| `stream` | Range-request audio streaming, format conversion |
| `tracks` | Track metadata CRUD |
| `users` | User management + storage quotas |
| `db/schema` | Drizzle schemas: users, sessions, tracks, auditLogs, verificationCodes |
| `utils/minio` | S3 client wrapper |
| `middleware/rate-limit` | Request throttling |

~1,916 lines of TypeScript source code.

## Recent commits (8 total)

```
6de3232 — все (2026-03-23)
73bd00a — План рефакторинга
9358f93 — Еще чуть допилить и в прод
04b5325 — docker
e7c832f — Конвертация работает
0060f47 — Рабочая загрузка, но без форматирования в ogg
3e80f7d — enc
a9beebf — 4.1
```

Development pattern shows rapid iteration toward MVP: Docker setup → upload working → FFmpeg conversion → final polish. Last significant work March 2026.

## Portfolio assessment

**Verdict:** Portfolio-worthy as a backend architecture showcase.  
- Demonstrates full-stack product thinking (3-tier architecture, security-first storage isolation)
- Modern stack: ElysiaJS is cutting-edge (Bun-native, faster than Express/Fastify)
- Production-oriented features: Docker, rate limiting, audit logs, quota system, email flows
- Audio streaming with Range requests is a non-trivial backend challenge

**Why it's not on GitHub yet:** Likely a private project — the `origin` remote points to `Guihal/player-backend` which does not exist (404). Possibly still in development before public release.

**Missing for full portfolio impact:**
- No live/demo URL (backend requires full 3-tier infra)
- No README in English
- No test suite
- Frontend (`player-online-frontend`) and Storage (`player-online-storage`) are also local-only

## Recommendation

1. **Push to GitHub** as `player-backend` or `music-stream-backend` with a rewritten English README
2. **Deploy a demo** on a single VPS using Docker Compose (all 3 services) — even a minimal demo would be impressive
3. **Link the trio** in portfolio: Backend + Frontend + Storage as one end-to-end product case study
4. **Highlight:** "Self-hosted music streaming with IP-restricted S3 storage and server-side audio conversion"
