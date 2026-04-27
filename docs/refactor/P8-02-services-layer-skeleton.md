# P8-02: services-layer skeleton

**Status:** todo
**Priority:** high
**Estimate:** 1ч
**Depends on:** P8-01
**Group:** A — Foundation
**Sunset:** —

## Цель

Создать `app/services/` директорию с пустыми index re-export файлами + правилом `no-restricted-imports` (services не импортит composables/stores напрямую). Ничего в callers не меняется.

## Изменения

1. **Создать пустые stub-файлы** (с TODO-комментариями, реализация в P8-03..P8-11):
   ```
   app/services/
   ├── index.ts                          # re-export top-level
   ├── filesystem/
   │   ├── index.ts                      # FsClient re-export (TODO P8-03)
   │   ├── FsClient.ts                   # TODO P8-03
   │   └── parseEntity.ts                # TODO P8-03
   ├── tooltipState.ts                   # TODO P8-07
   ├── gridCalculator.ts                 # TODO P8-08
   ├── windowPreviewGenerator.ts         # TODO P8-06
   └── README.md                         # описание слоя + SSR-контракт ссылка на RULES.md §2a
   ```
2. **`eslint.config.mjs`** — добавить `no-restricted-imports`:
   ```js
   {
     files: ['app/services/**'],
     rules: {
       'no-restricted-imports': ['error', {
         patterns: [
           { group: ['**/composables/**'], message: 'services/ не импортит composables/' },
           { group: ['**/stores/**'], message: 'services/ не импортит stores/' },
           { group: ['**/components/**'], message: 'services/ не импортит components/' },
         ],
       }],
     },
   },
   ```
3. **`AGENTS.md`** — расширить раздел «Архитектурные слои» примером импортов (services может звать utils, не наоборот).

## Тесты

- `bun run typecheck` zero (пустые файлы валидны).
- `bun run lint` zero (no-restricted-imports срабатывает только на real imports — пока их нет).
- `tree app/services/` показывает структуру.

## Acceptance criteria

- [ ] `app/services/` создана со всеми stub-файлами.
- [ ] Каждый stub имеет `// TODO: P8-NN` комментарий.
- [ ] `app/services/README.md` объясняет слой + ссылка на RULES.md §2a.
- [ ] ESLint `no-restricted-imports` блок добавлен.
- [ ] CI зелёный.

## Risks

- **Confusion с `server/`** — README + RULES.md §2b явно различают.
- **Cyclic re-exports** — index.ts re-exports только из своих sub-файлов, не наоборот.
