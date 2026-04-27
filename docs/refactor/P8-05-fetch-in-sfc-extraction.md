# P8-05: fetch в SFC → useProgramFetch

**Status:** todo
**Priority:** high
**Estimate:** 1.5ч
**Depends on:** P8-03
**Group:** C — UI extraction
**Sunset:** —

## Цель

Убрать `$fetch` / `useAsyncData` из `Programs/Explorer/index.vue` и `Programs/Explorer/Nav/index.vue`. Унифицировать логику — единый `useProgramFetch` параметризуется типом запроса.

## Изменения

1. **`app/composables/useProgramFetch.ts`** (≤ 80 LOC):
   - `useProgramFetch({ path, kind: 'list'|'get'|'breadcrumbs' })` → `{ data, isLoading, error, refresh }`.
   - Внутри: `useEntitiesStore().fetch()` для `'get'`, прямой `FsClient.list/getBreadcrumbs` для остальных (entity cache не нужен на list).
2. **`app/components/Programs/Explorer/index.vue`** — script ≤ 50 LOC; fetch строки удаляются, заменяются `const { data, isLoading } = useProgramFetch({ path, kind: 'list' })`.
3. **`app/components/Programs/Explorer/Nav/index.vue`** — то же.
4. **Тесты** `tests/unit/composables/useProgramFetch.test.ts`:
   - mock FsClient, проверка isLoading flow.
   - error mapping.

## Тесты

- `bun run test:unit tests/unit/composables/useProgramFetch.test.ts` зелёный.
- `bun run test:e2e` — Explorer и Nav работают без визуальных регрессий (Playwright screenshot).

## Acceptance criteria

- [ ] `app/composables/useProgramFetch.ts` ≤ 80 LOC.
- [ ] `Programs/Explorer/index.vue` ≤ 80 LOC (script ≤ 50).
- [ ] `Programs/Explorer/Nav/index.vue` ≤ 80 LOC.
- [ ] `grep -rE '\$fetch\(' app/components/Programs/` → 0 матчей.
- [ ] E2E зелёный.

## Risks

- **`useAsyncData` SSR semantics** — `useProgramFetch` использует `useAsyncData` под капотом для SSR-hydration; not just raw `$fetch`. Документировать в RULES.md §2a если ещё не там.
- **Dependent fetch** (Nav зависит от Explorer path) — параметризуется через ref/getter.
