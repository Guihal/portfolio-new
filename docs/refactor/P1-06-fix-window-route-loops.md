# P1-06. Потенциальные циклы в useWindowRoute

**ID:** P1-06
**Фаза:** 1. Фикс багов
**Статус:** done
**Приоритет:** medium
**Оценка:** 2ч
**Зависит от:** P0-06

## Цель
Свести двустороннюю синхронизацию `window ↔ URL` к одному чёткому состоянию. Убрать избыточные обёртки и потенциальные циклы.

## Контекст / проблема
В `app/components/Window/composables/useWindowRoute.ts`:
1. Два watcher-а на `windowOb.targetFile.value` с `immediate: true` + один watcher на `route.path` (через `debounce`). Флаг `isProgrammaticNavigation` работает, но неочевидно.
2. `watch(() => windowOb.states.focused, …)` и `watch(() => windowOb.targetFile.value, …)` оба могут триггерить `queuedPush` одновременно.
3. Возвращается `computed(() => windowRoute.value)` вокруг обычного `ref` — лишняя обёртка.
4. `debounce((newPath) => …, 16)` теряет строгую типизацию `WatchCallback`.

## Затронутые файлы
- `app/components/Window/composables/useWindowRoute.ts`
- `app/components/Window/utils/debounce.ts` (улучшить типизацию)

## Шаги
1. Ввести одно состояние `const windowRoute = ref(windowOb.targetFile.value)`.
2. Ввести явный флаг направления синхронизации:
   - `const syncSource = ref<'route' | 'window' | 'idle'>('idle')`.
   - Watcher-ы проверяют `syncSource.value !== 'opposite'` перед тем, как писать в другое направление.
3. Слить два watcher-а на `targetFile.value` в один.
4. Watcher на `route.path` — через `debounce`, но с чёткими guards: только если `focused` и источник не `window`.
5. Типизировать `debounce` как `debounce<T extends (...args: any[]) => any>(fn: T, ms: number): T`.
6. Возвращать `readonly(windowRoute)` (не `computed`).

## Критерии готовности
- [x] Логика умещается в ~40 строк без ad-hoc флагов.
- [x] Нет двух одновременных watcher-ов на `windowOb.targetFile.value`.
- [x] `debounce` сохраняет типы аргументов.
- [x] Playwright: открыть окно `/about-me`, сменить URL через нажатие ссылки в Explorer (`/projects`) → окно обновляется, URL меняется, цикла нет.
- [x] В devtools Vue нет бесконечного триггера watcher-ов.

## Проверка
- Playwright: навигация между окнами и ссылками в Explorer.
- Ручной: открыть два окна, переключаться между ними — URL следует за фокусом.
