# P8-13: app/composables/ global vs window boundary

**Status:** todo
**Priority:** low
**Estimate:** 2ч
**Depends on:** Group C
**Group:** D — Structure cleanup
**Sunset:** —

## Цель

`app/composables/` имеет 10 flat файлов смешанных: cross-app singletons (`useAppBootstrap`) и per-window helpers (`useGridCells`, `useTaskbarTooltips`). Чёткое разделение.

## Изменения

```
app/composables/
├── index.ts                       # re-exports
├── global/                        # cross-app singletons, init at app mount
│   ├── useAppBootstrap.ts
│   ├── useViewportObserver.ts
│   └── useWindowTitle.ts
├── window/                        # per-window OR per-component helpers
│   ├── useGridCells.ts
│   ├── useTaskbarTooltips.ts → useTooltipState (от P8-07, переименовать)
│   ├── useResizeObserver.ts
│   ├── useSeoUnfocus.ts
│   ├── useSetChainedWatchers.ts
│   └── useBatchedRef.ts
└── shared/                        # used by both global+window
    └── useGetShortcut.ts
```

Все imports обновить.

## Тесты

- `bun run typecheck` zero.
- `bun run test:unit` зелёные.
- E2E zero regressions.
- **SSR check**: `app/composables/global/` не должен иметь module-scope `let foo = ref(...)` (P1-09 regression). Проверить вручную + добавить в P1-09 regression test scope.

## Acceptance criteria

- [ ] `global/` / `window/` / `shared/` directories.
- [ ] Imports updated.
- [ ] No module-scope state в `global/`.
- [ ] CI зелёный.

## Risks

- **SSR leak** — приоритетный verify.
- **Naming conflicts** — `index.ts` re-exports без collisions.
