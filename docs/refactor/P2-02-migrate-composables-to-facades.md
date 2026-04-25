# P2-02. Composables → фасады над сторами

**ID:** P2-02
**Фаза:** 2. Pinia-сторы
**Статус:** done
**Приоритет:** high
**Оценка:** 3ч
**Зависит от:** P2-01

## Цель
Не ломая консюмеров, превратить существующие composables в тонкие обёртки над сторами. Это промежуточный шаг перед P2-03, где сами консюмеры будут переведены на прямой доступ к сторам.

## Контекст / проблема
Консюмеров много (`Window/index.vue`, `Taskbar/*`, `Workbench`, `app.vue`). Прямая миграция всех сразу — риск регрессии. Поэтому сначала меняем **внутренности composables**, сохраняя их внешние API.

## Затронутые файлы
- `app/composables/useAllWindows.ts`
- `app/composables/useWindowBounds.ts`
- `app/composables/useFocusController.ts`
- `app/composables/useFrameObserver.ts`
- `app/composables/useContentArea.ts`
- `app/composables/useWindowPaths.ts`
- `app/composables/useWindowsGroupByProgram.ts`

## Шаги

Для каждого composable — заменить внутреннюю реализацию на вызовы соответствующего стора, **сохранив сигнатуру**.

1. `useAllWindows()` — возвращает `{ allWindows, allWindowsIdCounter }`. Внутри — `useWindowsStore()` + `toRefs` / `storeToRefs`.
2. `useWindowBounds(id)` — возвращает `{ target, calculated }`. Внутри — `useBoundsStore().ensure(id)` → вернуть ссылки.
3. `getTargetBounds(id)` / `getCalculatedBounds(id)` — через `useBoundsStore`.
4. `useFocusWindowController()` — возвращает `{ focus, unFocus, getIsFocusedState }`. Внутри — `useFocusStore`.
5. `useFrameObserver()` — возвращает `{ createObserver, destroyObserver, getSrc }`. Внутри — `useFrameStore`.
6. `useContentArea()` — возвращает `{ contentArea, setTaskbarObserver, setViewportObserver }`. Внутри — `useContentAreaStore`.
7. `useWindowPaths()` — уйдёт в `useWindowsStore.byPath` getter; сам composable оставить как обёртку.
8. `useWindowsGroupByProgram()` — через `useWindowsStore.byProgram`.

`clearAllWindowsState()` — делегировать `useWindowsStore.$reset()`.

## Критерии готовности
- [x] Все composables — тонкие фасады (≤ 15 строк каждый).
- [x] Консюмеры не тронуты.
- [x] Playwright P0-06 все зелёные.
- [x] `nuxi typecheck` чист.
- [x] Bundle size не вырос больше чем на 10% (pinia добавляет ~5KB).

## Проверка
- Ручной: полный smoke — открытие/закрытие/перетаскивание/resize окон.
- В devtools Vue появляется Pinia-панель со сторами.
