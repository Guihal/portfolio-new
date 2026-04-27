# P8-17: Tooltip.vue → useTooltipPosition

**Status:** todo
**Priority:** low
**Estimate:** 1.5ч
**Depends on:** P8-01
**Group:** E — File-size hard-fixes
**Sunset:** —

## Цель

`Taskbar/Elements/Program/Tooltip.vue` (124 LOC) держит positioning math + DOM measurements + render. Extract positioning в composable.

## Изменения

1. **`app/components/Taskbar/Elements/Program/useTooltipPosition.ts`** (≤ 50 LOC):
   - Принимает `targetRef`, `tooltipRef`.
   - Считает позицию через service `tooltipState.calcTooltipPosition` (от P8-07).
   - Возвращает `{ top, left }` reactive.
2. **`Tooltip.vue`** (≤ 90 LOC) — script ≤ 30, template + style остальное.

## Тесты

- Tooltip отображается правильно при разных layouts.
- E2E screenshot zero regression.

## Acceptance criteria

- [ ] `useTooltipPosition.ts` ≤ 50 LOC.
- [ ] `Tooltip.vue` ≤ 90 LOC.
- [ ] Использует `services/tooltipState.ts` (от P8-07).

## Risks

- **Зависимость от P8-07** — должен мерджиться после P8-07 (Group C завершена).
- **Position update timing** — сохранить current behaviour.
