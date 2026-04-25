# P3-04. Рефактор useWindowLoop

**ID:** P3-04
**Фаза:** 3. Window lifecycle
**Статус:** todo
**Приоритет:** medium
**Оценка:** 2ч
**Зависит от:** P2-03

## Цель
Упростить RAF-цикл анимации bounds: убрать лишние абстракции, сохранить производительность.

## Контекст / проблема
В `app/components/Window/composables/useWindowLoop/useWindowLoop.ts`:
1. Импорт `CSS_VAR_KEYS` не используется (стиль пишется через `element.style.cssText`).
2. `Preprocessor` — класс без собственного состояния (только ссылка на controller). По сути — одна чистая функция easing.
3. `prevBounds` + threshold 1px сравнивается в `flushToDOM` — но внутренние значения и так написаны через `cssText`, разница ~1px пользователем не воспринимается; сравнение можно упростить до `oldText === newText` один раз за кадр.

## Затронутые файлы
- `app/components/Window/composables/useWindowLoop/useWindowLoop.ts`
- `app/components/Window/composables/useWindowLoop/Preprocessor.ts`
- Переименование директории: `useWindowLoop/` → `useWindowBoundsAnimation/`.

## Шаги
1. Удалить импорт `CSS_VAR_KEYS` в `useWindowLoop.ts`.
2. Преобразовать `Preprocessor` → чистая функция `easeTowards(current: number, target: number, deltaMs: number, interacting: boolean): number`.
3. Файл `Preprocessor.ts` → `easing.ts`, экспортирует `easeTowards`.
4. `useWindowLoop.ts` → `controller.ts`. Внутри — `WindowAnimationController` class без `Preprocessor`-зависимости.
5. Заменить `flushToDOM`-сравнение `Math.abs(prev - new) < 1` на сборку строки `cssText` и сравнение `oldText === newText`.
6. Переименовать публичный `useWindowLoop` → `useWindowBoundsAnimation` (обновить импорт в `Window/index.vue` через фасад `useWindow`).
7. Переименовать директорию `useWindowLoop/` → `useWindowBoundsAnimation/`, index.ts реэкспортирует.
8. Покрыть `easing.ts` unit-тестом: `easeTowards(0, 100, 16, false)` → ~10 (10% за кадр при coeff=0.9).

## Критерии готовности
- [ ] Нет импорта `CSS_VAR_KEYS`.
- [ ] `easing.ts` — чистая функция без зависимостей.
- [ ] Директория `useWindowBoundsAnimation/` (3 файла: `controller.ts`, `easing.ts`, `index.ts`).
- [ ] Unit-тест на `easeTowards` зелёный.
- [ ] Playwright `drag-to-fullscreen` + `resize-clamped` проходят, drag остаётся плавным (визуально).
- [ ] Нет пиков CPU в Performance Panel.

## Проверка
- Performance-profile: drag окна → FPS ≥ 55.
- Ручной: drag и resize — визуально плавные.
