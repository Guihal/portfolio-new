# P8-14: server/utils/manifest.ts split

**Status:** todo
**Priority:** medium
**Estimate:** 1ч
**Depends on:** P8-02
**Group:** D — Structure cleanup
**Sunset:** —

## Цель

`server/utils/manifest.ts` объединил три операции: `loadManifest`, `findNode`, `resolveEntity`. Split на per-concern файлы.

## Изменения

```
server/utils/manifest/
├── index.ts                # re-exports — public API остаётся стабильным
├── loadManifest.ts         (≤60; чтение JSON, кэш с TTL по env)
├── findNode.ts             (≤50; tree traversal)
└── resolveEntity.ts        (≤60; node → FsFile + parent breadcrumbs)
```

Existing `server/utils/manifest.ts` удаляется; consumers (api endpoints) импортят из `server/utils/manifest` (директория) — не меняется path.

## Тесты

- `tests/unit/server/utils/manifest/` — 3 файла unit-тестов на каждую функцию.
- API e2e: `/api/filesystem/{list,get,breadcrumbs}` отвечают как раньше.
- Snapshot manifest.json не меняется.

## Acceptance criteria

- [ ] 3 файла ≤ 60 LOC each.
- [ ] Public re-exports сохранены.
- [ ] API endpoint тесты зелёные.
- [ ] manifest.json byte-equal до/после.

## Risks

- **Import path change** — minimised re-exports от `server/utils/manifest/index.ts`.
- **Cache TTL** — сохранить existing logic из `cacheLifetime.ts`.
