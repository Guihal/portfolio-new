# P1-09. SSR-утечки module-scope state

**ID:** P1-09
**Фаза:** 1. Фикс багов
**Статус:** done
**Приоритет:** high
**Оценка:** 2ч
**Зависит от:** P0-06

## Цель
Переместить все состояния из module-scope в `useState` (Nuxt-compatible) или в Pinia-сторы (в фазе 2 будет переведено полностью). Сейчас — минимальный фикс до Pinia.

## Контекст / проблема
В Nuxt SSR модульная область шерится между запросами разных пользователей. При росте SSR (сейчас частично выключен через `server: false`/`server: import.meta.server`) это приведёт к межзапросным утечкам — пользователь А увидит окна пользователя Б.

Проблемные места:
- `app/composables/useContentArea.ts` — `const viewport = ref(…)`, `const taskbarHeight = ref(0)`, флаги инициализации.
- `app/composables/useWindowsGroupByProgram.ts` — `const windowsGroupByProgram = ref({})`, `let initialized = false`.
- `app/composables/useFocusController.ts` — `export const focusedWindowId = ref(null)`.
- `app/composables/useFrameObserver.ts` — `const images = reactive({})`, `const observers = new Map()`.
- `app/composables/useQueuedRouter.ts` — `const lastPushedPath = ref(null)`, `const pushQueue = ref([])`, `let isProcessing = false`.

## Затронутые файлы
(все из списка выше)

## Шаги
1. `useContentArea.ts`: завернуть `viewport` и `taskbarHeight` в `useState('viewport', …)` / `useState('taskbar-height', …)`. Флаги `*Initialised` оставить, но пересмотреть после P2 (там будет init-hook store).
2. `useWindowsGroupByProgram.ts`: state в `useState`, флаг `initialized` убрать (заменить на `computed` с автоматической пересборкой).
3. `useFocusController.ts`: `focusedWindowId` в `useState('focused-window-id', …)`.
4. `useFrameObserver.ts`: `images` в `useState('frame-images', …)`. `observers` оставить как module Map — это side-effect контейнер, shared между запросами он лениво инициализируется и переиспользуется только на клиенте (в `onMounted`). Но обязательно добавить guard `import.meta.client` на создание observer.
5. `useQueuedRouter.ts`: `lastPushedPath`, `pushQueue`, `isProcessing` в `useState`. `isProcessing` можно оставить как `ref`, но внутри store-подобного сервиса.
6. Прогнать smoke-сценарии P0-06.

## Критерии готовности
- [x] Нет `const … = ref(…)` на module-scope для переменных, которые хранят user-specific state.
- [x] Playwright smoke все зелёные.
- [x] Ручной тест: два браузера → два разных набора окон (проверяется тривиально, но явно).

## Проверка
- Ручной: открыть сайт в Incognito + обычном окне → разные окна не пересекаются (на dev-сервере).
- Зафиксировать в комменте, что полный переход на Pinia — в P2-03.
