# AGENTS.md

## Проект

Портфолио-сайт в стиле десктопной ОС (Windows-подобный интерфейс). Название — **Dimonya OS**. Реализован на Nuxt 4 с TypeScript, SCSS, Pinia. Развёртывается на Vercel.

## Архитектурные слои

> Введён в Phase 8 (см. [docs/refactor/REFACTOR-PLAN.md](docs/refactor/REFACTOR-PLAN.md), [docs/RULES.md](docs/RULES.md)).

Каждый файл принадлежит ровно одному слою. Размер ≤ 150 LOC (исключения — whitelist в `eslint.config.mjs` + `docs/RULES.md`).

| Слой | Где | Назначение | Запрет |
|---|---|---|---|
| **View** | `app/components/**/*.vue` | Template + минимум script (props, refs, single composable call) | `$fetch`, `MutationObserver`, raw `setTimeout(>100ms)` |
| **Logic** | `app/composables/**`, `app/components/**/composables/**` | Vue reactivity, lifecycle, watch | DOM mutation, magic numbers |
| **State** | `app/stores/**` | Pinia: domain state + readonly accessors + actions | `MutationObserver`, dynamic imports, transient UI-state |
| **Service** | `app/services/**` (создаётся в P8-02) | Pure функции ИЛИ thin DOM wrapper | module-scope mutable state (SSR leak) |
| **Data** | `server/api/**`, `app/services/filesystem/**` | Fetch + validation + cache | бизнес-логика |
| **Util** | `app/utils/**`, `server/utils/**`, `shared/utils/**` | Pure helpers | Vue/DOM/storage deps в `app/utils/` и `shared/utils/` |
| **Types** | `shared/types/**` | Type defs | runtime code |

### SSR-контракт `app/services/`

`app/services/` импортируется из браузера И из SSR-кода. Правила:

- **Module-scope mutable state ЗАПРЕЩЁН** (см. P1-09 incident). State в Pinia OR closures.
- **DOM-доступ только под guard** `if (import.meta.client)` или из `onMounted`-ленивого пути.
- **Fetch via `$fetch`** (Nitro umbrella), не `window.fetch`.

### Boundary `app/services/` vs `app/utils/` vs `server/utils/`

- `app/services/` — stateful или DOM-aware логика. Импортится из composables/SFC.
- `app/utils/` — pure, no Vue/DOM/storage. Тестируется без mount.
- `server/utils/` — h3 server-only. **Никогда** не импортится из `app/`.
- `shared/utils/` — pure cross-runtime (нужно и в app, и в server).

### Импорты `app/services/` (P8-02)

`app/services/**` изолирован от Vue/Pinia слоёв — enforced ESLint
`no-restricted-imports` в `eslint.config.mjs`.

- **Допустимо**: `app/services/foo.ts` → `app/utils/bar.ts`, `shared/utils/*`, `shared/types/*`.
- **Запрещено**: `app/services/foo.ts` → `app/composables/x.ts`, `app/stores/y.ts`, `app/components/Z.vue`.

Reactivity и lifecycle — забота composable-обёртки над services. См.
[app/services/README.md](app/services/README.md).

## Стек

| Слой             | Технология                                             |
| ---------------- | ------------------------------------------------------ |
| Фреймворк        | Nuxt 4 (`nuxt ^4.3.1`, `vue ^3.5.28`)                  |
| Язык             | TypeScript                                             |
| Стили            | SCSS (глобальные функции/миксины через `globals.scss`) |
| Состояние        | Pinia (stores в `app/stores/`)                         |
| Менеджер пакетов | Bun                                                    |
| Линтинг          | ESLint (`@nuxt/eslint`), Biome                         |
| Форматтер        | Biome                                                  |
| Хостинг          | Vercel (preset `vercel` в `nitro`)                     |
| Изображения      | `@nuxt/image`                                          |
| Утилиты          | `html-to-image` (скриншоты окон для превью в taskbar)  |
| Валидация        | `zod` (server-side query parsing)                      |

## Команды

```bash
bun install                # Установка зависимостей
bun run dev                # Dev-сервер (автогенерация манифестов + nuxt dev)
bun run build              # Production-сборка (автогенерация манифестов + nuxt build)
bun run generate           # Static generation
bun run generate:manifest  # Генерация manifest.json из server/assets/entry/
bun run generate:file-manifest  # Генерация file-manifest.json
bun run generate:manifests # Оба манифеста сразу
bun run preview            # Превью production-сборки
bun run typecheck          # nuxi typecheck
bun run lint               # ESLint
bun run biome:check        # Biome
```

## Структура проекта

```
app/
├── app.vue                       # Точка входа: viewport, окна, SEO bootstrap
├── error.vue                     # Страница ошибки
├── assets/
│   ├── fonts/                    # PixCyrillic.woff2 (единственный шрифт)
│   ├── icons/programs/           # SVG-иконки программ (импорт через ?raw)
│   │   ├── about.svg
│   │   ├── explorer.svg
│   │   ├── project.svg
│   │   └── tproject.svg
│   └── scss/
│       ├── globals.scss          # @forward vars, functions, mixins, breakpoints
│       ├── vars.scss             # $colors map (HEX + RGB triplets)
│       ├── functions.scss        # c(name) → var(--color-name); c-rgba(name, α)
│       ├── mixins.scss           # @include t() — типографика; cw/ch/cwh — container queries
│       ├── _breakpoints.scss     # $breakpoints: sm/md/lg/xl
│       ├── main.scss             # reset + fonts + settings
│       ├── reset.scss
│       ├── fonts.scss
│       └── _settings.scss        # :root CSS-vars (--color-*, --color-*-rgb), body
├── components/
│   ├── AnimatedText.vue
│   ├── Background.vue            # Canvas grid фон
│   ├── FullscreenPreffered.vue
│   ├── PreviewPreffered.vue
│   ├── Loader.vue                # Boot loader (пиксельный спиннер + звук)
│   ├── TaskbarTooltipItem.vue
│   ├── TaskbarTooltips.vue
│   ├── Shortcut/
│   │   └── Base.vue              # Generic shortcut (variant: desktop|list|nav)
│   ├── Programs/
│   │   ├── About/index.vue       # Программа «О себе»
│   │   └── Explorer/             # Программа «Проводник»
│   │       ├── index.vue
│   │       ├── shortcut.vue      # Адаптер над Shortcut/Base
│   │       └── Nav/
│   │           ├── index.vue
│   │           ├── shortcut.vue
│   │           ├── Facts.vue
│   │           └── facts-data.ts
│   ├── Taskbar/
│   │   ├── index.vue
│   │   ├── AllPrograms.vue
│   │   ├── useIsCurrentRoute.ts
│   │   ├── useScale.ts
│   │   └── Elements/
│   │       ├── About.vue
│   │       └── Program/
│   │           ├── index.vue
│   │           ├── Frame.vue
│   │           ├── AllFrames.vue
│   │           ├── FrameCloseButton.vue
│   │           ├── Tooltip.vue
│   │           ├── TooltipEl.vue
│   │           ├── useTaskbarFramePosition.ts
│   │           ├── useTooltipContainer.ts
│   │           └── useWindowPreview.ts   # html-to-image превью
│   ├── Window/
│   │   ├── index.vue                 # Корневой компонент окна (вызывает useWindow)
│   │   ├── View.vue                  # TransitionGroup всех окон
│   │   ├── Content.vue               # Рендер ProgramView.component по programType
│   │   ├── Loader.vue
│   │   ├── types.ts                  # WindowOb, WindowState, WindowStates
│   │   ├── _nav.scss
│   │   ├── composables/              # P8-12: сгруппированы по назначению
│   │   │   ├── useWindow.ts          # Фасад: вызывается из Window/index.vue
│   │   │   ├── lifecycle/            # create/inject/observers
│   │   │   │   ├── useCreateAndRegisterWindow.ts, useCreateWindowByPath.ts
│   │   │   │   ├── useInjectWindow.ts, useInjectWindowRoute.ts
│   │   │   │   ├── useFrameObserverLifecycle.ts, useWindowPreviewObserver.ts
│   │   │   ├── fetch/                # entity loading
│   │   │   │   ├── useFetchEntity.ts, useLoadingStateSync.ts
│   │   │   ├── focus/                # focus/blur
│   │   │   │   ├── useFocusOnClick.ts, useSetFocusState.ts
│   │   │   ├── fullscreen/           # fullscreen mode
│   │   │   │   ├── useFullscreenOnMount.ts, useOnFullScreen.ts
│   │   │   │   ├── useWindowFullscreenAutoSet.ts
│   │   │   ├── collapse/             # сворачивание + memory
│   │   │   │   ├── useCollapsed.ts, useCollapseTrigger.ts
│   │   │   │   ├── useCollapseBoundsMemory.ts, useCollapseOffscreenPosition.ts
│   │   │   ├── resize/               # drag-resize hooks
│   │   │   │   ├── useResizeForDirections.ts, useResizeForDirectionsEvent.ts
│   │   │   ├── route/                # window ↔ URL
│   │   │   │   ├── useWindowRoute.ts, useWindowLoading.ts
│   │   │   ├── seo/
│   │   │   │   └── useSeoWindow.ts
│   │   │   ├── program/
│   │   │   │   └── useProgramSetup.ts
│   │   │   └── anim/useWindowBoundsAnimation/
│   │   │       ├── index.ts          # Public composable (RAF + CSS-vars)
│   │   │       ├── controller.ts     # Animation step / lerp
│   │   │       └── easing.ts
│   │   ├── header/
│   │   │   ├── index.vue
│   │   │   ├── name.vue
│   │   │   ├── breadcrumbs.vue
│   │   │   ├── nav/
│   │   │   └── useMove.ts            # Drag handler
│   │   ├── resize/                   # 9 хендлов + контейнер
│   │   │   ├── index.vue, All.vue
│   │   │   ├── Top.vue, Bottom.vue, Left.vue, Right.vue
│   │   │   └── LeftTop.vue, RightTop.vue, LeftBottom.vue, RightBottom.vue
│   │   └── utils/
│   │       ├── clampers.ts, debounce.ts, useGetId.ts
│   │       ├── removeWindow.ts       # Cascade-cleanup orchestrator
│   │       ├── setCalculatedBounds.ts, setTargetBounds.ts, syncBounds.ts
│   │       ├── setPath.ts, setSize.ts
│   │       ├── updateBoundsProp.ts, updateWindowBounds.ts, updateWindowWidth.ts
│   └── Workbench/
│       ├── index.vue                 # Рабочий стол (grid ярлыков)
│       └── Shortcut/index.vue        # Адаптер над Shortcut/Base
├── composables/                      # P8-13: разделение global/window/shared
│   ├── index.ts                      # barrel re-export
│   ├── global/                       # cross-app singletons (init at app mount)
│   │   ├── useAppBootstrap.ts        # Init top-level effects (viewport, taskbar)
│   │   ├── useViewportObserver.ts
│   │   └── useWindowTitle.ts
│   ├── window/                       # per-window OR per-component helpers
│   │   ├── useBatchedRef.ts          # queueMicrotask-batched ref
│   │   ├── useGridCells.ts
│   │   ├── useProgramFetch.ts        # SSR-aware fetch для program SFCs
│   │   ├── useResizeObserver.ts
│   │   ├── useSeoUnfocus.ts
│   │   ├── useSetChainedWatchers.ts  # Условные watchers (active by predicate)
│   │   └── useTooltipState.ts        # Taskbar tooltip show/hide state
│   └── shared/                       # used by both global+window
│       └── useGetShortcut.ts         # Метаданные ярлыка по FsFile
├── programs/                         # Data-driven program registry
│   ├── index.ts                      # REGISTRY + getProgram/getAllPrograms/hasProgram
│   ├── about.ts
│   ├── explorer.ts
│   ├── project.ts
│   └── tproject.ts
├── stores/                           # Pinia stores
│   ├── windows.ts                    # WindowOb CRUD + setState/clearState/toggleState
│   ├── focus.ts                      # focusedId + isFocused(id)
│   ├── bounds.ts                     # target/calculated bounds slot per id + CSS_VAR_KEYS
│   ├── frame.ts                      # MutationObserver per id (preview triggers)
│   ├── contentArea.ts                # viewport - taskbar = area
│   └── queuedRouter.ts               # router.push очередь + дедупликация
├── layouts/
│   └── default.vue
├── plugins/
│   └── warn.client.ts
└── utils/
    ├── getClickShortcutEvent.ts      # double-click на десктопе / single на мобилке
    ├── math.ts
    ├── useIsMobile.ts
    └── constants/
        ├── offset.ts                 # OFFSET = 15
        └── socials.ts                # SOCIALS = SocialLink[]

server/
├── api/
│   └── filesystem/
│       ├── list.ts                   # GET /api/filesystem/list?path=...
│       ├── get.ts                    # GET /api/filesystem/get?path=...
│       └── breadcrumbs.ts            # GET /api/filesystem/breadcrumbs?path=...
├── assets/
│   ├── manifest.json                 # Авто (tree + flatIndex)
│   ├── file-manifest.json            # Авто (file types)
│   └── entry/                        # Контент портфолио
│       ├── entity.json
│       ├── about/...
│       └── projects/...
└── utils/
    ├── manifest.ts                   # loadManifest + findNode + resolveEntity (объединил 4 утилиты)
    ├── validation.ts                 # zod pathSchema + parsePathQuery
    ├── errors.ts                     # notFound, badRequest, serverError
    └── cacheLifetime.ts              # MANIFEST_CACHE_MAX_AGE (60 dev / 3600 prod)

shared/
├── types/
│   └── filesystem.ts                 # ProgramType, Entity, FsFile, Manifest, ManifestEntry, ManifestNode, SocialLink
└── utils/
    └── logger.ts                     # console-обёртка

scripts/
├── generate-manifest.ts              # Обходит server/assets/entry/ → manifest.json
└── generate-file-manifest.ts         # → file-manifest.json

public/
├── favicon.svg
├── robots.txt
├── loading-end.mp3
└── imgs/
```

## Архитектура

### Виртуальная файловая система

Контент портфолио хранится как виртуальная FS в `server/assets/entry/`. Каждая папка содержит `entity.json`:

```json
{
    "name": "Отображаемое имя",
    "programType": "explorer",
    "hidden": false
}
```

Скрипты `generate-manifest.ts` / `generate-file-manifest.ts` обходят дерево и пишут:

- `server/assets/manifest.json` — `{ tree: ManifestNode[], flatIndex: Record<path, ManifestEntry> }`.
- `server/assets/file-manifest.json` — расширенный manifest с типами файлов (для будущего полнотекстового поиска).

В dev `nuxt.config.ts` смотрит `server/assets/entry/` и регенерирует манифесты автоматически.

### Оконный менеджер

Каждое окно — `WindowOb` (`app/components/Window/types.ts`):

```typescript
type WindowState =
    | "fullscreen"
    | "fullscreen-ready"
    | "collapsed"
    | "drag"
    | "resize"
    | "loading"
    | "error"
    | "focused"
    | "preview";

type WindowOb = {
    id: string;
    states: Partial<Record<WindowState, true>>;
    targetFile: { value: string };  // путь
    file: FsFile | null;            // загруженная entity
};
```

#### Lifecycle окна

```
open(path)
   │
   ▼
useWindowsStore.create(path)
   │
   ▼
<Window :windowOb=...> mounts
   │
   ├─► useWindow(windowOb)
   │      ├── routing: useWindowRoute
   │      ├── entity:  await useFetchEntity
   │      ├── focus:   useSetFocusState + useFocusOnClick
   │      ├── bounds:  useWindowBoundsAnimation (RAF + CSS vars)
   │      ├── states:  fullscreen-on-mount + useWindowFullscreenAutoSet + loading watch
   │      ├── seo:     useSeoWindow
   │      └── preview: frameStore.createObserver (MutationObserver → html-to-image)
   │
   ▼
provide('windowOb', windowOb) → <Content /> → <ProgramComponent />
```

`useWindow` (`app/components/Window/composables/useWindow.ts`) — единственный фасад на окно, вызывается один раз из `Window/index.vue`. Группирует все per-window-эффекты, делает `provide('windowOb')` и `provide('windowRoute')`, возвращает `{ node, windowRoute, isLoading, focusWindow, unFocus }`.

#### State API (`useWindowsStore`)

```typescript
windowsStore.setState(id, key, value);   // value=true автоматически снимает несовместимые
windowsStore.clearState(id, key);
windowsStore.toggleState(id, key);
```

Таблица несовместимости (set true → снимаются автоматически):

| key          | конфликтует с                          |
| ------------ | -------------------------------------- |
| `fullscreen` | `collapsed`, `drag`, `resize`          |
| `collapsed`  | `fullscreen`, `drag`, `resize`         |
| `drag`       | `fullscreen`, `collapsed`              |
| `resize`     | `fullscreen`, `collapsed`              |

Прочие states (`loading`, `focused`, `error`, `preview`, `fullscreen-ready`) — независимые.

#### Bounds-система

- `useBoundsStore` хранит per-id slot `{ target: WindowBounds, calculated: WindowBounds }` (`bounds.ts`).
- `target` — желаемые координаты, `calculated` — текущие анимированные.
- `useWindowBoundsAnimation` (`useWindowBoundsAnimation/index.ts`) запускает RAF-цикл (`controller.ts` + `easing.ts`), интерполирует calculated → target и пишет CSS-vars `--w-left`, `--w-top`, `--w-width`, `--w-height` (см. `CSS_VAR_KEYS` в `bounds.ts`).
- Cascade cleanup при удалении окна — `app/components/Window/utils/removeWindow.ts` (orchestrator: bounds + frame + loader + windows store).

### Роутинг

- Программный роутинг: нет `[...path].vue`.
- `useQueuedRouterStore` (Pinia) — очередь `router.push` с дедупликацией (двойной защитой: `lastPushedPath` + сравнение с хвостом очереди).
- `useWindowRoute` синхронизирует `windowOb.targetFile.value` ↔ URL: при focus URL = path окна; при ручной навигации обновляется `targetFile`.

### Программы (data-driven)

Реестр в `app/programs/`. Каждая программа — отдельный файл `<name>.ts`:

```typescript
// app/programs/explorer.ts
import icon from "@/assets/icons/programs/explorer.svg?raw";
import type { ProgramView } from "./index";

const program: ProgramView = {
    id: "explorer",
    label: "Проводник",
    icon,                                 // SVG как строка (Vite ?raw)
    config: { showBreadcrumbs: true, canNavigate: true },
    component: defineAsyncComponent(
        () => import("@/components/Programs/Explorer/index.vue"),
    ),
};
export default program;
```

Aggregator `app/programs/index.ts`:

```typescript
getProgram(type: ProgramType): ProgramView | null
getAllPrograms(): Record<ProgramType, ProgramView>
hasProgram(type: ProgramType): boolean
```

`ProgramType = 'explorer' | 'project' | 'tproject' | 'about'` определён в `shared/types/filesystem.ts`.

### Shortcut

`app/components/Shortcut/Base.vue` — generic ярлык. Адаптеры передают `:file`, `:variant ('desktop' | 'list' | 'nav')`, `:on-activate` и (опц.) slot `icon`. Используют `useGetShortcut(file)` для иконки/имени из `programs/`.

Существующие адаптеры:
- `app/components/Workbench/Shortcut/index.vue` — desktop-вариант.
- `app/components/Programs/Explorer/shortcut.vue` — list-вариант.
- `app/components/Programs/Explorer/Nav/shortcut.vue` — nav-вариант.

### Taskbar

- Нижняя панель: кнопка «О себе» + список программ (`AllPrograms.vue`).
- Группировка окон по `programType` через `windowsStore.byProgram(type)`.
- Превью окон: `useWindowPreview` + `frameStore` (MutationObserver → html-to-image).
- Тултипы: `useTaskbarTooltips` (`app/composables/`).

## SCSS

### Глобальные функции

Доступны везде через `additionalData`:

```scss
c('color-name')                          // → var(--color-color-name)
c-rgba('color-name', 0.5)                // → rgb(var(--color-color-name-rgb) / 0.5)
@include t($fs, $lh, $cName, $fw, $family)
@include cw('md') / ch('md') / cwh('md') // container-query breakpoints
```

`c()` валидирует имя по `$colors` map в compile-time (typo → `@error`) и возвращает CSS custom property — это даёт runtime theme switch через `[data-theme]` без rebuild.

### Цветовая палитра (`vars.scss`)

`$colors` — map имя → HEX. Каждое имя экспонируется как `--color-<name>` (HEX) и `--color-<name>-rgb` (R, G, B triplet, для `c-rgba`). Объявления — в `_settings.scss` под `:root`.

### Breakpoints (`_breakpoints.scss`)

```scss
$breakpoints: ('sm': 600px, 'md': 768px, 'lg': 1024px, 'xl': 1280px);
```

Используются миксинами `cw/ch/cwh` поверх container-queries (`container-type: inline-size; container-name: window`).

### Шрифты

`PixCyrillic` — единственный шрифт проекта. Используется везде: body, заголовки, breadcrumbs, ярлыки, badges, loader. Подключается через `$t-default` (значение `'PixCyrillic', system-ui, sans-serif`) или как default `$family` в `t()` миксине.

## API сервера

| Метод | Путь                          | Описание                                         |
| ----- | ----------------------------- | ------------------------------------------------ |
| GET   | `/api/filesystem/list`        | Список детей по `query.path`                     |
| GET   | `/api/filesystem/get`         | Entity по `query.path` (cached)                  |
| GET   | `/api/filesystem/breadcrumbs` | Хлебные крошки для `query.path`                  |

Все endpoints:
- Валидируют query через `parsePathQuery` (`server/utils/validation.ts`) — zod-схема: ≥ 1 char, начинается с `/`, отвергает `..`, `\`, `//`, null-byte, длина ≤ 1024.
- Используют единый `loadManifest()` из `server/utils/manifest.ts` (`defineCachedFunction`, `maxAge` = `MANIFEST_CACHE_MAX_AGE` из `cacheLifetime.ts`: 60 dev / 3600 prod).
- Бросают ошибки через `server/utils/errors.ts`: `notFound()`, `badRequest()`, `serverError(err)`.

Инвалидация кэша вручную в dev: `rm -rf .nitro/cache`. Response `Cache-Control` для Vercel Edge — в `nuxt.config.ts → routeRules`.

## Чек-листы расширения

### Новая программа

1. `app/assets/icons/programs/<name>.svg` — иконка.
2. `app/programs/<name>.ts` — экспорт `ProgramView` (id, label, icon, config, component).
3. `shared/types/filesystem.ts` — добавить `<name>` в union `ProgramType`.
4. `app/programs/index.ts` — импорт + ключ в `REGISTRY`.
5. (опц.) `app/components/Programs/<Name>/index.vue` — UI; иначе переиспользовать существующий через `component`.
6. (опц.) `server/assets/entry/<name>/entity.json` — корневая entity если программа имеет filesystem-точку входа.
7. `bun run generate:manifests` — регенерация манифестов.
8. Sanity: `bun run typecheck`.

### Новый API-эндпоинт

1. `server/api/filesystem/<name>.ts` — `defineEventHandler(async (event) => { ... })`.
2. Query: `parsePathQuery(getQuery(event))` (или собственная zod-схема рядом в `server/utils/validation.ts`).
3. Данные: `await loadManifest()` + `findNode` / `resolveEntity` из `server/utils/manifest.ts`.
4. Ошибки: `throw notFound()` / `badRequest()` / `serverError(err)` из `server/utils/errors.ts`.
5. Кэш: `defineCachedFunction(handler, { name, maxAge: MANIFEST_CACHE_MAX_AGE, getKey })` если результат стабильный.
6. `nuxt.config.ts → routeRules` — `Cache-Control` для Vercel Edge при необходимости.
7. Sanity: `bun run typecheck` + ручной curl.

### Новый shortcut

1. Создать `<location>/shortcut.vue` (или `index.vue` в папке-адаптере).
2. Импорт `Shortcut/Base.vue`, передать `:file: FsFile`, `:variant: 'desktop' | 'list' | 'nav'`, `:on-activate: () => void`.
3. (опц.) Slot `icon` — для override SVG.
4. Если программа ярлыка — новая, она должна быть зарегистрирована в `app/programs/` (см. чек-лист «Новая программа») — `useGetShortcut(file)` берёт иконку/label оттуда.

## Правила разработки

1. **Цвета — только через `c()` / `c-rgba()`**. Никакого hex/rgb в компонентах. `c()` возвращает CSS-var, не статический цвет — это требование для theme switch.
2. **Типографика — через `@include t()`**.
3. **`manifest.json` / `file-manifest.json` — не редактировать вручную**, только `bun run generate:manifests`.
4. **Контент** добавлять в `server/assets/entry/` (assets теперь серверные, не в `public/`).
5. **Новая программа** — следовать чек-листу. `ProgramType` (union) обязан совпадать с ключом в `REGISTRY`.
6. **Bounds окон** — только через `useBoundsStore` (Pinia). Не писать CSS-vars напрямую — `useWindowBoundsAnimation` сам их синхронизирует.
7. **Window states** — только через `windowsStore.setState/clearState/toggleState`. Не мутировать `windowOb.states[key]` напрямую — теряется автоматический conflict-resolution.
8. **Роутинг** — через `useQueuedRouterStore` (store), не напрямую `router.push`.
9. **Window-эффекты** — добавлять внутрь `useWindow.ts` фасада, не в `Window/index.vue`. Один окно = один вызов `useWindow`.
10. **Server query валидация** — обязательно через `parsePathQuery` или явную zod-схему.
11. **Server errors** — только helper'ы из `server/utils/errors.ts`.
12. **Форматирование** — Biome. **Пакеты** — Bun.

## Соглашение имён и структура файлов

### Директории

- **Модули** (верхний уровень `app/components/`) — `PascalCase/`: `Taskbar/`, `Window/`, `Programs/`, `Workbench/`, `Shortcut/`.
- **Подсекции внутри модуля** — `lowercase/`: `resize/`, `header/`, `composables/`, `utils/`.
- **Подкомпоненты с UI** — `PascalCase/`: `Nav/`, `Elements/`, `Program/`, `About/`, `Explorer/`.
- **Stores** — `app/stores/<name>.ts` (camelCase, без `use`-префикса в имени файла; export — `useXxxStore`).
- **Programs** — `app/programs/<name>.ts` (lowercase, совпадает с `ProgramType`).

### Файлы

- **Composables** — `useXxx.ts`. Глобальные → `app/composables/`. Локальные → рядом с компонентом (например, `Window/composables/`).
- **Stores** — `defineStore("<name>", () => ...)`. Файл `<name>.ts`. Export `useXxxStore`.
- **Утилиты** — `xxxYyy.ts` (camelCase), без `use`-префикса.
- **Константы** — `xxxYyy.ts`, `export const FOO = ...`. Имя файла — НЕ SCREAMING_SNAKE.
- **Типы** — `xxx.ts` с `export type`. `.d.ts` — только для ambient-деклараций сторонних модулей.
- **Vue-компоненты** — `PascalCase.vue` или `index.vue` для корневого компонента папки.
