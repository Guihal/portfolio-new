# P8-03: filesystem client

**Status:** todo
**Priority:** high
**Estimate:** 2ч
**Depends on:** P8-02
**Group:** B — Data layer
**Sunset:** —

## Цель

Завести `app/services/filesystem/FsClient.ts` — единая точка доступа к `/api/filesystem/{get,list,breadcrumbs}`. Composables и SFC после P8-05 / P8-04 пользуются этим клиентом, не `$fetch` напрямую.

## Изменения

1. **`app/services/filesystem/FsClient.ts`** (≤ 120 LOC):
   - `FsClient.get(path: string, opts?: { signal?: AbortSignal }): Promise<FsFile>`.
   - `FsClient.list(path: string, opts?): Promise<FsList>`.
   - `FsClient.getBreadcrumbs(path: string, opts?): Promise<Breadcrumb[]>`.
   - Внутри: `$fetch` (Nitro umbrella, SSR+CSR safe), retry на сетевую ошибку (1 раз, 200ms backoff), abort propagation, error mapping (404 → `FsNotFoundError`, 5xx → `FsServerError`).
2. **`app/services/filesystem/parseEntity.ts`** — type guard / runtime parse `FsFile` (используется на edge при необходимости).
3. **`app/services/filesystem/errors.ts`** (≤ 50 LOC) — `FsNotFoundError`, `FsServerError`, `FsAbortedError`.
4. **`app/services/filesystem/index.ts`** — re-exports.
5. **Тесты** `tests/unit/services/filesystem/FsClient.test.ts`:
   - mock `$fetch`, проверка retry-once на 5xx.
   - 404 → `FsNotFoundError`.
   - abort → reject с `FsAbortedError`.

## Тесты

- `bun run test:unit tests/unit/services/filesystem/` зелёный.
- `bun run typecheck` zero.

## Acceptance criteria

- [ ] `FsClient.ts` ≤ 120 LOC.
- [ ] 3 метода: get/list/getBreadcrumbs.
- [ ] error class hierarchy.
- [ ] Unit tests cover happy-path + 404 + 5xx-retry + abort.
- [ ] Не импортит `composables/` или `stores/`.

## Risks

- **SSR совместимость** — `$fetch` is Nitro umbrella, OK. Не использовать `window.fetch`.
- **Retry на non-idempotent** — ограничено GET-ами (filesystem read-only).
- **Дубль с server/utils/manifest** — нет, это client (browser/SSR), а manifest.ts — server-only loader.
