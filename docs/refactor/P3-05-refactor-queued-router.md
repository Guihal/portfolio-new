# P3-05. useQueuedRouter в Pinia-стор

**ID:** P3-05
**Фаза:** 3. Window lifecycle
**Статус:** todo
**Приоритет:** medium
**Оценка:** 1.5ч
**Зависит от:** P2-03

## Цель
Перевести `useQueuedRouter` на `useQueuedRouterStore` (Pinia). Убрать module-scope state. Упростить очередь до плоского массива.

## Контекст / проблема
В `app/composables/useQueuedRouter.ts`:
- `const lastPushedPath = ref(null)`, `const pushQueue = ref([])`, `let isProcessing = false` — всё на module-scope (SSR-leak, подкрыто P1-09, но там это временный фикс).
- Очередь хранится как `Ref<QueueItem[]>`, хотя её реактивность нигде не используется — шумит в devtools.
- Дедупликация сделана через `lastPushedPath` + `route.path`, но при быстрой последовательности `push('/a'), push('/a'), push('/b')` второй `/a` может пропуститься до того, как первый начал выполняться.

## Затронутые файлы
- Новый `app/stores/queuedRouter.ts`
- `app/composables/useQueuedRouter.ts` (удалить или превратить в re-export)
- Консюмеры (`app.vue`, `useFocusController`, `useWindowRoute`, …) — вызывают `useQueuedRouterStore()`.

## Шаги
1. Создать `useQueuedRouterStore()`:
   - state: `queue: QueueItem[]` (обычный массив, не ref-array), `processing: boolean`, `lastPushed: string | null`.
   - actions: `push(path)` → возвращает Promise.
   - Дедупликация: игнорируем, если вход совпадает с последним элементом в очереди **или** с `lastPushed` (в процессе выполнения).
2. Внутри `push` — обработчик очереди (запускается, если `!processing`).
3. Заменить `useQueuedRouter()` на тонкий re-export для временной совместимости, потом удалить.
4. Консюмеров перевести на `useQueuedRouterStore()`.
5. Покрыть unit-тестом: `push('/a')`, `push('/a')` — только один вызов `router.push`.

## Критерии готовности
- [ ] Нет module-scope state в `useQueuedRouter.ts` (или файл удалён).
- [ ] Unit-тест на дедупликацию зелёный.
- [ ] Playwright smoke все зелёные.
- [ ] `nuxi typecheck` чист.

## Проверка
- Ручной: быстрые повторные клики по одному ярлыку → один переход, не несколько.
- Devtools Router → не видно дублирующихся навигаций.
