# Dimonya OS — Portfolio

> **Менеджер пакетов: только [Bun](https://bun.sh).** Не использовать npm/pnpm/yarn — только `bun`.

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

- [План рефакторинга](docs/refactor/index.md) — разбивка работ по фазам/задачам.
- [Backlog будущих фич](docs/backlog.md) — идеи вне текущего рефакторинга.

---

[Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) · [Deployment](https://nuxt.com/docs/getting-started/deployment)
