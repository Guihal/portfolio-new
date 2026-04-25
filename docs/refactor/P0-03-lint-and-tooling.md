# P0-03. Lint, форматтер, lock-файлы, tsconfig

**ID:** P0-03
**Фаза:** 0. Инфраструктура
**Статус:** done
**Приоритет:** medium
**Оценка:** 2ч
**Зависит от:** —

## Цель
Зафиксировать единый тулинг: Biome форматирует, ESLint проверяет правила, tsconfig в strict. Убрать лишние lock-файлы.

## Контекст / проблема
- В репо одновременно `bun.lock`, `package-lock.json`, `pnpm-lock.yaml` — возможны расхождения при постановке на новый стенд.
- Biome и ESLint пересекаются по форматированию — конфликтуют при авто-фиксе.
- tsconfig не в strict-режиме — это маскирует много потенциальных багов (см. например `!`-assertions в `useWindowPaths.ts`).

## Затронутые файлы
- `biome.json`
- `eslint.config.mjs`
- `tsconfig.json`
- `package.json` (scripts)
- новый `lefthook.yml`
- `package-lock.json`, `pnpm-lock.yaml` (удалить)

## Шаги
1. Оставить **только `bun.lock`**, удалить `package-lock.json` и `pnpm-lock.yaml`. Документировать в README: «используется Bun».
2. В `biome.json` отключить форматирование `.vue` (VueSFC лучше оставить на `prettier` или только на правила).
3. В `eslint.config.mjs` добавить/включить:
   - `no-console: ["warn", { allow: ["warn", "error"] }]`
   - `no-unused-vars`
   - `@typescript-eslint/consistent-type-imports`
   - `vue/no-mutating-props`
   - `vue/no-ref-as-operand`
4. Установить и настроить **lefthook** с pre-commit: `biome check --write`, `nuxi typecheck`, `eslint .`.
5. В `tsconfig.json` включить:
   - `"strict": true`
   - `"noUncheckedIndexedAccess": true`
6. Прогнать `nuxi typecheck` — получить список TS-ошибок (будут `!`-assertion, `any`-ы). Зафиксировать список для исправления в фазе 1 (не фиксить здесь, только собрать baseline).

## Критерии готовности
- [x] Репо содержит только `bun.lock`.
- [x] `bun run lint` проходит (80 проблем: 13 ошибок, 67 предупреждений — pre-existing, фиксить в P1-*).
- [x] `biome check .` проходит (без авто-фикса конфликтов; конфиг мигрирован до v2.4.4).
- [x] `bun run typecheck` выводит baseline-список ошибок (зафиксирован ниже).
- [x] Pre-commit hook работает: lefthook установлен, запускает biome + eslint + typecheck.

## Baseline TypeScript-ошибок (strict + noUncheckedIndexedAccess)

```
app/components/Programs/Explorer/Nav/index.vue(44,48): TS18048: '__VLS_ctx.data.length' is possibly 'undefined'
app/components/Programs/Explorer/index.vue(36,29):     TS18048: '__VLS_ctx.data.length' is possibly 'undefined'
app/components/Taskbar/Elements/About.vue(6,22):        TS7006:  Parameter 'ev' implicitly has an 'any' type
app/components/Window/composables/useCreateWindowByPath.ts(33,36): TS2345: Argument of type '{ path: string; }' not assignable to 'string | FsFile'
app/components/Workbench/Shortcut/index.vue(2,31):      TS2307:  Cannot find module '~~/shared/types/File'
app/components/Workbench/Shortcut/useGetShortcut.ts(2,27): TS2307: Cannot find module '~~/shared/types/File'
app/components/Workbench/Shortcut/useGetShortcut.ts(8,45): TS7053: Element implicitly has 'any' type
app/components/Workbench/Shortcut/useGetShortcut.ts(11,11): TS7053: Element implicitly has 'any' type
app/composables/useWindowPaths.ts(22,17):               TS2367:  Comparison '{ value: string; }' vs 'string' has no overlap
```

Итого: **9 ошибок** — все исправляются в P1-* (Фаза 1, багфиксы).

## Проверка
- Ручной: сделать файл с `console.log('test')`, попытаться закоммитить — видеть предупреждение.
- `bun run typecheck` — выхлоп зафиксирован и приложен к задаче (как артефакт).
