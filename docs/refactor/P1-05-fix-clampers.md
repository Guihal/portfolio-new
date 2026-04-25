# P1-05. Некорректный width clamp

**ID:** P1-05
**Фаза:** 1. Фикс багов
**Статус:** done
**Приоритет:** medium
**Оценка:** 1ч
**Зависит от:** P0-06

## Цель
Привести clamp-функции к прозрачному виду, ввести общий хелпер `clamp(val, min, max)`.

## Контекст / проблема
В `app/components/Window/utils/clampers.ts`:
```
width: (v, windowOb, cw, ch) =>
    Math.max(MINSIZE, Math.min(v, Math.min(v, cw))),
```
Двойной `Math.min(v, Math.min(v, cw))` бессмысленен — то же самое что `Math.min(v, cw)`. Плюс параметр `ch` не используется. В `height` — `_cw` в сигнатуре, но не используется.

Аналогично:
- `left` принимает `ch` в сигнатуре, но обращается только к `cw` и `MINSIZE`.
- `top` корректный, но сложный по форме.

## Затронутые файлы
- `app/components/Window/utils/clampers.ts`
- Новый `app/utils/math.ts` (общий `clamp`)
- `tests/unit/clampers.test.ts` (добавлен в P0-06)

## Шаги
1. В `app/utils/math.ts` создать `export function clamp(value: number, min: number, max: number): number`.
2. Переписать clampers через `clamp`:
   - `width = clamp(v, MINSIZE, cw)`
   - `height = clamp(v, MINSIZE, ch)`
   - `left = clamp(v, 0, cw - min(width, MINSIZE))`
   - `top = clamp(v, 0, ch - min(height, MINSIZE))`
3. Убрать неиспользуемые параметры из сигнатур (или оставить union-тип, если структурно нужен общий `ClampFn`).
4. Покрыть unit-тестами (граничные случаи: `v < min`, `v > max`, `min > max`).

## Критерии готовности
- [x] `clamp` вынесен в `app/utils/math.ts`.
- [x] `clampers.ts` не содержит `Math.min(v, Math.min(v, …))`.
- [x] `nuxi typecheck` чист при `strict: true`.
- [x] `tests/unit/clampers.test.ts` покрывает: `v=100; cw=800; MINSIZE=320` → `width = 320` (min), `width(900) = 800` (max), `width(500) = 500` (no clamp).
- [x] Playwright `resize-clamped.spec.ts` проходит.

## Проверка
- Ручной: resize окна до минимума — ширина не меньше 320.
- Ручной: resize за правый край наружу — ширина не больше viewport.
