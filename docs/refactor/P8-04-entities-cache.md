# P8-04: shared entity cache

**Status:** todo
**Priority:** medium
**Estimate:** 2ч
**Depends on:** P8-03
**Group:** B — Data layer
**Sunset:** —

## Цель

Сейчас каждое окно с одинаковым `path` загружает `FsFile` независимо. Завести shared cache на уровне Pinia store, чтобы переиспользовать загруженные entity между окнами / навигациями.

## Изменения

1. **`app/stores/entities.ts`** (≤ 120 LOC):
   - `cache: Map<string, FsFile>` (key = canonical path).
   - `inFlight: Map<string, Promise<FsFile>>` (защита от concurrent fetches того же path).
   - `actions.fetch(path): Promise<FsFile>` — return cached / in-flight / start new via `FsClient.get(path)`.
   - `actions.invalidate(path?)` — invalidate one OR all.
   - TTL не нужен (контент статичный, манифест регенерируется на dev/build).
2. **`app/components/Window/composables/useFetchEntity.ts`** (рефактор: использует `useEntitiesStore().fetch(path)` вместо прямого `$fetch`).
3. **Тесты** `tests/unit/stores/entities.test.ts`:
   - cache hit на повторный fetch.
   - in-flight dedup при concurrent calls.
   - invalidate(path) убирает только этот ключ.

## Тесты

- `bun run test:unit tests/unit/stores/entities.test.ts` зелёный.
- `bun run test:unit tests/unit/composables/useFetchEntity.test.ts` зелёный после рефактора (E2E behaviour не меняется).
- `bun run test:e2e` — открытие двух окон с одним path не делает 2 network request.

## Acceptance criteria

- [ ] `stores/entities.ts` ≤ 120 LOC.
- [ ] `useFetchEntity` использует store, не `$fetch` напрямую.
- [ ] In-flight dedup работает.
- [ ] Unit tests покрывают cache hit, in-flight dedup, invalidate.

## Risks

- **State sync с manifest** — manifest регенерируется на dev. invalidate по `builder:watch` hook (TODO future, не в этом PR).
- **SSR cache leak** — `Map` per-store-instance, Pinia изолирует per-request на SSR. Verify в P1-09 regression test.
