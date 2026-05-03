# app/services/

Сервисный слой Dimonya OS: stateful или DOM-aware логика, импортируемая
из composables и SFC. Извлечён в Phase 8 чтобы вынести pure compute и
бизнес-логику из view/composable/store слоёв.

См. [docs/RULES.md §2 — Архитектурные слои](../../docs/RULES.md#2-архитектурные-слои).

## SSR-контракт

`app/services/` импортируется как из браузера, так и из SSR (Vue компоненты
рендерятся на сервере). Жёсткие правила (см. [RULES.md §2a](../../docs/RULES.md#2a-ssr-контракт-app-services)):

- **Module-scope mutable state ЗАПРЕЩЁН** — иначе SSR-утечка между запросами
  (P1-09 incident). State живёт в Pinia stores или closures фабрик.
- **DOM-доступ только под guard** `if (import.meta.client)` или внутри
  функций, вызываемых исключительно из `onMounted`.
- **Fetch via `$fetch`** (Nitro umbrella, SSR+CSR). Не использовать
  `window.fetch` напрямую.
- **Pure-by-default** — если функция не нуждается в browser API, она pure
  (тестируется без mount).

## Boundary: services/ vs utils/ vs server/utils/

См. [RULES.md §2b](../../docs/RULES.md#2b-app-services-vs-app-utils-vs-server-utils-boundary):

- `app/services/` — stateful или DOM-aware, импортится из composables/SFC.
- `app/utils/` — pure, no Vue/DOM/storage, тестируется без mount/mocks.
- `server/utils/` — h3 server-only, **никогда** не импортится из `app/`.
- `shared/utils/` — pure cross-runtime (нужен и в app, и в server).

## Импорт-правила

`app/services/` изолирован от Vue/Pinia слоёв (enforced via ESLint
`no-restricted-imports` в `eslint.config.mjs`):

| Допустимо | Запрещено |
|---|---|
| `app/utils/**` | `app/composables/**` |
| `shared/utils/**` | `app/stores/**` |
| `shared/types/**` | `app/components/**` |

Причина: services должен оставаться testable без Vue mount и без Pinia
setup. Reactivity и lifecycle — забота composable-обёртки над services.

## Будущие модули

| Файл | PR | Источник |
|---|---|---|
| `filesystem/FsClient.ts`, `filesystem/parseEntity.ts` | P8-03 | extract `$fetch` из SFC |
| `windowPreviewGenerator.ts` | P8-06 | `stores/frame.ts` MutationObserver |
| `tooltipState.ts` | P8-07 | `TaskbarTooltipItem.vue` positioning math |
| `gridCalculator.ts` | P8-08 | `useGridCells.ts` pure compute |

Все .ts файлы в текущей версии — TODO-stubs (валидные TS-модули,
реализация приходит в указанных PR-ах).
