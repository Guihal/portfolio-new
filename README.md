# Dimonya OS — Portfolio

![architecture](https://img.shields.io/badge/file_limit-150_LOC-2f8a2f) ![sfc](https://img.shields.io/badge/Vue_SFC-strict-2f8a2f) ![phase8](https://img.shields.io/badge/Phase_8-complete-2f8a2f)

> **Менеджер пакетов: только [Bun](https://bun.sh).** Не использовать npm/pnpm/yarn — только `bun`.

> **Architecture limits** — max 150 LOC per file (ESLint `max-lines: error` + Vue SFC strict check), enforced via lefthook pre-commit. Whitelist + rules: [docs/RULES.md](docs/RULES.md).

## Setup

```bash
bun install
```

## Development

```bash
bun run dev
```

## Production

```bash
bun run build
bun run preview
```

## Проверки

```bash
bun run typecheck   # TypeScript (strict + noUncheckedIndexedAccess)
bun run lint        # ESLint
bun run biome:check # Biome linter
```

Pre-commit хуки настроены через lefthook (biome + eslint + typecheck).

## Документация

- [AGENTS.md](AGENTS.md) — архитектура, lifecycle окон, чек-листы расширения.
- [План рефакторинга](docs/refactor/index.md) — разбивка работ по фазам/задачам.
- [Backlog будущих фич](docs/backlog.md) — идеи вне текущего рефакторинга.

---

[Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) · [Deployment](https://nuxt.com/docs/getting-started/deployment)
