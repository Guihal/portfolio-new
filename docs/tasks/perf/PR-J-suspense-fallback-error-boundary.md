# PR-J — Suspense fallback + error boundary в Window/Content

## Context

После PR-H ([3ddb95b](app/components/Window/Content.vue)) `<component :is="programView.component">` обёрнут в `<Suspense>`. Это починило рендеринг async program-компонентов внутри `.window__content__wrapper`. Но:

1. **Нет fallback** — во время async resolve (slow `useProgramFetch`, network throttle) окно полностью пустое.
2. **Нет error boundary** — если async setup в program-компоненте throw'ит (404, malformed entity, fetch timeout), ошибка пузырится через Suspense → парент `Window/index.vue` тоже async (`await useWindow`) → может убить рендер всего app.

В коде уже есть инфраструктура для error/loading state:
- `windowOb.states.error` — флаг ошибки, в `Content.vue:10` через `hasError` computed.
- `windowOb.states.loading` — флаг загрузки.
- `useWindowsUIStore.setError(id, message)` — транзакционная установка ошибки (errors map + states.error).
- `Window/Loader.vue` — spinner, рендерится поверх контента когда `loading === true`.

## Цель

1. Добавить `<template #fallback>` в Suspense внутри `Content.vue` — показывать loader пока async program загружается.
2. Добавить `onErrorCaptured` в `Content.vue` — ловить async throws из program-component, конвертировать в `windowOb.states.error` через `setError`.

## Файлы

- `app/components/Window/Content.vue` — Suspense fallback + onErrorCaptured.

## Изменение

### `Content.vue` template — Suspense с fallback

**Before** (пост-PR-H):
```vue
<template v-else-if="programView">
    <Suspense>
        <component :is="programView.component" />
    </Suspense>
</template>
```

**After**:
```vue
<template v-else-if="programView">
    <Suspense>
        <component :is="programView.component" />
        <template #fallback>
            <div class="window__content__suspense-fallback" />
        </template>
    </Suspense>
</template>
```

Минимальный fallback — пустой `<div>` с тем же background что и content area (через CSS). Не использовать `Window/Loader.vue` как fallback — он зависит от `windowOb.states.loading` flag, а Suspense fallback не имеет доступа к loading state programs (это другой layer).

Реальный loader (`Window/Loader.vue`) уже рендерится в `Window/index.vue` поверх content при `states.loading=true` — закроет fallback автоматически если `useFetchEntity` использует loading state.

### `Content.vue` script — onErrorCaptured

После computed'ов добавить:

```ts
import { useWindowsUIStore } from '~/stores/windowsUI';

onErrorCaptured((err, instance, info) => {
    logger.error('[window/content] async program component threw', {
        windowId: windowOb.id,
        info,
        err,
    });
    const message =
        err instanceof Error ? err.message : 'Внутренняя ошибка программы';
    uiStore.setError(windowOb.id, message);
    return false; // stop propagation — содержим ошибку в этом окне
});
```

`uiStore` уже создан на line 8. `setError` транзакционно устанавливает `states.error=true` + сохраняет message. Content.vue auto-rerender'ится, переключится на ветку `<template v-else-if="hasError">` и покажет error UI.

`return false` останавливает дальнейший error-propagation — другие окна и сам app не падают.

### CSS — fallback styling

В `<style>` добавить:
```scss
&__suspense-fallback {
    width: 100%;
    height: 100%;
    background: c('default-1');
}
```

Соответствует общему стилю `default-1` бэкграунду окон.

## Edge cases

- **Fast async resolve (cached)**: fallback мелькнёт на 1 тик, не страшно — Vue render scheduler коалесцирует.
- **errorCaptured возвращает true**: Vue propagate'ит ошибку дальше. Мы возвращаем `false` (stop).
- **Multiple throws в одном окне**: `setError` идемпотентен — последний message wins. ✓.
- **Окно уже было `error=true`**: новый throw перезапишет message. Acceptable.
- **logger import**: проверить что `logger` global или нужен import. В `useAppBootstrap.ts:41` — `logger.warn(...)` используется без import → значит auto-import (Nuxt). ✓.
- **Suspense + `await useFetchEntity` в `useWindow`**: `useWindow` awaited на уровне `Window/index.vue`, не Content. Если `useFetchEntity` throw'ает — ошибка ловится otherwise (errors флоу через windowsUI). Наш onErrorCaptured ловит только throws из program-component setup (один уровень глубже).

## Тесты

- `bun run test:unit` PASS.
- `bun run typecheck` clean.
- Manual: добавить временный `throw new Error('test')` в Explorer setup → reload → вместо crash видим error-state в окне с сообщением "test". Удалить throw.

## Приёмка

- [ ] `<template #fallback>` добавлен в Suspense в `Content.vue`.
- [ ] Fallback element имеет class `window__content__suspense-fallback`.
- [ ] `onErrorCaptured` handler добавлен в `<script setup>`, вызывает `uiStore.setError(windowOb.id, message)`.
- [ ] `onErrorCaptured` возвращает `false` (stop propagation).
- [ ] Logger вызывается с windowId + info + err.
- [ ] CSS правило для `&__suspense-fallback` добавлено.
- [ ] `bun run typecheck` clean.
- [ ] `bun run biome:check` clean.
- [ ] `bun run lint` clean.
- [ ] `bun run test:unit` PASS без регрессий.
- [ ] SFC ≤ 150 LOC (текущий ~65 + ~15 новых = ~80 — OK).

## Architectural note

Соответствует docs/RULES.md (view layer). Не вводит DOM mutation, не делает магию — pure Vue API (Suspense, onErrorCaptured) + existing store API (`setError`). Reuses error UI infrastructure из P8-11.
