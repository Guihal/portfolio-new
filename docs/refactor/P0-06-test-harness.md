# P0-06. Тестовый контур (Vitest + Playwright)

**ID:** P0-06
**Фаза:** 0. Инфраструктура
**Статус:** done
**Приоритет:** critical
**Оценка:** 4ч
**Зависит от:** P0-03

## Цель
Завести минимальные unit + e2e тесты, которые блокируют регрессии в фазах 1–7.

## Контекст / проблема
Без тестов любой рефакторинг — минное поле, особенно в фазе 3 (переезд lifecycle). Пять smoke-сценариев покрывают 80% критического флоу десктопной OS.

## Затронутые файлы
Новые:
- `tests/unit/clampers.test.ts`
- `tests/unit/debounce.test.ts`
- `tests/unit/easing.test.ts` (после P3-04 — упрощение `Preprocessor`)
- `tests/unit/manifest.test.ts` (тест `findNode`)
- `tests/e2e/smoke/root.spec.ts`
- `tests/e2e/smoke/shortcut-opens-window.spec.ts`
- `tests/e2e/smoke/drag-to-fullscreen.spec.ts`
- `tests/e2e/smoke/resize-clamped.spec.ts`
- `tests/e2e/smoke/close-via-taskbar.spec.ts`
- `vitest.config.ts`
- `playwright.config.ts`

Модификации:
- `package.json` — scripts `test:unit`, `test:e2e`.

## Шаги
1. Установить Vitest + `@vue/test-utils` + jsdom.
2. Установить Playwright (`@playwright/test`).
3. Создать `vitest.config.ts` (с алиасами `~` / `~~` из nuxt).
4. Написать **unit-тесты**:
   - `clampers.test.ts` — проверить `clamp`/`width`/`height`/`top`/`left` для всех граничных случаев.
   - `debounce.test.ts` — вызов один раз при серии вызовов.
   - `manifest.test.ts` — `findNode` на `/`, `/about-me`, неизвестном пути.
5. Написать **5 Playwright smoke**:
   - **root.spec.ts**: открыть `/`, проверить наличие `.taskbar`, `.workbench`.
   - **shortcut-opens-window.spec.ts**: клик (double-click на desktop) по ярлыку `about-me` → появляется `.window`, URL = `/about-me`.
   - **drag-to-fullscreen.spec.ts**: mousedown на `.window__header__wrapper`, mousemove за левый край viewport, mouseup → на окне класс `fullscreen`.
   - **resize-clamped.spec.ts**: mousedown на правой ручке, drag внутрь → ширина не меньше `MINSIZE` (320).
   - **close-via-taskbar.spec.ts**: открыть 2 окна, навести на frame в taskbar, нажать close → окно исчезает.
6. В `package.json` добавить `test:unit` (Vitest) и `test:e2e` (Playwright).
7. В lefthook добавить `test:unit` как часть pre-push (не pre-commit — медленно).

## Критерии готовности
- [x] `bun run test:unit` — все тесты проходят.
- [x] `bun run test:e2e` — все 5 smoke проходят.
- [x] CI-интеграция (optional в рамках задачи; зафиксировать в backlog).
- [x] Тесты документированы коротко в заголовке файла.

## Проверка
- Намеренно сломать `useWindowPaths.hasPath` (вернуть всегда `false`) → e2e `shortcut-opens-window` должен падать дважды при двойном клике → подтверждает, что тест ловит регрессию P1-01.
