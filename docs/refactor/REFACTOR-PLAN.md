# Phase 8 — Architecture limits & separation

**Status:** proposed
**Owner:** —
**Estimate:** ~30ч (18 PR)
**Depends on:** Phase 0–7 (большинство ✅)

## 1. Цель

1. **<150 строк/файл** для `app/`, `server/`, `shared/` если не обосновано (data/types/registry).
2. **Прописать правило** в `docs/RULES.md` (single source of truth) + enforce через ESLint + custom scripts.
3. **Максимальная унификация** — общие паттерны, выкидывать дубли (`$fetch` дублирование в Explorer/Nav).
4. **Максимальный code splitting** — extract pure compute в `app/services/`, magic numbers в `utils/constants/`.
5. **Максимальное разделение по стеку** — view (SFC) / logic (composable) / state (Pinia) / service (pure/DOM-wrapped) / data (FsClient) / util / types.
6. **Минимум смешивания** — `$fetch` уходит из SFC, `MutationObserver` из stores, `setTimeout(N)` из composables.

## 2. Контекст

Existing `docs/refactor/index.md` содержит 32 задачи Phase 0–7, большинство ✅. Архитектура имеет хорошие паттерны (Programs Registry, Pinia stores split, `useWindow` фасад, Server API zod+errors+cache, SCSS `c()/t()/cw`), но:

- **Нет `app/services/`** — pure compute живёт в composables (`useGridCells`, tooltip positioning).
- **Нет shared entity-cache** — каждое окно перегружает копию `FsFile`.
- **`$fetch` в SFC** — `Programs/Explorer/index.vue`, `Nav/index.vue` дублируют fetch.
- **`MutationObserver` в store** — `stores/frame.ts` смешан DOM API + state.
- **Magic numbers** — `setTimeout(10)`, `setTimeout(150)`, `setTimeout(500)` без констант.
- **View-state в global store** — `windows.errorMessage`, `frame.images` мешают domain и UI.
- **20+ flat composables** в `Window/composables/` — граница composable vs util размыта.
- **Нет `max-lines` enforcement** — Biome 2.4.4 не имеет, ESLint не настроен.

## 3. Не-цели (out of scope Phase 8)

- i18n, локализация, RTL.
- Design system overhaul, новый компонентный API.
- Server framework swap (Nuxt 4 → что-либо).
- Breaking API changes для server endpoints.
- Performance optimisations (отдельная фаза если потребуется).
- Accessibility audit.

## 4. Архитектурный target

```
View    │ Vue SFC          (≤150 LOC sfc total — script+template+style; check via scripts/check-vue-sfc-size.ts)
Logic   │ composables/     (≤150 LOC; ESLint max-lines)
State   │ stores/          (Pinia, ≤150; whitelist windows.ts→200 sunset P8-11)
Service │ app/services/    (≤150; pure OR DOM-wrapped; SSR-safe — guards + no module-scope state)
Data    │ server/api/, app/services/filesystem/   (FsClient: $fetch via Nitro umbrella)
Util    │ app/utils/, server/utils/, shared/utils/   (см. boundary §4.2)
Types   │ shared/types/    (unlimited)
```

### 4.1. SSR-контракт `app/services/`

- Module-scope mutable state ЗАПРЕЩЁН (P1-09 регрессия). State в Pinia OR closures фабрик.
- DOM-доступ только под `if (import.meta.client)` или из `onMounted`.
- `$fetch` (Nitro umbrella), не `window.fetch`.

### 4.2. `app/services/` vs `app/utils/` vs `server/utils/` boundary

- **`app/services/`** — stateful или DOM-aware логика, browser API под guards, импортится из composables/SFC.
- **`app/utils/`** — pure, no Vue/DOM/storage. Тестируется без mount.
- **`server/utils/`** — h3 server-only. Никогда не импортится из `app/`.
- **`shared/utils/`** — pure cross-runtime (нужно и в app, и в server).

## 5. Карта новых директорий

```
app/services/                              [NEW в P8-02]
├── filesystem/
│   ├── FsClient.ts            (≤120; get/list/getBreadcrumbs + retry + abort)
│   ├── parseEntity.ts         (≤80; FsFile validation)
│   └── index.ts               (re-exports, ≤30)
├── tooltipState.ts            (≤80; pure positioning calc)
├── gridCalculator.ts          (≤90; cell count + bounds)
├── windowPreviewGenerator.ts  (≤100; html-to-image wrapper)
└── windowStateRules.ts        (≤60; INCOMPATIBLE matrix extracted, optional P8-11)

app/composables/global/        [NEW в P8-13]
├── useAppBootstrap.ts
├── useViewportObserver.ts
└── useWindowTitle.ts

app/composables/window/        [NEW в P8-13]
├── useGridCells.ts            (wrapper над gridCalculator)
├── useTaskbarTooltips.ts      (wrapper над tooltipState)
└── ...

app/utils/constants/
└── timing.ts                  [NEW в P8-09]
                                FULLSCREEN_AUTO_SET_DELAY_MS = 10
                                TOOLTIP_HIDE_DELAY_MS = 150
                                PREVIEW_DEBOUNCE_MS = 500

scripts/
├── check-vue-sfc-size.ts      [NEW в P8-01; full Vue SFC LOC enforcement]
└── check-rules-drift.ts       [NEW в P8-01; RULES.md hash sync check]
```

## 6. Перечень PR

| ID | Title | Group | Priority | Est | Depends on | Baseline LOC | Target LOC |
|---|---|---|---|---|---|---|---|
| P8-01 | rules-and-lint | A | high | 2ч | — | — | RULES.md ~200, eslint+lefthook |
| P8-02 | services-layer-skeleton | A | high | 1ч | P8-01 | — | empty dirs + index.ts re-exports |
| P8-03 | filesystem-client | B | high | 2ч | P8-02 | — | FsClient ≤120 LOC |
| P8-04 | entities-cache | B | medium | 2ч | P8-03 | — | entities store ≤120 LOC |
| P8-05 | fetch-in-sfc-extraction | C | high | 1.5ч | P8-03 | Explorer/index 90+, Nav 80+ | both ≤80 |
| P8-06 | frame-store-split | C | high | 1.5ч | P8-02 | frame.ts 108 | store ≤80 + composable + service |
| P8-07 | tooltip-purify | C | medium | 1.5ч | P8-02 | useTaskbarTooltips 111 | wrapper ≤60 + service ≤80 |
| P8-08 | grid-calc-purify | C | medium | 1ч | P8-02 | useGridCells (~90) | wrapper ≤40 + service ≤90 |
| P8-09 | magic-numbers-constants | C | low | 1ч | P8-02 | scattered | timing.ts ≤30 + migrations |
| P8-10 | content-vue-extract | C | medium | 1.5ч | P8-02 | Content.vue (~80) | SFC ≤50 + composable ≤60 |
| P8-11 | ui-state-split | C | medium | 2ч | P8-02 | windows.ts 182, frame.ts 108 | windows ≤150, ui composable |
| P8-12 | window-composables-grouping | D | low | 2ч | C | flat 20 files | subfolders, no LOC change |
| P8-13 | app-composables-boundary | D | low | 2ч | C | flat 10 files | global/ + window/ split |
| P8-14 | server-utils-split | D | medium | 1ч | P8-02 | manifest.ts ≤150 | 3 files ≤60 each |
| P8-15 | about-vue-split | E | medium | 2ч | P8-01 | About.vue 271 | SFC ≤150 + sub-comp ≤80 |
| P8-16 | shortcut-base-split | E | low | 1.5ч | P8-01 | Base.vue 141 | SFC ≤80 + .module.scss |
| P8-17 | tooltip-position-composable | E | low | 1.5ч | P8-01 | Tooltip.vue 124 | SFC ≤90 + composable ≤50 |
| P8-18 | cleanup-and-metrics | F | high | 2ч | A–E | — | warn→error switch + final whitelist trim |

## 7. Граф зависимостей

```
A: P8-01 → P8-02
B: P8-02 → P8-03 → P8-04
C: (P8-03 → P8-05); (P8-02 → P8-06, P8-07, P8-08, P8-09, P8-10, P8-11)   [parallel]
D: C → P8-12, P8-13; P8-02 → P8-14   [parallel]
E: P8-01 → P8-15, P8-16, P8-17   [parallel with C]
F: A∪B∪C∪D∪E → P8-18

Critical path: P8-01 → P8-02 → P8-03 → P8-04 → C-set → D-set → P8-18
Wall-clock minimum: 4–5 рабочих дней с параллелизмом.
```

## 8. Конкретные миграции

| Pattern | Было (path:line) | Стало | PR |
|---|---|---|---|
| Fetch в SFC | `Programs/Explorer/index.vue:23-47` | `composables/useProgramFetch.ts` (вызывает FsClient) | P8-05 |
| Fetch в SFC (дубль) | `Programs/Explorer/Nav/index.vue:28-51` | то же `useProgramFetch.ts` | P8-05 |
| DOM API в composable | `useTaskbarTooltips.ts:60-73` | `services/tooltipState.ts` (pure) + `useTooltipState` wrapper | P8-07 |
| MutationObserver в store | `stores/frame.ts:52-94` | `composables/useWindowPreview.ts` + `services/windowPreviewGenerator.ts` | P8-06 |
| `setTimeout(10)` | `useWindowFullscreenAutoSet.ts:72` | `FULLSCREEN_AUTO_SET_DELAY_MS` const | P8-09 |
| `setTimeout(150)` | `useTaskbarTooltips.ts:96` | `TOOLTIP_HIDE_DELAY_MS` const | P8-09 |
| `setTimeout(500)` / debounce | `frame.ts:89` | `PREVIEW_DEBOUNCE_MS` const | P8-09 |
| Бизнес-логика в SFC | `Window/Content.vue:21-58` | `composables/useProgramSetup.ts` | P8-10 |
| View-state в global store | `windows.errorMessage` | `useWindowUIState` per-window | P8-11 |
| View-state в global store | `frame.images` | `useWindowUIState` или отдельный store `windowsUIState.ts` | P8-11 |
| Pure compute в composable | `useGridCells.ts:63-77` | `services/gridCalculator.ts` (pure) + `useGridCells` wrapper | P8-08 |
| About.vue 271 LOC | `Programs/About/index.vue` | SFC ≤150 + content data + sub-components | P8-15 |
| Shortcut/Base 141 + heavy style | `Shortcut/Base.vue` | SFC ≤80 + `Base.module.scss` external | P8-16 |
| Tooltip 124 + positioning | `Taskbar/Elements/Program/Tooltip.vue` | SFC ≤90 + `useTooltipPosition` ≤50 | P8-17 |
| Manifest util god-file | `server/utils/manifest.ts` | `loadManifest.ts` + `findNode.ts` + `resolveEntity.ts` + index re-export | P8-14 |

## 9. Risk register

| # | Риск | Mitigation | Verify |
|---|---|---|---|
| 1 | Programs Registry паритет (REGISTRY ↔ ProgramType) | Не трогаем `app/programs/`, `shared/types/filesystem.ts` | `bun run typecheck` |
| 2 | Manifest pipeline ломается при split | P8-14 keep public API через index re-export | `bun run generate:manifests` + diff JSON |
| 3 | States incompatibility matrix ломается | Не трогаем `windows.ts.INCOMPATIBLE` (P8-11 не меняет matrix) | `tests/unit/stores/windows.test.ts` |
| 4 | Window bounds animation ломается | Не трогаем `useWindowBoundsAnimation/`, `bounds.ts`, CSS-vars | E2E drag/resize/collapse |
| 5 | Queued Router race возвращается | Не трогаем `queuedRouter.ts` | E2E rapid navigation |
| 6 | SSR module-scope leak (P1-09 регрессия) | P8-13 boundary review + ESLint custom rule (TODO) | P1-09 regression test |
| 7 | Visual regression (About/Tooltip/Shortcut split) | Playwright screenshot per E-PR | `bun run test:e2e` |
| 8 | ESLint whitelist становится permanent | Sunset-PR обязателен; P8-18 trims | Manual review при P8-18 |
| 9 | Circular deps services↔composables | `no-restricted-imports` ESLint в P8-02 | `bun run lint` |
| 10 | `app/services/` vs `server/` confusion | `docs/RULES.md` §2b boundary | docs review |
| 11 | Bootstrap paradox (max-lines:error до splits) | Старт **warn-only**; P8-18 переключает на error | CI green в P8-01..P8-17 |
| 12 | CLAUDE.md ↔ RULES.md drift | `scripts/check-rules-drift.ts` lefthook pre-push | Hook fails на дрифт |

## 10. Rollout

- **Без feature-flag** — рефакторинг user-invisible.
- **Per-PR test gate (обязателен на каждом)**:
  ```bash
  bun run typecheck
  bun run lint
  bun run biome:check
  bun run test:unit
  bun run test:e2e
  bun run scripts/check-vue-sfc-size.ts   # после P8-01
  ```
- **Master deployable** на каждом merge — нет breaking states.
- **Откат** = revert PR (independent commits, не серия зависимых на одной ветке).

## 11. Метрики успеха

1. `find app/ server/ shared/ -name '*.vue' -o -name '*.ts' | xargs wc -l | awk '$1>150 && $2!="total"{c++} END {print c+0}'` ≤ **8** (justified-only).
2. `app/services/` существует, ≥ **4** файла, ≥ 80% покрыто unit-тестами.
3. `grep -rE '\$fetch\(' app/components/` → **0** матчей.
4. `grep -rE 'setTimeout\([0-9]' app/ --include='*.ts' --include='*.vue'` → **0** outside `app/utils/constants/`.
5. ESLint `max-lines: error` active в `eslint.config.mjs`, CI green.
6. `typecheck && lint && biome:check && test:unit && test:e2e` зелёные на каждом PR.
7. `docs/RULES.md` существует, `CLAUDE.md` ссылается одной строкой.
8. `docs/refactor/index.md` имеет таблицу Phase 8 (18 строк), все ✅.
9. `scripts/check-vue-sfc-size.ts` integrated в `lefthook.yml` (pre-commit) + CI.

## 12. Estimation

| Group | PRs | Hours |
|---|---|---|
| A — Foundation | P8-01, P8-02 | 3 |
| B — Data layer | P8-03, P8-04 | 4 |
| C — UI extraction | P8-05..P8-11 (7) | 10 |
| D — Structure cleanup | P8-12..P8-14 (3) | 5 |
| E — File-size hard-fixes | P8-15..P8-17 (3) | 6 |
| F — Finalize | P8-18 | 2 |
| **Total** | **18 PR** | **~30ч** |

Параллелизм: A → B → (C ∥ E) → D → F. Wall-clock: 4–6 рабочих дней.

## 13. Baseline measurement

После P8-01 в `docs/refactor/baseline-loc.txt` сохраняется снапшот:

```bash
find app/ server/ shared/ -name '*.vue' -o -name '*.ts' \
  | xargs wc -l | sort -rn > docs/refactor/baseline-loc.txt
```

Diff после Phase 8 = метрика успеха #1.

## 14. Открытые вопросы для юзера (закрыть до executing-plans)

1. **Лимит 150 LOC** — финал или рассмотреть 200 / 120?
2. **`useWindowUIState` per-window** vs **`stores/windowsUIState.ts` global** — какой вариант для `errorMessage` + `images`?
3. **`app/services/`** vs **`app/lib/`** — одна директория или две (services = stateful, lib = pure)?
4. **About.vue split** — extract в data-файл + sub-components, ИЛИ только sub-components?
5. **`max-lines-per-function`** — финальный level: `warn` или `error`? (proposed: warn — некоторые callbacks > 60 LOC легитимно)
6. **Запрет `composables/` ↔ `stores/` cross-import** через `no-restricted-imports` — да/нет?
7. **`complexity: 12`** включать или только `max-lines`?
8. **Lefthook drift-check overhead** (~50ms) — приемлем?
9. **`max-lines` для `.vue`** — 150 на script-only (ESLint) + 150 на full SFC (custom script), ИЛИ только full SFC?

## 15. Связанные документы

- [docs/RULES.md](../RULES.md) — правила, введённые этой фазой.
- [docs/refactor/index.md](index.md) — оглавление всех фаз (раздел Phase 8 добавляется в P8-01).
- [AGENTS.md](../../AGENTS.md) — архитектура, разделы «Архитектурные слои» + «SSR-контракт services/».
- [CLAUDE.md](../../CLAUDE.md) — короткая ссылка.
