# PR-I — SSR per-request store reset (fix Pinia cross-request pollution)

## Context

[`useAppBootstrap.ts:50-66`](app/composables/global/useAppBootstrap.ts#L50-L66) сбрасывает только `useWindowsStore.$reset()` на SSR. Остальные stores — `bounds`, `focus`, `frame`, `contentArea`, `queuedRouter`, `windowsUI` — **не reset'ятся** между SSR запросами. Pinia warning в console (`"Pinia instance not found in context. This falls back to the global activePinia which exposes you to cross-request pollution"`) — точный признак этой проблемы.

На production Vercel/Nitro процесс держит global activePinia между запросами. Запрос A создаёт окно → пишет в `bounds.bounds`, `frame.images`, `focus.focusedId`. Запрос B приходит к тому же worker → читает state от A.

Реальный риск: чужие window positions, JPEG previews, focus state, error messages между разными user sessions на одном Vercel function instance.

Plus: `queuedRouter.queue` (mutable plain array) — не reset'ится, ghost router-pushes из прошлого запроса могут отыграть в новом.

## Цель

На SSR (`import.meta.server`) reset все Pinia stores в `useAppBootstrap`. Не трогать клиентский путь — там state живёт сессией.

## Файлы

- `app/stores/focus.ts` — добавить `$reset()` (нет сейчас).
- `app/stores/bounds.ts` — добавить `$reset()` (есть `remove(id)`, нет полного reset).
- `app/stores/frame.ts` — добавить `$reset()` (есть `__resetFrameImages` HMR-only).
- `app/stores/contentArea.ts` — добавить `$reset()` (refs viewport + 2 flags).
- `app/stores/queuedRouter.ts` — добавить `$reset()` (queue array + isProcessing + lastPushedPath).
- `app/stores/windowsUI.ts` — уже имеет `$reset()` (line 56), не трогать.
- `app/stores/windows.ts` — уже имеет `$reset()` (line 148), не трогать.
- `app/composables/global/useAppBootstrap.ts` — расширить SSR-reset block: вызвать `$reset()` всех stores.

## Изменение

### 1. Каждый store без `$reset()` — добавить функцию

**`app/stores/focus.ts`** — после `unFocus`:
```ts
function $reset() {
    focusedId.value = null;
}
return { focusedId, isFocused, focus, unFocus, $reset };
```

**`app/stores/bounds.ts`** — после `syncCalculated`:
```ts
function $reset() {
    bounds.value = {};
}
return { bounds, ensure, remove, setTarget, syncCalculated, $reset };
```

**`app/stores/frame.ts`** — после `remove`:
```ts
function $reset() {
    images.value = {};
}
return { images, set, remove, $reset };
```

**`app/stores/contentArea.ts`** — после mark функций:
```ts
function $reset() {
    viewport.value = { width: 0, height: 0 };
    taskbarHeight.value = 0;
    viewportObserverInitialised.value = false;
    taskbarObserverInitialised.value = false;
}
return { ..., $reset };
```

**`app/stores/queuedRouter.ts`** — после `push`. Внутри замыкания есть `queue` array, его тоже сбросить:
```ts
function $reset() {
    queue.length = 0;
    queueLength.value = 0;
    isProcessing.value = false;
    lastPushedPath.value = null;
}
return { lastPushedPath, isProcessing, isEmpty, queue: queueRef, push, $reset };
```

### 2. `useAppBootstrap.ts:50-66` — расширить SSR-reset

**Before**:
```ts
await callWithNuxt(nuxtApp, () => {
    if (import.meta.server) {
        useWindowsStore().$reset();
    }
    if (effectivePath !== "/") { ... }
});
```

**After**:
```ts
await callWithNuxt(nuxtApp, () => {
    if (import.meta.server) {
        useWindowsStore().$reset();
        useBoundsStore().$reset();
        useFocusStore().$reset();
        useFrameStore().$reset();
        useContentAreaStore().$reset();
        useQueuedRouterStore().$reset();
        useWindowsUIStore().$reset();
    }
    if (effectivePath !== "/") { ... }
});
```

Импорты в `useAppBootstrap.ts` расширить аналогично.

## Edge cases

- **Reset порядок**: `windowsUI.setError` зависит от `windows`. На reset порядок не важен (просто чистим обе мапы), но если бы зависело — `windows` сбрасывать первым. Текущий `$reset` в `windowsUI` чисто чистит `errors` ref, не трогает `windows`. ✓
- **`contentArea.viewportObserverInitialised`** flag сбрасывается на SSR, но на server side этот observer всё равно не запускается (`import.meta.client` guard в `useViewportObserver`). На клиенте observer init происходит на mount → flag станет true заново. ✓
- **`bounds.bounds`** хранит per-window `BoundsSlot` с `markRaw` обёрнутыми reactive объектами. `$reset` через `bounds.value = {}` — правильно (заменяет верхний ref). markRaw'нутые внутренние объекты потеряют references → GC. ✓
- **Тесты**: уже есть test для `windows.$reset` — `tests/...windowsStore.test.ts`. Добавить аналогичные не обязательно, но не повредит.

## Тесты

- `bun run test:unit` PASS без регрессий.
- `bun run typecheck` clean.
- `bun run biome:check` clean.
- `bun run lint` clean.
- Manual: после prod build (`bun run build && bun run preview`) две вкладки → разные windows на /about и /projects → state на server side изолирован (нельзя проверить unit тестом, но можно через два curl запроса с разными paths и посмотреть что HTML response не leak'ает state).

## Приёмка

- [ ] `app/stores/focus.ts` имеет `$reset()` функцию, экспортируется.
- [ ] `app/stores/bounds.ts` имеет `$reset()`, экспортируется.
- [ ] `app/stores/frame.ts` имеет `$reset()`, экспортируется.
- [ ] `app/stores/contentArea.ts` имеет `$reset()`, экспортируется.
- [ ] `app/stores/queuedRouter.ts` имеет `$reset()`, экспортируется (включая локальный `queue.length = 0`).
- [ ] `useAppBootstrap.ts` SSR block вызывает `$reset()` для всех 7 stores (`windows` + 6 новых).
- [ ] Импорты добавлены, нет TS ошибок.
- [ ] `bun run typecheck` clean.
- [ ] `bun run biome:check` clean.
- [ ] `bun run lint` clean.
- [ ] `bun run test:unit` PASS без регрессий (151 baseline).
- [ ] Все store-файлы остаются ≤ 150 LOC (per docs/RULES.md §3.1).

## Architectural note

Соответствует docs/RULES.md §2 (state layer). `$reset` — стандартный Pinia-pattern. SSR-isolation — корректное использование Nuxt-context. Не трогает клиентский path.
