# P8-08: useGridCells — pure calculator + wrapper

**Status:** todo
**Priority:** medium
**Estimate:** 1ч
**Depends on:** P8-02
**Group:** C — UI extraction
**Sunset:** —

## Цель

`useGridCells.ts` смешивает ResizeObserver + arithmetic расчёт ячеек. Split: pure calc → service, Vue-обёртка → composable ≤ 40 LOC.

## Изменения

1. **`app/services/gridCalculator.ts`** (≤ 90 LOC):
   - `calcGrid({ areaWidth, areaHeight, cellSize, gap }): { cols: number; rows: number; total: number; cells: { x: number; y: number }[] }` — pure.
2. **`app/composables/useGridCells.ts`** (≤ 40 LOC):
   - принимает root ref, observer-ом отслеживает size, вызывает `calcGrid` на изменение.

## Тесты

- `tests/unit/services/gridCalculator.test.ts` — corner cases (0×0, < cellSize).
- E2E: shortcut grid правильно ресайзится при viewport change.

## Acceptance criteria

- [ ] `services/gridCalculator.ts` ≤ 90 LOC, pure.
- [ ] `composables/useGridCells.ts` ≤ 40 LOC.
- [ ] Visual regression zero.

## Risks

- **Performance**: ResizeObserver + recalc — current behaviour, не меняется.
