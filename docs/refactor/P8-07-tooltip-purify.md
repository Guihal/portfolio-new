# P8-07: tooltip — pure positioning + thin wrapper

**Status:** todo
**Priority:** medium
**Estimate:** 1.5ч
**Depends on:** P8-02
**Group:** C — UI extraction
**Sunset:** —

## Цель

`useTaskbarTooltips.ts` (111 LOC) держит DOM API (`getBoundingClientRect`) + hardcoded `setTimeout(150)` + state. Split: pure calculator → service, Vue-обёртка → composable ≤ 60 LOC.

## Изменения

1. **`app/services/tooltipState.ts`** (≤ 80 LOC):
   - `calcTooltipPosition({ targetRect, tooltipRect, viewport, offset }): { top: number; left: number }` — pure, no DOM.
   - `clampToViewport({ pos, tooltipRect, viewport }): { top, left }` — pure.
2. **`app/composables/useTooltipState.ts`** (≤ 60 LOC, переименование из `useTaskbarTooltips`):
   - Vue-state (visible, target, position).
   - вызывает `getBoundingClientRect()` → передаёт в pure `calcTooltipPosition`.
   - использует `TOOLTIP_HIDE_DELAY_MS` из `app/utils/constants/timing.ts` (см. P8-09).
3. **`app/components/TaskbarTooltips.vue`** — точечный апдейт импорта.

## Тесты

- `tests/unit/services/tooltipState.test.ts` — pure calc на разных viewport sizes.
- `tests/unit/composables/useTooltipState.test.ts` — visible flow, hide delay.
- E2E: hover на taskbar item → tooltip появляется в правильной позиции.

## Acceptance criteria

- [ ] `services/tooltipState.ts` ≤ 80 LOC, pure.
- [ ] `composables/useTooltipState.ts` ≤ 60 LOC.
- [ ] Нет hardcoded `150` в composable.
- [ ] Visual regression zero.

## Risks

- **Edge case у viewport edges** — pure-функция тестируется на corner cases.
- **`useTaskbarTooltips` consumers** — точечный rename импорта.
