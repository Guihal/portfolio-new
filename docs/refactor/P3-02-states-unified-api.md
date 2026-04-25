# P3-02. Единый API для states

**ID:** P3-02
**Фаза:** 3. Window lifecycle
**Статус:** todo
**Приоритет:** high
**Оценка:** 2ч
**Зависит от:** P2-03

## Цель
Ввести API `setState/clearState/toggleState` в `useWindowsStore`. Централизовать проверки несовместимости (fullscreen + collapsed, fullscreen + drag, resize + collapsed).

## Контекст / проблема
Сейчас `windowOb.states.fullscreen = true` и `delete windowOb.states.drag` разбросаны по 8+ файлам. Несовместимые комбинации разруливаются ad-hoc (например, `useCollapsed.ts` руками удаляет `fullscreen/drag/resize`). Если ввести новую пару — забудешь проверить все места.

## Затронутые файлы
- `app/stores/windows.ts` (добавить `setState/clearState/toggleState`)
- `app/components/Window/composables/*` (использовать новое API)
- `app/components/Window/header/useMove.ts`
- `app/components/Window/composables/useResizeForDirectionsEvent.ts`
- `app/components/Window/composables/useCollapsed.ts`
- `app/components/Window/composables/useWindowFullscreenAutoSet.ts`
- Все другие места, где есть `windowOb.states.xxx = true`/`delete`.

## Шаги
1. В `useWindowsStore` добавить actions:
   - `setState(id: string, key: WindowState, value: true)`.
   - `clearState(id: string, key: WindowState)`.
   - `toggleState(id: string, key: WindowState)`.
2. Внутри этих actions описать таблицу несовместимостей:
   - При `setState(id, 'fullscreen', true)` → `clearState(id, 'collapsed' | 'drag' | 'resize')`.
   - При `setState(id, 'collapsed', true)` → `clearState(id, 'fullscreen' | 'drag' | 'resize')`.
   - При `setState(id, 'drag', true)` → `clearState(id, 'fullscreen' | 'collapsed')`.
   - При `setState(id, 'resize', true)` → `clearState(id, 'fullscreen' | 'collapsed')`.
3. Заменить все `windowOb.states.xxx = true` / `delete windowOb.states.xxx` на вызовы API.
4. Покрыть unit-тестом: `setState('w1', 'fullscreen', true)` → `states.collapsed === undefined`.

## Критерии готовности
- [ ] В коде нет прямых `windowOb.states.xxx = true` или `delete windowOb.states.xxx` (grep).
- [ ] Unit-тесты на несовместимости проходят.
- [ ] Все Playwright smoke зелёные.
- [ ] Пропадает возможность одновременно иметь `fullscreen + collapsed` (воспроизводимо вручную — не воспроизводится).

## Проверка
- Grep: `\.states\.[a-z]+ = true` — 0 результатов.
- Grep: `delete [a-zA-Z]+\.states\.` — 0 результатов.
