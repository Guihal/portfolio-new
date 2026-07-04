---
repo: player-online-frontend
owner: Guihal
source: github
scanned_at: 2026-05-22T21:48:00+03:00
language: null
stars: 0
last_pushed: null
commits_count: 0
tech_stack: []
portfolio_worthy: false
screenshot_needed: false
priority: 7
---

# player-online-frontend — NOT FOUND on GitHub

**Status:** 404 — Repository does not exist on GitHub at `https://github.com/Guihal/player-online-frontend`  
**Category:** Product — music streaming frontend  
**Expected local path:** `/usr/projects/Плеер-онлайн/frontend` (also missing locally)  
**Related backend:** [player-online-backend](player-online-backend-2026-05-22.md) (local-only, portfolio-worthy)

## What it should be

Frontend counterpart to the **player-online-backend** music streaming API. The 3-tier architecture implies a Nuxt/Vue-based web client that consumes the ElysiaJS backend for audio streaming, user auth, and track management.

## Why it's missing

- **Not published to GitHub** — possibly still in development or abandoned
- **Not found locally** — the `/usr/projects/Плеер-онлайн/frontend` directory does not exist on this machine
- Backend repo exists locally with 8 commits (last push 2026-03-23), suggesting frontend may have been planned but never implemented, or was deleted

## Portfolio assessment

**Verdict:** Not portfolio-worthy in current state — no code, no demo, no repository.  
However, the **backend alone** is a strong portfolio piece. If a frontend is ever built, the combined product would be significantly more impressive.

## Recommendation

1. **Build or recover the frontend** — a Nuxt 3 + Pinia client with audio player UI, playlist management, and auth flows
2. **Publish the full stack** to GitHub under a unified name (e.g., `music-streamer`)
3. **Deploy a demo** on a single VPS with Docker Compose (frontend + backend + MinIO)
4. **Add to portfolio** as an end-to-end product case study
