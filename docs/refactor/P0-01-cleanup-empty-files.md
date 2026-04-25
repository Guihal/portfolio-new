# P0-01. Чистка пустых файлов и debug-логов

**ID:** P0-01
**Фаза:** 0. Инфраструктура
**Статус:** done
**Приоритет:** high
**Оценка:** 1ч
**Зависит от:** —

## Цель
Убрать «мусор»: пустые файлы-заглушки и отладочные `console.log`, чтобы они не вводили в заблуждение и не попадали в production.

## Контекст / проблема
В проекте есть несколько файлов, которые содержат 0 строк и при этом импортируются или индексируются в IDE — выглядят как «точки расширения», но их нет. Плюс по исходникам рассыпаны `console.log`, оставшиеся от отладки.

## Затронутые файлы
Пустые — удалить:
- `app/composables/useAllWindowsBounds.ts`
- `app/composables/useMutationObserver.ts`
- `app/components/Window/utils/useRefBounds.ts`
- `server/utils/PROGRAMHADLERS.ts`
- `shared/utils/Programs/Explorer.ts`

Отладочные `console.log` — удалить:
- `app/components/Window/composables/useCollapsed.ts` — `console.log(value, lastValue, beforeCollapsedBounds.value, target.left)` в watcher-е.
- `app/components/Programs/Explorer/index.vue` — `watchEffect(() => console.log(windowRoute.value))` и `console.log(windowRoute.value)` в `useAsyncData`.
- `app/composables/useFrameObserver.ts` — `console.log('Generating image for window …')` в `generateImage`.

Мёртвый импорт:
- `app/components/Window/composables/useWindowLoop/useWindowLoop.ts` — импорт `CSS_VAR_KEYS` не используется (стиль пишется через `cssText`).

## Шаги
1. Удалить 5 пустых файлов.
2. Удалить все `console.log`-вызовы в 3 файлах.
3. Удалить неиспользуемый импорт `CSS_VAR_KEYS`.
4. `grep` по всему проекту на `console.log` — убедиться что других отладочных вызовов не осталось (кроме обёрнутых в logger, см. P0-05).

## Критерии готовности
- [x] Перечисленных пустых файлов нет в репозитории.
- [x] `grep -r "console.log" app/ server/ shared/` возвращает 0 результатов (до введения logger-а).
- [x] `nuxi typecheck` не ругается на отсутствующие импорты (снятый импорт `CSS_VAR_KEYS` не вызвал новых ошибок; оставшиеся ошибки — предсуществующие и не относятся к P0-01).
- [x] `bun run dev` стартует без предупреждений о мёртвых импортах.

## Проверка
- `bun run dev` → ручной смоук: открыть окно, закрыть окно, свернуть — в devtools-консоли тихо.
