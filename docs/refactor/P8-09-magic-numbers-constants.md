# P8-09: magic numbers → app/utils/constants/timing.ts

**Status:** todo
**Priority:** low
**Estimate:** 1ч
**Depends on:** P8-02
**Group:** C — UI extraction
**Sunset:** —

## Цель

Вынести inline `setTimeout(N)` и `debounce(N)` константы в `app/utils/constants/timing.ts`. Каждое значение получает имя и комментарий «зачем».

## Изменения

1. **`app/utils/constants/timing.ts`** (≤ 30 LOC):
   ```ts
   /** Задержка авто-fullscreen после mount окна — даёт frame-loop инициализироваться. */
   export const FULLSCREEN_AUTO_SET_DELAY_MS = 10
   /** Грейс перед скрытием tooltip — защита от мерцания при перелёте курсора между items. */
   export const TOOLTIP_HIDE_DELAY_MS = 150
   /** Debounce регенерации taskbar preview — частые мутации DOM не должны дёргать html-to-image. */
   export const PREVIEW_DEBOUNCE_MS = 500
   ```
2. **Migrations** (по grep):
   - `useWindowFullscreenAutoSet.ts:72` `setTimeout(10)` → `FULLSCREEN_AUTO_SET_DELAY_MS`.
   - `useTaskbarTooltips.ts:96` `setTimeout(150)` → `TOOLTIP_HIDE_DELAY_MS` (если P8-07 уже мерджнут — там же).
   - `frame.ts:89` `debounce(500)` → `PREVIEW_DEBOUNCE_MS` (если P8-06 уже мерджнут — в `useWindowPreview`).
3. **ESLint custom rule (TODO future)** — запрет inline `setTimeout([0-9]+)` в `app/composables/`, `app/components/`. В этом PR — manual grep.

## Тесты

- `grep -rE 'setTimeout\([0-9]+' app/ --include='*.ts' --include='*.vue'` → 0 outside `app/utils/constants/`.
- E2E: fullscreen, tooltip, preview работают как раньше.

## Acceptance criteria

- [ ] `timing.ts` создан, ≤ 30 LOC.
- [ ] 3 migration sites закрыты.
- [ ] grep zero hits.

## Risks

- **Minor**: значения те же — поведение не меняется.
