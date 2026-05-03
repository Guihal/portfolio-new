# P1-07. Перфоманс useFrameObserver

**ID:** P1-07
**Фаза:** 1. Фикс багов
**Статус:** done
**Приоритет:** high
**Оценка:** 1.5ч
**Зависит от:** P0-06

## Цель
Резко снизить частоту вызовов `html-to-image.toJpeg` — самой дорогой операции в приложении.

## Контекст / проблема
В `app/composables/useFrameObserver.ts`:
```
observer.observe(el, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
});
```
`MutationObserver` повешен на **весь `.window`** со всеми флагами. RAF-цикл в `useWindowLoop` меняет `style.cssText` каждый кадр → `attributes` триггерится постоянно. Debounce 300 мс слабо помогает — `html-to-image.toJpeg(wrapper, …)` всё равно запускается после любой анимации bounds.

## Затронутые файлы
- `app/composables/useFrameObserver.ts`

## Шаги
1. Вешать `MutationObserver` **не на `.window`**, а на `.window__content` — там нет RAF-анимаций.
2. Оставить только флаги `childList: true, subtree: true`. Убрать `attributes` и `characterData`.
3. Добавить гейт в `generateImage` — не генерировать, если:
   - `windowOb.states.drag === true`
   - `windowOb.states.resize === true`
   - `windowOb.states.collapsed === true`
   Иначе превью будет обновляться впустую.
4. Увеличить debounce до 500мс (300мс слишком чувствительно).
5. Проверить, что `observer.observe` ждёт mount `.window__content` (через `onMounted` + `document.querySelector`).
6. Покрыть smoke-тестом: после смены контента окна (например, клик по ярлыку в Explorer) — в taskbar-frame обновляется превью.

## Критерии готовности
- [x] `MutationObserver` слушает только `childList + subtree` на `.window__content`.
- [x] Во время drag/resize `toJpeg` не вызывается (проверяется через `logger.debug`-счётчик).
- [x] Playwright smoke: изменения контента окна отражаются в taskbar-превью (с допустимой задержкой).
- [x] В Chrome Performance-панели — нет пиков CPU во время drag.

## Проверка
- Performance profile: drag окна 5 секунд — раньше ~30 вызовов `toJpeg`, теперь 0.
- Смена контента (клик в Explorer) — 1 вызов `toJpeg` после debounce.
