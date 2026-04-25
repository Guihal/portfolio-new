# P2-03. Миграция консюмеров и чистка

**ID:** P2-03
**Фаза:** 2. Pinia-сторы
**Статус:** todo
**Приоритет:** high
**Оценка:** 4ч
**Зависит от:** P2-02

## Цель
Перевести консюмеров на прямой доступ к Pinia-сторам. Удалить старые composables-фасады, если больше не нужны.

## Контекст / проблема
После P2-02 composables — это тонкие обёртки. Они дают двойной слой абстракции. Теперь консюмеры переводим на прямые сторы — меньше переходов в IDE, понятнее реактивность.

## Затронутые файлы
- `app/app.vue`
- `app/components/Window/index.vue`
- `app/components/Window/View.vue`
- `app/components/Window/Content.vue`
- `app/components/Window/header/*`
- `app/components/Window/composables/*`
- `app/components/Taskbar/*`
- `app/components/Workbench/*`
- Старые composables (`useAllWindows`, `useWindowBounds`, `useFocusController`, и т.д.) — удалить, если нет импортов.
- `useBatchedReactive.ts` — удалить (логика внутри `useBoundsStore.setTarget`).

## Шаги
1. Пройтись по всем консюмерам и заменить `useAllWindows()` → `useWindowsStore()`, `useFocusWindowController()` → `useFocusStore()` и т.д.
2. Там, где раньше были destructure-ы — использовать `storeToRefs(store)` для реактивности.
3. `useBatchedReactive` заменить на `useBoundsStore.setTarget(id, partial)` + `queueMicrotask` внутри стора (если нужен батчинг).
4. Прогнать `grep -r "useAllWindows\|useWindowBounds\|useFocusController\|useFrameObserver\|useContentArea\|useWindowPaths\|useWindowsGroupByProgram" app/` — убедиться, что не осталось использований.
5. Удалить composables-фасады, пустые или ставшие обёртками.

## Критерии готовности
- [ ] Консюмеры используют `useXxxStore()` напрямую.
- [ ] `app/composables/` не содержит устаревших фасадов.
- [ ] `useBatchedReactive.ts` удалён.
- [ ] `useAllWindowsBounds.ts`, `useMutationObserver.ts` остались удалёнными (из P0-01).
- [ ] Все 5 Playwright smoke зелёные.
- [ ] `nuxi typecheck` чист.
- [ ] Bundle уменьшился или остался прежним.

## Проверка
- Полный smoke.
- Profile: drag/resize не медленнее, чем раньше.
