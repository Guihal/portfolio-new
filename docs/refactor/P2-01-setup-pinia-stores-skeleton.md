# P2-01. Скелеты Pinia-сторов

**ID:** P2-01
**Фаза:** 2. Pinia-сторы
**Статус:** done
**Приоритет:** high
**Оценка:** 3ч
**Зависит от:** Фаза 1 полностью закрыта

## Цель
Поднять пять Pinia-сторов параллельно текущему коду. Ничего пока не заменять — только заложить инфраструктуру для фазы 2.02 и 2.03.

## Контекст / проблема
`@pinia/nuxt` уже в зависимостях, но не используется. Переход на Pinia даёт: SSR-safe state (per-request), единое место для типов/actions, тестируемость через `createPinia()`.

## Затронутые файлы
Новые:
- `app/stores/windows.ts`
- `app/stores/bounds.ts`
- `app/stores/focus.ts`
- `app/stores/frame.ts`
- `app/stores/contentArea.ts`
- `app/stores/queuedRouter.ts` (бонус — переносим фазой 3.05, здесь только скелет)
- `tests/unit/stores/*.test.ts`

## Шаги
Для каждого стора описать **state + getters + actions** (структура; **без** массового рефакторинга консюмеров):

1. **`useWindowsStore`** (`stores/windows.ts`):
   - state: `windows: Record<string, WindowOb>`, `counter: number`.
   - getters: `list` (массив), `byId(id)`, `byPath(path)`, `byProgram(type)`.
   - actions: `create(file)`, `remove(id)`, `focus(id)`, `unFocus()`, `setState(id, key, value)`, `clearState(id, key)`.
2. **`useBoundsStore`** (`stores/bounds.ts`):
   - state: `bounds: Record<id, { target: WindowBounds; calculated: WindowBounds }>`.
   - actions: `ensure(id)`, `remove(id)`, `setTarget(id, partial)`, `syncCalculated(id)`.
3. **`useFocusStore`** (`stores/focus.ts`):
   - state: `focusedId: string | null`.
   - getters: `isFocused(id)`.
   - actions: `focus(id)`, `unFocus()`.
4. **`useFrameStore`** (`stores/frame.ts`):
   - state: `images: Record<id, string>`.
   - actions: `set(id, src)`, `remove(id)`.
   - observer-map — хранить как module-level (client-only), но в store предоставить `createObserver(windowOb)` / `destroyObserver(id)` как actions.
5. **`useContentAreaStore`** (`stores/contentArea.ts`):
   - state: `viewport: { width, height }`, `taskbarHeight: number`.
   - getters: `area = computed(…)`.
   - actions: `setViewport(rect)`, `setTaskbarHeight(h)`.

Покрыть каждый стор минимальным unit-тестом: `createPinia(); вызвать create/focus → state обновился`.

## Критерии готовности
- [x] 5 файлов стора созданы.
- [x] Каждый стор типизирован (возвращает `WindowOb[]`, `WindowBounds` и т.д.).
- [x] `tests/unit/stores/` содержит smoke-тесты для каждого.
- [x] `bun run dev` работает — старая логика не тронута.
- [x] `nuxi typecheck` чист.

## Проверка
- Unit-тесты зелёные.
- Smoke Playwright — ничего не сломано (миграция — в P2-03).
