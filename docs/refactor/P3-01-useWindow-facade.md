# P3-01. Единый useWindow-фасад

**ID:** P3-01
**Фаза:** 3. Window lifecycle
**Статус:** todo
**Приоритет:** high
**Оценка:** 3ч
**Зависит от:** P2-03

## Цель
Сократить `Window/index.vue` с 141 строки (+ 11 отдельных composable-вызовов) до ~30 строк с одним фасадом `useWindow(windowOb)`.

## Контекст / проблема
Сейчас `Window/index.vue` вызывает:
1. `useSetFocusState`
2. `useWindowRoute`
3. `useWindowLoading` + `initWindowLoading`
4. `useSetFullscreenObserver`
5. `useWindowFullscreenAutoSet`
6. `useFocusOnClick`
7. `useSetLoadingState`
8. `useSeoWindow`
9. `useWindowLoop`
10. `useFrameObserver` (в onMounted)
11. `useWindowEntityFetcher`

Плюс `provide('windowRoute', …)`, `provide('windowOb', …)`. Порядок вызовов и зависимостей неочевиден.

## Затронутые файлы
- Новый `app/components/Window/composables/useWindow.ts`
- `app/components/Window/index.vue`

## Шаги
1. Создать `useWindow(windowOb)` — фасад, возвращает `{ windowRoute, isLoading, focusWindow, unFocus, node: Ref<HTMLElement | null>}`.
2. Внутри вызывать логически сгруппированные composables:
   - **routing**: `useWindowRoute(windowOb)`.
   - **entity**: `await useFetchEntity(windowOb, windowRoute)` — слитый `useWindowEntityFetcher` + `useWindowFetch` (выполняется в P3-03).
   - **focus**: `useFocusState(windowOb)` (объединённые `useSetFocusState` + `useFocusOnClick`).
   - **bounds-animation**: `useWindowBoundsAnimation(windowOb, node)` (переименованный `useWindowLoop`, выполняется в P3-04).
   - **states**: `useWindowStates(windowOb)` — инкапсулирует fullscreen/collapsed/drag/resize (подготовка в P3-02).
   - **seo**: `useSeoWindow(windowOb)`.
   - **preview**: `useWindowPreview(windowOb)` — обёртка над FrameObserver.
3. `provide('windowRoute', …)` и `provide('windowOb', …)` оставить — их потребляет `Content.vue` и программы.
4. В `Window/index.vue` остаётся:
   - `const { windowOb } = defineProps(...)`.
   - `const { node, focusWindow, unFocus } = useWindow(windowOb)`.
   - template + mounted/unmounted.

## Критерии готовности
- [ ] `Window/index.vue` ≤ 30 строк (не считая `<template>`/`<style>`).
- [ ] В `index.vue` один вызов `useWindow`.
- [ ] Все Playwright-тесты зелёные.
- [ ] `nuxi typecheck` чист.
- [ ] Новому разработчику хватает 5 минут понять lifecycle.

## Проверка
- Полный smoke.
- Ручной: открыть окно, drag, resize, fullscreen, close — всё работает.
