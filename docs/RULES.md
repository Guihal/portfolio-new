# Project Rules — Dimonya OS

> **Last updated:** f26b84b
> **Status:** active (introduced by P8-01, enforced level=error in P8-18).
> **Scope:** `app/`, `server/`, `shared/`. Тесты, скрипты, генерируемые манифесты — исключены.

Документ — единственный источник истины project-rules. `CLAUDE.md` ссылается строкой, не дублирует. Drift между файлами ловится `lefthook` pre-push hook.

## 1. Принципы

1. **Separation of concerns** — view, logic, state, service, data, util, types — отдельные слои. Один файл = один слой.
2. **Code splitting > inheritance** — extract вместо `extends`, composition вместо deep nesting.
3. **Single responsibility** — один файл решает одну задачу. Если описание содержит «и» — split.
4. **Pure where possible** — функции без Vue/DOM зависимостей живут в `services/` или `utils/`. Composables = тонкая Vue-обёртка.
5. **Fail-fast at boundaries** — валидация на входе (zod, type guards) на границе server↔client; внутри слоя — TS-types контракт.

## 2. Архитектурные слои

| Слой | Где | LOC limit | Запрет |
|---|---|---|---|
| **View** | `app/components/**/*.vue` | 150 (sum SFC) | `$fetch`, `MutationObserver`, `setTimeout(>100ms)` |
| **Logic** | `app/composables/**`, `app/components/**/composables/**` | 150 | DOM mutation, magic numbers |
| **State** | `app/stores/**` | 150 (whitelisted exceptions) | `MutationObserver`, dynamic imports, `setTimeout`, transient UI-state |
| **Service** | `app/services/**` (создаётся в P8-02) | 150 | module-scope mutable state (SSR leak) |
| **Data** | `server/api/**`, `app/services/filesystem/**` | 150 | бизнес-логика (только fetch+validation+cache) |
| **Util** | `app/utils/**`, `server/utils/**`, `shared/utils/**` | 150 | Vue/DOM/storage deps в `app/utils/`, `shared/utils/` |
| **Types** | `shared/types/**` | unlimited | runtime code |

### 2a. SSR-контракт `app/services/`

`app/services/` импортируется как из браузера (composable, SFC), так и из SSR-кода (Vue компонент рендерится на сервере). Правила:

- **Module-scope mutable state ЗАПРЕЩЁН** (см. P1-09 incident — SSR-утечки между запросами). State живёт в Pinia stores OR closures фабрик.
- **DOM-доступ только под guard** `if (import.meta.client)` или внутри функции, вызываемой только из `onMounted`.
- **Fetch via `$fetch`** (Nitro umbrella, работает SSR+CSR). Не использовать `window.fetch` напрямую.
- **Pure-by-default** — если функция не нуждается в browser API, она pure (тестируется без mount).

### 2b. `app/services/` vs `app/utils/` vs `server/utils/` boundary

- `app/services/` — stateful или DOM-aware логика. Может зависеть от browser API через guards. Импортится из composables/SFC. Тестируется частично с mocks браузерных API.
- `app/utils/` — pure функции, no Vue/DOM/storage deps. Тестируются без mount, без mocks.
- `server/utils/` — h3 server-only (zod parse, errors helpers, manifest loader). **Никогда** не импортится из `app/`.
- **Cross-runtime helper** (нужен и в app, и в server) → `shared/utils/`.

## 3. Max-lines policy

### 3.1. Hard limit: 150 LOC per file

Применяется к `app/**/*.{ts,vue}`, `server/**/*.ts`, `shared/**/*.ts` (кроме `shared/types/**`).

- **Counting**: ESLint `max-lines` с `skipBlankLines: true, skipComments: true`.
- **Vue SFC** парсится `vue-eslint-parser`-ом — ESLint видит только `<script>`. Полный SFC (script + template + style) проверяется отдельно — `scripts/check-vue-sfc-size.ts` (lefthook pre-commit + CI). Лимит: 150 LOC на весь файл.
- **Script-only LOC** для Vue ≤ 80 (template+style съедают остальное). Если script > 80 — extract в composable.

### 3.2. Whitelist (justified exceptions)

Каждая запись имеет: `path`, `current LOC` (на момент добавления), `allowed LOC`, `reason`, `sunset-PR` (или `permanent`).

| Path | Current LOC | Allowed | Reason | Sunset-PR |
|---|---|---|---|---|
| `app/components/Programs/Explorer/Nav/facts-data.ts` | 157 | 300 | Контентные данные (57 фактов) | permanent |
| `app/programs/index.ts` | ~80 | 300 | REGISTRY map (room для роста до ~10 программ) | permanent |
| `app/assets/scss/_settings.scss` | 246 | unlimited | SCSS, не парсится ESLint | permanent |
| `app/assets/scss/reset.scss` | 121 | unlimited | SCSS reset стандарт | permanent |
| `tests/**` | varies | 400 | Тесты часто длинные | permanent (already in eslint root ignores) |
| `scripts/**` | varies | 250 | Build-time | permanent (already in eslint root ignores) |
| `shared/types/**` | varies | unlimited | Type defs | permanent |

**Sunset-PR обязателен** для temporary exceptions. После merge sunset-PR запись удаляется из whitelist.

## 4. Code-splitting policy

### 4.1. Composables

- **≥ 30 LOC** ИЛИ **используется в 2+ местах** → отдельный файл `useXxx.ts`.
- **≤ 5 LOC** + single call-site → inline в caller (no abstraction churn).
- Composable > 100 LOC OR > 3 distinct concerns → split per concern.
- 2+ composables ≤ 20 LOC с shared state → merge.

### 4.2. Pure compute

- ≥ 10 LOC pure (no Vue/DOM) → `app/services/<feature>/<name>.ts` ИЛИ `app/utils/<name>.ts` (см. boundary 2b).
- DOM-обёртка над pure: `useXxx.ts` (Vue ref + reactivity) импортит из `services/xxx.ts`.

### 4.3. Magic numbers

- ≥ 2 use sites OR semantic name → `app/utils/constants/<group>.ts`.
- Inline magic запрещён в `app/composables/`, `app/stores/`, `app/components/**/*.vue`.

### 4.4. Vue SFC

- Template > 100 LOC → split в sub-component (`<MySection>`).
- Style > 80 LOC → external SCSS module (`Component.module.scss`) или SCSS file.
- Script > 80 LOC → extract в composable.

## 5. Anti-patterns

| Pattern | Где было | Куда | Sunset-PR |
|---|---|---|---|
| `$fetch` в SFC | `Programs/Explorer/index.vue:23-47`, `Explorer/Nav/index.vue:28-51` | `composables/useProgramFetch.ts` | P8-05 |
| DOM API в composable | `useTaskbarTooltips.ts:60-73` | `services/tooltipState.ts` (pure) + wrapper | P8-07 |
| `MutationObserver` в store | `stores/frame.ts:52-94` | `composables/useWindowPreview.ts` + `services/windowPreviewGenerator.ts` | P8-06 |
| Magic `setTimeout` | `useWindowFullscreenAutoSet.ts:72`, `useTaskbarTooltips.ts:96`, `frame.ts:89` | `app/utils/constants/timing.ts` | P8-09 |
| Бизнес-логика в SFC | `Window/Content.vue:21-58` | `composables/useProgramSetup.ts` | P8-10 |
| View-state в global store | `windows.ts: errorMessage`, `frame.ts: images` | `useWindowUIState.ts` (per-window) | P8-11 |
| Pure compute в composable | `useGridCells.ts:63-77` | `services/gridCalculator.ts` | P8-08 |
| `useXxx` без Vue reactivity | (= pure function) | move to `services/` или `utils/` | various |

## 6. Enforcement

- **ESLint `max-lines`** — `warn` уровень с P8-01, переключается на `error` в P8-18 после splits. CI на error → fail.
- **`scripts/check-vue-sfc-size.ts`** — full SFC LOC. Lefthook pre-commit + CI.
- **`scripts/check-rules-drift.ts`** — sync check между header `RULES.md` и git hash. Lefthook pre-push.
- **Pre-commit (lefthook)**: biome + eslint + typecheck + vue-sfc-size (P8-01 расширяет).
- **PR review checklist** (manual):
  - [ ] no `$fetch` в SFC
  - [ ] no inline `setTimeout(<n>)` outside `utils/constants/`
  - [ ] composable > 30 LOC лежит отдельным файлом
  - [ ] pure compute не в composable

## 7. Migration grace

Existing файлы > 150 НЕ ломают CI до P8-18 (rule = `warn` level). При этом:

- **`/* eslint-disable max-lines */` per-file ЗАПРЕЩЁН.** Использовать только overrides в `eslint.config.mjs`.
- Каждый whitelist override **ДОЛЖЕН** иметь `sunset-PR ID` ИЛИ метку `permanent`.
- После merge sunset-PR запись удаляется (P8-18 trims).

## 8. Why ESLint-only? (Biome gap)

Biome 2.4.4 не имеет `max-lines` / `maxLinesPerFile` (см. https://biomejs.dev/linter/rules/). ESLint покрывает script. Vue SFC full-file coverage — `scripts/check-vue-sfc-size.ts`. Biome продолжает использоваться для другого (формат, `noConsole`).

**TODO:** при выходе Biome v3 с file-size правилом — pin его в `biome.json`, синхронизировать лимиты, удалить `max-lines` из ESLint (один источник истины).

## 9. Связанные документы

- [docs/refactor/REFACTOR-PLAN.md](refactor/REFACTOR-PLAN.md) — Phase 8 plan (introduces these rules).
- [docs/refactor/index.md](refactor/index.md) — оглавление всех фаз рефакторинга.
- [AGENTS.md](../AGENTS.md) — архитектура, секция «Архитектурные слои».
- [CLAUDE.md](../CLAUDE.md) — короткая ссылка на этот файл.
