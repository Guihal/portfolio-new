# P8-12: Window/composables/ subfolders

**Status:** todo
**Priority:** low
**Estimate:** 2ч
**Depends on:** Group C
**Group:** D — Structure cleanup
**Sunset:** —

## Цель

20+ flat composables в `app/components/Window/composables/`. Сгруппировать по назначению, без LOC change.

## Изменения

Структура:
```
app/components/Window/composables/
├── index.ts                      # re-export top-level (useWindow facade)
├── useWindow.ts                  # стержневой фасад (≤80)
├── lifecycle/
│   ├── useCreateAndRegisterWindow.ts
│   ├── useCreateWindowByPath.ts
│   ├── useInjectWindow.ts
│   ├── useInjectWindowRoute.ts
│   └── useFrameObserverLifecycle.ts
├── fetch/
│   ├── useFetchEntity.ts         (использует stores/entities.ts)
│   └── useLoadingStateSync.ts
├── focus/
│   ├── useFocusOnClick.ts
│   └── useSetFocusState.ts
├── fullscreen/
│   ├── useFullscreenOnMount.ts
│   ├── useWindowFullscreenAutoSet.ts
│   └── useOnFullScreen.ts
├── collapse/
│   ├── useCollapsed.ts
│   ├── useCollapseTrigger.ts
│   ├── useCollapseBoundsMemory.ts
│   └── useCollapseOffscreenPosition.ts
├── resize/
│   ├── useResizeForDirections.ts
│   └── useResizeForDirectionsEvent.ts
├── route/
│   ├── useWindowRoute.ts
│   └── useWindowLoading.ts
├── seo/
│   └── useSeoWindow.ts
├── program/
│   └── useProgramSetup.ts        (от P8-10)
└── anim/                         (как сейчас)
    └── useWindowBoundsAnimation/
```

Все imports обновить, no LOC changes функционально.

## Тесты

- `bun run typecheck` zero.
- `bun run test:unit` все зелёные.
- `bun run test:e2e` zero regressions.

## Acceptance criteria

- [ ] Все composables в подпапках по smysl группам.
- [ ] `index.ts` re-export для legacy imports (gradual migration).
- [ ] No LOC churn в файлах.

## Risks

- **Imports update** — большой diff, но механический. Использовать `bun run --bun ts-morph` или ручные grep+sed.
- **Cyclic re-exports** — index.ts только re-exports, не импортирует подмодули которые сами импортят index.ts.
