# P1-04. Дубликат fullscreen-ready логики

**ID:** P1-04
**Фаза:** 1. Фикс багов
**Статус:** done
**Приоритет:** medium
**Оценка:** 1ч
**Зависит от:** P0-06

## Цель
Свести к единому источнику логику «окно выпало за край → готово к fullscreen». Устранить конфликтующие `setTimeout` и расхождение между «позицией курсора» и «bounds окна».

## Контекст / проблема
Две реализации одновременно управляют состоянием `windowOb.states['fullscreen-ready']` и переводом в fullscreen на `pointerup`:

1. `app/components/Window/header/useMove.ts` — смотрит на **позицию курсора** (lastX/lastY vs OFFSET). В `pointerup` ставит `fullscreen = true` и убирает `fullscreen-ready`.
2. `app/components/Window/composables/useWindowFullscreenAutoSet.ts` — смотрит на **bounds окна** (target.left/top/width/height vs OFFSET). На окончании `states.drag` через `setTimeout(10)` ставит `fullscreen = true`.

Состояния рассинхронизированы (курсор может быть на краю, окно ещё нет), два разных `setTimeout` могут конфликтовать.

## Затронутые файлы
- `app/components/Window/header/useMove.ts`
- `app/components/Window/composables/useWindowFullscreenAutoSet.ts`

## Шаги
1. Принять решение: единственным источником правды остаётся **`useWindowFullscreenAutoSet`** (следит за bounds — более надёжно, работает не только при header-drag но и при любом изменении позиции).
2. Из `useMove.ts` удалить:
   - `const lastX = ref(0); const lastY = ref(0)`.
   - `isOutOfBounds()`.
   - `watch(lastX, callback, …)` и `watch(lastY, callback, …)`.
   - Установку/удаление `fullscreen-ready` в pointermove.
   - Проверку `if (windowOb.states['fullscreen-ready'])` в pointerup.
3. В `useMove.ts` оставить только: начало drag, обновление `target.top += deltaY`, `target.left += deltaX`, снятие состояния drag.
4. Проверить, что `useWindowFullscreenAutoSet` корректно реагирует на bounds во время drag (уже использует `useSetChainedWatchers` с source `() => ({ left, top, width, height })`).

## Критерии готовности
- [x] `useMove.ts` не содержит ссылок на `fullscreen`/`fullscreen-ready`.
- [x] Drag окна за край экрана всё ещё переводит его в fullscreen (Playwright smoke P0-06/`drag-to-fullscreen`).
- [x] Нет дублирующих `setTimeout` в разных файлах.
- [x] `useMove.ts` сократился на ~40 строк.

## Проверка
- Playwright `drag-to-fullscreen.spec.ts` проходит.
- Ручной: drag окна медленно в самый угол — один переход в fullscreen, без «дрожания».
