# P8-01: rules + ESLint + lefthook + drift-check

**Status:** todo
**Priority:** high
**Estimate:** 2ч
**Depends on:** —
**Group:** A — Foundation
**Sunset:** —

## Цель

Завести `docs/RULES.md` как single source of truth, ввести ESLint `max-lines` в **warn**-режиме (избегая bootstrap paradox), создать вспомогательные scripts и lefthook hooks. Ничего в `app/` не ломаем — existing oversize файлы получают warnings, не errors.

## Изменения

1. **Файл `docs/RULES.md`** уже создан (см. `docs/RULES.md`) — этот PR делает его enforced.
2. **`eslint.config.mjs`** — добавить блоки:
   ```js
   {
     files: ['app/**/*.ts', 'app/**/*.vue', 'server/**/*.ts', 'shared/**/*.ts'],
     ignores: ['shared/types/**'],
     rules: {
       'max-lines': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
       'max-lines-per-function': ['warn', { max: 60, skipBlankLines: true, skipComments: true, IIFEs: true }],
       'complexity': ['warn', { max: 12 }],
     },
   },
   {
     files: ['app/components/Programs/Explorer/Nav/facts-data.ts', 'app/programs/index.ts'],
     rules: { 'max-lines': ['warn', { max: 300 }] },
   },
   {
     files: ['app/stores/windows.ts'],
     rules: { 'max-lines': ['warn', { max: 200 }] }, // sunset P8-11
   },
   ```
3. **`scripts/check-vue-sfc-size.ts`** — реализовать LOC-проверку всего Vue SFC (template+script+style); итерируется по `git ls-files '*.vue'`; fail на > 150 без override; whitelist в self-config.
4. **`scripts/check-rules-drift.ts`** — сверяет первую строку `docs/RULES.md` (`> **Last updated:** ...`) с git hash файла. Drift → `process.exit(1)`.
5. **`lefthook.yml`** — добавить:
   ```yaml
   pre-commit:
     commands:
       vue-sfc-size:
         glob: "*.vue"
         run: bun run scripts/check-vue-sfc-size.ts {staged_files}
   pre-push:
     commands:
       rules-drift:
         run: bun run scripts/check-rules-drift.ts
   ```
6. **`CLAUDE.md`** — одна строка в `## Соглашения`:
   ```
   - **Code rules** — см. [docs/RULES.md](docs/RULES.md). RULES.md = single source of truth, не дублировать в CLAUDE.md.
   ```
7. **`AGENTS.md`** — добавить раздел `## Архитектурные слои` (введён этим PR; детали слоёв + SSR-контракт services/).
8. **`docs/refactor/baseline-loc.txt`** — снапшот `find app/ server/ shared/ ... | xargs wc -l | sort -rn`.

## Тесты

- `bun run lint` → warns на existing oversize, не fails.
- `bun run scripts/check-vue-sfc-size.ts` → fails на About.vue (271 > 150) — этот PR разрешает только warning, fail-mode (CI) включается в P8-18; в P8-01 скрипт работает в `--report`-only режиме.
- `bun run scripts/check-rules-drift.ts` → проходит на свеже-зафиксированном `RULES.md`.
- Lefthook hooks триггерятся в локальной среде.

## Acceptance criteria

- [ ] `docs/RULES.md` присутствует, имеет header `> **Last updated:** ...`.
- [ ] `eslint.config.mjs` имеет `max-lines: warn` блок.
- [ ] `scripts/check-vue-sfc-size.ts` существует, runnable.
- [ ] `scripts/check-rules-drift.ts` существует, runnable.
- [ ] `lefthook.yml` имеет vue-sfc-size pre-commit + rules-drift pre-push.
- [ ] `CLAUDE.md` имеет одну новую строку (link), без дублирования.
- [ ] `AGENTS.md` имеет раздел «Архитектурные слои» + «SSR-контракт services/».
- [ ] `docs/refactor/baseline-loc.txt` зафиксирован.
- [ ] CI зелёный (warns ok).

## Risks

- **Bootstrap paradox** — устранён warn-режимом.
- **Lefthook overhead** — `check-vue-sfc-size.ts` должен быть ≤ 200ms на staged subset (использует glob, не full repo).
- **Drift false-positive** — header pinned на git-hash; при rebase обновлять вручную (либо смотреть pre-commit hook что header матчит).
