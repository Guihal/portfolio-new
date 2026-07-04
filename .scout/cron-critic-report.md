# CRON CRITIC REPORT — 27 Jobs Audited
**Generated:** 2026-05-22 00:05 MSK  
**Auditor:** CRON CRITIC subagent  
**Scope:** All jobs from `cron list --includeDisabled true`

---

## 🔴 CRITICAL (Fix Immediately)

| # | Job | Issue | Fix |
|---|-----|-------|-----|
| 1 | **portfolio-polish-deploy** | Schedule says `every 1h` but description claims "every 2 days". It will SCP to VPS every hour, burning bandwidth and risking corruption. | Change `everyMs` to `172800000` (48h) or use `kind:cron expr:"0 0 */2 * *"`. Update description or schedule to match. |
| 2 | **sessionTarget=main races** | Four enabled jobs target the **same** `session:main` simultaneously: `subbrain-morning-plan` (1h), `subbrain-evening-review` (1h), `subbrain-operator-heartbeat` (30m), `subbrain-task-tail-review` (1h). They collide with each other and with the user's own session, causing context bloat, lock races, and lost work. | Merge `morning-plan` + `evening-review` + `task-tail-review` into a single `subbrain-daily-sync` cron at `session:main` once every 2–4h. Move `operator-heartbeat` to `session:operator` or make it `session:isolated` with memory-only writes. Never stack 4+ writers on `main`. |
| 3 | **free-agent-playground** | Payload says **"Do whatever you want"** with full R/W to `/usr/projects/free-agent/` and no disk/CPU/cost guards. Can spawn infinite files, runaway processes, or download huge dependencies. | Add a preamble budget guard: max 50 MB disk delta per run, max 3 subagents, no `bun install` without approval. Record a hard limit in the prompt. |
| 4 | **subbrain-sales-scout + subbrain-money-ideas + site-scout-pipeline-prep** | All three run **every 30m with 15m timeout** (`everyMs=1800000`, `timeoutSeconds=900`). If any stalls (network, Playwright, API rate-limit), the next tick starts before the previous finishes, causing overlapping sessions and resource exhaustion. | Increase intervals to at least `3600000` (1h) or reduce timeouts to `300s`. Alternatively, stagger them: sales-scout at :00, money-ideas at :20, site-scout at :40. |
| 5 | **diploma-polish-every-20min** (disabled) | If ever re-enabled: `timeoutSeconds=1800` (30m) vs `everyMs=1200000` (20m). **Guaranteed queue overflow** — each run exceeds its own interval. | Before enabling, either raise interval to `3600000`+ or cap timeout at `900s`. Prefer watchdog-only mode (read-only) if running every 20m. |
| 6 | **diploma-watchdog** (disabled) | `sessionTarget: current` means it hijacks whatever session the user is actively using. If the user is coding, this dumps a watchdog JSON dump into their context, destroying UX. | If re-enabled, switch to `sessionTarget: isolated` and write findings to memory/tasks only. Never use `current` for automated audits. |

---

## 🟡 WARNING (High Risk / Waste)

| # | Job | Issue | Fix |
|---|-----|-------|-----|
| 7 | **memory-rolling-snapshot** | Runs **every 15m** (`everyMs=900000`), rewrites `IDENTITY.md`, and sends Telegram on every run even when nothing changed. High noise-to-signal ratio; wears down SSD and user attention. | Reduce to `everyMs=3600000` (1h) or `21600000` (6h). Gate Telegram: only send if significant facts changed since last run. |
| 8 | **skill-checker-30min** | Name says "30min" but runs every 30m (`everyMs=1800000`). The name/interval mismatch is confusing. Also, `timeoutSeconds=600` (10m) is heavy for a 30m cadence. | Rename to `skill-checker` or set `everyMs=3600000` (1h). Reduce timeout to `300s`. |
| 9 | **subbrain-tg-digest-readonly** | `everyMs=1800000` (30m) + `timeoutSeconds=420` (7m) = 23% duty cycle. Telegram APIs can rate-limit; frequent polling risks account flags. | Reduce to `everyMs=3600000` (1h) or `7200000` (2h). Add jitter (e.g. `staggerMs=120000`). |
| 10 | **subbrain-night-memory-maintenance** | `expr: "15 3 * * *"` with `tz: "UTC"` = 06:15 MSK. The job is heavy (batch chain, embed, curation, diagnostics). If the user wakes at 07:00, it may still be running and competing for context. | Move to `expr: "30 2 * * *"` (05:30 MSK) or add `timeoutSeconds=1200` with a hard deadline to finish before 06:30. |
| 11 | **article-scan-stacks + article-scan-ai-agent** | Both run every 2h (`7200000ms`) with `timeoutSeconds=900`. They scan overlapping sources (Habr, dev.to, Medium) and may duplicate work. Delivery `channel: "last"` with `mode: none` means no one reads the output unless they open the isolated session. | Merge into a single `article-scout` job that scans both stacks in one turn, or stagger by 1h. Change delivery to `mode: memory` (if supported) or explicitly write findings to shared memory instead of isolated session. |
| 12 | **yt-collect** | Runs every 6h but payload says "If no token → log and exit". That is **6 wasted runs per day** until OAuth is configured. | Add a pre-check cron or make this job self-disable after 3 consecutive "no token" exits. Or keep it disabled until `yt-setup-reminder` is completed. |
| 13 | **subbrain-cron-watcher** | Every 30m with heavy diagnosis payload. It tries to `cron list` and fix jobs, but it runs in `session:isolated` with no user context. Risk of fixing the wrong thing or creating duplicate jobs. | Reduce to `everyMs=3600000` (1h). Add a guard: "If >3 jobs are healthy, skip detailed inspection and only check error counts." |
| 14 | **site-scout-pipeline-prep** | `sessionTarget: session:site-scout` but it stores leads via `sales_lead_store`. From memory: `sales_leads` table is **missing** (DB blocker noted in IDENTITY.md). Every run will fail at step 5 until schema is fixed. | Either fix the DB schema first, or change the job to store leads in `shared` memory with tags instead of `sales_lead_store`. Do not run a broken pipeline 48×/day. |
| 15 | **portfolio-github-screenshot-collector** | Stores screenshots under `/tmp/portfolio-screenshots/` — ephemeral. On reboot or tmp-cleaner, all screenshots lost. Also `every 2h` is aggressive for a portfolio that changes monthly. | Change path to `/usr/projects/portfolio-new/.scout/screenshots/` (persistent). Reduce interval to `everyMs=86400000` (24h) or trigger on-demand via memory flag. |

---

## 🔵 INFO (Low Risk / Optimizations)

| # | Job | Issue | Fix |
|---|-----|-------|-----|
| 16 | **self-audit-15min** | Already **disabled** — good. But the file still contains the old config, wasting JSON size and human parsing time. | Delete the job entirely via `cron remove` or keep it as a tombstone comment only. |
| 17 | **yt-setup-reminder** | Already **disabled**. One-time setup reminders should not live forever as cron jobs. | Remove the job. Replace with a one-time task in memory or a manual checklist item. |
| 18 | **Memory Dreaming Promotion** | `tz` is absent → defaults to UTC. For a Moscow user, 03:00 UTC = 06:00 MSK, which is fine, but explicit `tz: "Europe/Moscow"` would avoid confusion. | Add `tz: "Europe/Moscow"` for clarity. |
| 19 | **subbrain-project-monitor-weekly** | `sessionTarget: session:project-monitor` but it has no `staggerMs`. If the server is under load at Mon 09:30, the job may start late and then the next week's anchor drifts. | Add `staggerMs: 60000` (1m) to soften thundering-herd if multiple weekly jobs align. |
| 20 | **ai-automation-site** | `everyMs=259200000` (3d) is reasonable, but the payload says "Do NOT restart Caddy" yet it SCPs to `/opt/ai-automation-site/`. If Caddy config points elsewhere, the deployment is invisible. | Verify Caddy snippet exists before SCP. If missing, write a task to create it rather than silently deploying to a black hole. |
| 21 | **soul-formation** | `everyMs=21600000` (6h) is heavy. It reads 360m of sessions, Telegram, memory, then edits `SOUL.md` and `IDENTITY.md`. Risk of overwriting human edits if they happen during the 6h window. | Add a git-style "last modified by" check: if `SOUL.md` was edited by non-agent in last 6h, append instead of overwrite, or skip. |
| 22 | **subbrain-cron-watcher + memory-rolling-snapshot + free-agent** | Multiple jobs contain `tg_send_message` in payload but `delivery.mode: none`. The messages will **not** be delivered, yet the agent may waste tokens trying. | Either set `delivery.mode: announce` + `channel: main` (if gateway supports it) or remove `tg_send_message` from payloads when `mode: none`. Prefer memory-only delivery for automated jobs. |
| 23 | **Missing: VPS health check** | No cron monitors `portfolio-new` (109.120.187.244:3001) or PM2 health. If the site crashes, no one knows until a user visits. | Add `vps-health-check` (every 30m, isolated): `curl -sf http://109.120.187.244:3001/ || tg_alert`. |
| 24 | **Missing: disk space monitor** | IDENTITY.md notes disk is **88% full**. No cron watches this. | Add `disk-space-watch` (every 6h, isolated): `df -h / | tail -1` → alert if >90%. |
| 25 | **Missing: dependency vulnerability scan** | No automated check for `npm audit` / `bun audit` on `portfolio-new`, `subbrain`, or diploma. | Add `dependency-audit` (weekly, isolated): run audit on key repos, write findings to memory. |

---

## Summary Stats

| Category | Count |
|----------|-------|
| Critical | 6 |
| Warning | 9 |
| Info | 10 |
| **Total Issues** | **25** |
| Jobs Affected | 21 of 27 |

## Top 3 Actions for Dmitry
1. **Fix the `main` session race** — merge the 4 daily-review crons into 1–2 jobs.
2. **Fix portfolio-polish-deploy interval** — it deploys every hour instead of every 2 days.
3. **Fix or pause the 30m `timeout=900` cluster** (sales-scout, money-ideas, site-scout) — overlap risk is real.
