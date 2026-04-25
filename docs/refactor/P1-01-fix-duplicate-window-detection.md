# P1-01. [CRITICAL] Дубликаты окон не детектятся

**ID:** P1-01
**Фаза:** 1. Фикс багов
**Статус:** done
**Приоритет:** critical
**Оценка:** 0.5ч
**Зависит от:** P0-06

## Цель
Починить детекцию существующего окна при повторном открытии того же файла.

## Контекст / проблема
В `app/composables/useWindowPaths.ts` на строке 22:

```
if (allWindows!.value[typedKey]!.targetFile === path)
```

Сравнивается объект `{ value: string }` со строкой. Сравнение **всегда** возвращает `false`. Следствие: проверка дубликата в `useCreateAndRegisterWindow` никогда не срабатывает — при повторном открытии того же ярлыка создаётся **второе окно**, а не фокусируется существующее.

## Затронутые файлы
- `app/composables/useWindowPaths.ts`

## Шаги
1. Заменить сравнение на `allWindows.value[key].targetFile.value === path`.
2. Перейти с `for (key in allWindows.value)` на `Object.values(allWindows.value)` — убираются `!`-assertions и лишние type-guards.
3. Убрать все `!` (non-null assertions) — после P0-03 они станут ошибками TS при `noUncheckedIndexedAccess`.
4. Код должен выглядеть примерно как: «найти первую запись, где `ob.targetFile.value === path`, вернуть `ob.id` или `false`».

## Критерии готовности
- [x] `hasPath('/about-me')` возвращает `id` существующего окна, если оно уже открыто.
- [x] Нет `!`-assertions в файле.
- [x] Playwright-тест `shortcut-opens-window.spec.ts` дополнен сценарием «двойной двойной клик по тому же ярлыку → одно окно, фокус остаётся».
- [x] `nuxi typecheck` чист.

## Проверка
- Ручной: открыть ярлык «О себе» → открыть его же второй раз → увидеть, что второго окна не появляется.
- Автоматический: дополненный Playwright-тест P0-06.
