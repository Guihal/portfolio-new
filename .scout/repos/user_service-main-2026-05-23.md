---
repo: user_service-main
owner: Guihal
source: github
scanned_at: 2026-05-23T13:56:00+03:00
language: Python
stars: 0
last_pushed: 2026-03-22T00:00:00+03:00
commits_count: 6
tech_stack: [Python, Mako, Docker, Docker Compose, nginx, Redis]
portfolio_worthy: true
screenshot_needed: false
priority: 7
---

# user_service-main

A Dockerized Python backend service for user authentication and API management. Built as a quick-start template for backend developers with auth, CORS, HTTPS, and Redis caching.

## What it does
- User authentication API (described in docs/AUTH_FOR_FRONTEND.md)
- Backend quick-start scaffold (docs/QUICK_STATRT_FOR_BACKEND.md)
- Docker Compose deployment with separate deploy configuration
- nginx reverse proxy with SSL/HTTPS support
- Redis integration for caching/session storage
- CORS handling for frontend integration

## Recent commits (6 total, all Mar 22 2026)
1. **add redis check** — KnightCode1024 — Added Redis health/check integration
2. **add https** — KnightCode1024 — Configured HTTPS/SSL support in nginx
3. **update cors** — KnightCode1024 — Updated CORS policies for frontend communication
4. **update deploy** — KnightCode1024 — Deployment configuration updates
5. **update deloy** — KnightCode1024 — Additional deploy tweaks (typo in message)
6. **service** — Guihal — Initial service scaffold (foundation commit)

## Why it belongs in the portfolio
Shows practical backend/DevOps skills: Python API architecture, containerized deployment (Docker + Docker Compose), nginx reverse proxy with SSL, Redis caching layer, and auth system design. Despite low commit count and 0 stars, it demonstrates production-relevant stack choices and documentation discipline (dedicated docs for frontend and backend devs). Good as a "backend quick-start" case study.

## Notes
- No live/demo URL or GitHub topics set
- 2 contributors (Guihal + KnightCode1024)
- Could benefit from a README rewrite in English and a live Swagger/docs URL
