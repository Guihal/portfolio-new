# Pattern: Window

Корневой UI-компонент Dimonya OS. Каждое открытое окно (programType) обёрнуто в `Window` — он отвечает за headers, drag/resize, fullscreen/collapsed, фокус, bounds-анимацию, SEO и preview-снэпшоты для taskbar.

## Файлы

- `app/components/Window/index.vue` — корневой компонент.
- `app/components/Window/types.ts` — `WindowOb`, `WindowState`, `WindowStates`.
- `app/components/Window/composables/useWindow.ts` — фасад, инициализирует все per-window-эффекты.
- `app/components/Window/header/` — `index.vue`, `name.vue`, `breadcrumbs.vue`, `nav/`, `useMove.ts`.
- `app/components/Window/resize/` — 9 хендлов (`Top/Bottom/Left/Right` + 4 угла + `All.vue`).
- `app/components/Window/composables/useWindowBoundsAnimation/` — RAF + CSS-vars анимация bounds.
- `app/components/Window/utils/removeWindow.ts` — каскадная очистка stores при закрытии.
- `app/stores/windows.ts`, `app/stores/bounds.ts`, `app/stores/focus.ts`, `app/stores/frame.ts` — состояние.

## Шаблон корневого компонента

```vue
<template>
    <div
        :id="`window-${windowOb.id}`"
        ref="windowNode"
        class="window"
        :class="windowOb.states"
        @click="focusWindow">
        <div class="pixel-box window__wrapper">
            <WindowLoader />
            <WindowHeader />
            <WindowContent />
        </div>
        <WindowResizeAll />
    </div>
</template>
```

`.window__wrapper` обязательно с `pixel-box` — корпус окна имеет пиксельные срезанные углы.

## Container queries

`.window` объявляет:
```scss
container-type: size;
container-name: window;
```

Все вложенные компоненты адаптируют layout через `cw/ch/cwh` миксины (см. `claude-design/snippets/container-queries.scss`). НЕ юзать `@media`.

## WindowOb-модель

```typescript
type WindowState =
    | 'fullscreen'
    | 'fullscreen-ready'
    | 'collapsed'
    | 'drag'
    | 'resize'
    | 'loading'
    | 'error'
    | 'focused'
    | 'preview';

type WindowOb = {
    id: string;
    states: Partial<Record<WindowState, true>>;
    targetFile: { value: string };
    file: FsFile | null;
};
```

## Lifecycle

```
open(path)
   │
   ▼
useWindowsStore.create(path)
   │
   ▼
<Window :windowOb=...> mounts → useWindow(windowOb)
   │
   ├─► routing:  useWindowRoute (URL ↔ targetFile)
   ├─► entity:   useFetchEntity → /api/filesystem/get → windowOb.file
   ├─► focus:    useSetFocusState + useFocusOnClick
   ├─► bounds:   useWindowBoundsAnimation (RAF interp + CSS vars)
   ├─► states:   useWindowFullscreenAutoSet, useCollapsed, loading-watch
   ├─► seo:      useSeoWindow
   └─► preview:  frameStore.createObserver (MutationObserver → html-to-image)
   │
   ▼
provide('windowOb', windowOb), provide('windowRoute', route)
   │
   ▼
<WindowContent /> рендерит programs[programType].component
```

## State API

```typescript
windowsStore.setState(id, key, value);   // value=true автоматически снимает несовместимые
windowsStore.clearState(id, key);
windowsStore.toggleState(id, key);
```

Conflict-table (set true → автоматически снимаются):

| key          | конфликтует с                       |
| ------------ | ----------------------------------- |
| `fullscreen` | `collapsed`, `drag`, `resize`       |
| `collapsed`  | `fullscreen`, `drag`, `resize`      |
| `drag`       | `fullscreen`, `collapsed`           |
| `resize`     | `fullscreen`, `collapsed`           |

`loading`, `focused`, `error`, `preview`, `fullscreen-ready` — независимые.

## Bounds-система

- `useBoundsStore` — per-id slot `{ target, calculated }`.
- `target` = желаемые координаты, `calculated` = текущие анимированные.
- `useWindowBoundsAnimation` — RAF-цикл, lerp от calculated → target, пишет CSS-vars `--w-left`, `--w-top`, `--w-width`, `--w-height` (`CSS_VAR_KEYS` в `bounds.ts`).
- НЕ писать CSS-vars напрямую — только через store.

## Стили

- `.window` — `position: fixed; width:100vw; height:100vh; left:0; top:0; translate:0 0; container-type:size; container-name:window;`. Bounds задаются через CSS-vars + translate/width/height.
- `.window__wrapper` — `width:100%; height:100%; display:flex; flex-direction:column; background: c('default'); contain: strict;` + `pixel-box`.
- Transitions: `transition-property: opacity; transition-duration: 0.3s; transition-timing-function: ease-in-out;`.
- `.window-enter-from`, `.window-leave-to` — `opacity: 0 !important; scale: 0.9;` для появления/уничтожения.

## Cleanup

При закрытии — `removeWindow(id)` (`utils/removeWindow.ts`): очищает `bounds`, `frame`, `loader`, `windows` stores в правильном порядке. Никогда не мутировать stores напрямую при закрытии.
