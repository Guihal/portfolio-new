---
repo: portfolio-new
owner: Guihal
source: github
scanned_at: 2026-05-23T11:25:00+03:00
language: TypeScript
stars: 0
last_pushed: 2026-05-03T00:00:00+03:00
commits_count: 38
tech_stack: [TypeScript, Vue, SCSS, Nuxt, Bun, Playwright, Vitest, ESLint, Biome]
portfolio_worthy: true
screenshot_needed: true
priority: 10
---

# portfolio-new

**Dimonya OS — Portfolio**

Personal portfolio website built as an interactive "OS-like" experience. The project demonstrates modern frontend architecture with strict code quality enforcement.

## Summary

This is the portfolio site itself — a Nuxt 3/4-based SPA styled as an operating system interface. It features window management, draggable panels, code snippet viewers with tabbed interface, project sliders with meta panels, and a taskbar. The architecture enforces a hard 150 LOC per file limit via ESLint and lefthook pre-commit hooks.

## Recent Commits (last 10)

1. **feat(code): code snippet viewer with tabs + clipboard** — May 3, 2026 — Implemented tabbed code viewer with clipboard copy functionality
2. **feat(project): slider + meta panel rewrite** — May 3, 2026 — Redesigned project showcase slider and metadata panel
3. **Task 04: migration-existing (#2)** — May 3, 2026 — Migrated existing content/tasks to new structure
4. **Task 03: manifest-extend (#1)** — May 3, 2026 — Extended manifest configuration for PWA capabilities
5. **refactor** — Apr 2, 2026 — General codebase refactoring
6. **f** — Mar 30, 2026 — Incremental update
7. **d** — Mar 30, 2026 — Incremental update
8. **Много изменений** — Mar 30, 2026 — Bulk changes (many changes)
9. **ref: Добавлена инъекция зависимостей, в процессе переработки роутинга** — Mar 24, 2026 — Added dependency injection, routing rework in progress
10. **fixed** — Mar 18, 2026 — Bug fixes

## Why It Belongs in the Portfolio

- **Showcases architecture discipline**: 150 LOC/file limit, strict TypeScript with `noUncheckedIndexedAccess`, lefthook pre-commit hooks with biome + eslint + typecheck
- **Interactive UX**: OS-like interface with window management, draggable elements, taskbar
- **Modern stack**: Nuxt 4, Vue 3, TypeScript, Bun runtime, Playwright e2e tests, Vitest unit tests
- **AI collaboration**: Co-authored with Claude (visible in commit history), demonstrating AI-assisted development workflows
- **Live demo**: Deployed on Vercel at portfolio-new-one-gules.vercel.app
- **Self-referential meta-project**: The portfolio site itself demonstrates the quality it advertises
