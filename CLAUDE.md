# CLAUDE.md — Dimonya OS portfolio

> Единственный файл контрактов проекта. `AGENTS.md` — симлинк сюда, править только этот файл.
> См. также [README.md](README.md), [docs/RULES.md](docs/RULES.md), [docs/refactor/index.md](docs/refactor/index.md).

## О проекте

**Dimonya OS** — портфолио-сайт в стиле десктопной ОС: окна, панель задач (`Taskbar`), рабочий стол (`Workbench`). Каждое окно представляет программу (`about`, `code`, `explorer`, `project`, `showcase`, `tproject`), открывается по пути в URL и отображает сущность из server-side контента. Деплой — self-host / VPS (`nitro.preset = "node-server"`, `bun run build && bun run preview`).

Primary язык документации/комментариев — русский (см. `~/.claude/CLAUDE.md`). Код, имена, команды, коммиты, PR — английский.

## Стек

| Слой | Технология |
| --- | --- |
| Framework | Nuxt 4 (`^4.3.1`), Vue (`^3.5.28`), vue-router (`^4.6.4`) |
| Язык | TypeScript (strict + `noUncheckedIndexedAccess`) |
| State | Pinia (`@pinia/nuxt 0.11.3`) |
| Стили | SCSS (sass `^1.97.3`) |
| Изображения | `@nuxt/image` 2.0 |
| Валидация | `zod` ^4 (server query parsing) |
| Утилиты | `html-to-image` (скриншоты окон → превью в taskbar) |
| Менеджер пакетов | **Bun только** (см. README.md) |
| Линтер | ESLint (`@nuxt/eslint 1.15.1`) + Biome 2.4.4 |
| Форматтер | Biome |
| Pre-commit | lefthook (biome + eslint + typecheck) |
| Unit tests | Vitest 4.1.4 + `@vue/test-utils` + jsdom |
| E2E | Playwright 1.59 |
| Хостинг | Self-host / VPS (nitro preset `node-server`) |

## Архитектурные слои

Каждый файл принадлежит ровно одному слою. Размер ≤ 150 LOC (исключения — whitelist в `eslint.config.mjs` + `docs/RULES.md`).

| Слой | Где | Назначение | Запрет |
|---|---|---|---|
| **View** | `app/components/**/*.vue` | Template + минимум script (props, refs, single composable call) | `$fetch`, `MutationObserver`, raw `setTimeout(>100ms)` |
| **Logic** | `app/composables/**`, `app/components/**/composables/**` | Vue reactivity, lifecycle, watch | DOM mutation, magic numbers |
| **State** | `app/stores/**` | Pinia: domain state + readonly accessors + actions | `MutationObserver`, dynamic imports, transient UI-state |
| **Service** | `app/services/**` | Pure функции ИЛИ thin DOM wrapper | module-scope mutable state (SSR leak) |
| **Data** | `server/api/**`, `app/services/filesystem/**` | Fetch + validation + cache | бизнес-логика |
| **Util** | `app/utils/**`, `server/utils/**`, `shared/utils/**` | Pure helpers | Vue/DOM/storage deps в `app/utils/` и `shared/utils/` |
| **Types** | `shared/types/**` | Type defs | runtime code |

**SSR-контракт `app/services/`** (импортируется и из браузера, и из SSR):

- Module-scope mutable state ЗАПРЕЩЁН (см. P1-09 incident). State — в Pinia или closures.
- DOM только под `if (import.meta.client)` либо из `onMounted`-ленивого пути.
- Fetch через `$fetch` (Nitro umbrella), не `window.fetch`.
- Изоляция от Vue/Pinia enforced ESLint `no-restricted-imports`: `app/services/**` может импортить только `app/utils/*`, `shared/utils/*`, `shared/types/*`. Reactivity — забота composable-обёртки. См. [app/services/README.md](app/services/README.md).

Границы: `app/services/` — stateful/DOM-aware; `app/utils/` — pure, тестируется без mount; `server/utils/` — h3 server-only, **никогда** не импортится из `app/`; `shared/utils/` — pure cross-runtime.

## Структура

```
app/
├── app.vue                       # Точка входа: viewport, окна, SEO
├── error.vue                     # Страница ошибки → создаёт окно из route
├── assets/
│   ├── fonts/                    # PixCyrillic.woff2 (единственный шрифт)
│   ├── icons/programs/           # SVG-иконки программ (импорт через ?raw)
│   ├── icons/socials/            # telegram/max/hh (?raw, fill="currentColor")
│   ├── scss/                     # globals/vars/functions/mixins/_breakpoints/...
│   └── svg/
├── components/
│   ├── AnimatedText.vue
│   ├── Background.vue            # Canvas grid фон
│   ├── FullscreenPreffered.vue, PreviewPreffered.vue
│   ├── Loader.vue                # Boot loader
│   ├── TaskbarTooltips.vue, TaskbarTooltipItem.vue
│   ├── Programs/                 # About/, Code/, Explorer/Nav/, Project/, Showcase/
│   ├── Shortcut/Base.vue         # Generic shortcut (variant: desktop|list|nav)
│   ├── Taskbar/                  # index.vue, AllPrograms.vue, Clock.vue, Socials.vue,
│   │                             # useTaskbarItems.ts, useScale.ts, Elements/Program/
│   ├── Window/                   # index.vue, View.vue, Content.vue, Loader.vue, types.ts
│   │   ├── composables/          # ~25 lifecycle hooks — см. «Архитектура окон»
│   │   ├── header/nav/, resize/, utils/
│   └── Workbench/                # index.vue, Shortcut/
├── composables/                  # global/ (useAppBootstrap, useClock, ...), window/, shared/
├── layouts/default.vue
├── plugins/                      # 00-pinia-early.ts, warn.client.ts
├── programs/                     # Реестр: about, code, explorer, project, showcase, tproject
├── services/                     # Pure/DOM-wrapper слой без Vue: clipboard, filesystem, ...
├── stores/                       # bounds, contentArea, entities, focus, frame, queuedRouter,
│                                 # windows, windowsUI
└── utils/                        # debounce, math, formatClock, getClickShortcutEvent,
                                  # useIsMobile, constants/

server/
├── api/filesystem/               # get.ts, list.ts, breadcrumbs.ts (с cache-control routeRules)
├── assets/entry/                 # Контент портфолио: about/, projects/{griboyedov, u24}/, ...
└── utils/                        # cacheLifetime, errors, manifest/ (scanTree), validation

shared/                           # Общие типы (filesystem: ProgramType, FsFile, ...)
docs/                             # refactor/index.md, backlog.md
tests/                            # Vitest unit + Playwright e2e
public/                           # Статика
```

> **Папки `app/pages/` НЕТ.** Роутинг — программный: `useAppBootstrap` читает `route.fullPath` → `useCreateAndRegisterWindow` создаёт окно. Не воспроизводить `pages/[...path].vue` из устаревших доков.

## SCSS-функции

В `nuxt.config.ts` глобально:

```ts
vite: {
    css: { preprocessorOptions: { scss: {
        additionalData: '@use "@/assets/scss/globals.scss" as *;',
    } } }
}
```

→ `c()`, `c-rgba()`, `@include t(...)`, `cw/ch/cwh` доступны в любом `<style lang="scss">` без явного импорта.

**Цветовая палитра** (`app/assets/scss/vars.scss`):

```scss
$colors: (
    'accent':           #db481d,
    'main':             #40b567,
    'default':          #151515,
    'default-1':        #181818,
    'default-2':        #1d1a1a,
    'default-3':        #2f2626,
    'default-contrast': #cecece,
);
```

`_settings.scss` генерирует `:root` CSS-переменные `--color-<name>` + `--color-<name>-rgb` (RGB-триплет для альфа-композиции). Темизация через `[data-theme]` без rebuild.

**Функции** (`functions.scss`):

```scss
c('accent')                 // → var(--color-accent)
c-rgba('default', 0.5)      // → rgb(var(--color-default-rgb) / 0.5)
```

Имена валидируются по `$colors` map в compile-time → typo даёт `@error`. SCSS-функция `rgba()` не принимает `var(...)`, поэтому для альфы используется `c-rgba()`.

**Миксины** (`mixins.scss`):

```scss
@include t($fs: 15px, $lh: 1, $cName: 'default', $fw: 400, $family: 'PixCyrillic');

// Container queries по @container window:
@include cw(sm) { ... }     // width окна < $breakpoints.sm
@include ch(sm) { ... }     // height
@include cwh(sm) { ... }    // width ИЛИ height
```

Брейкпоинты — `_breakpoints.scss` (`$breakpoints: sm/md/lg/xl`). Container `window` устанавливается на корне окна — `cw/ch/cwh` адаптируют контент под размер окна, а не viewport.

## Контент портфолио

Контент лежит в `server/assets/entry/`. Каждая поддиректория = сущность. Метаданные в `entity.json`:

```json
{
    "name": "Обо мне",
    "programType": "about"
}
```

`programType` ∈ `{ "about", "code", "explorer", "project", "showcase", "tproject" }` (источник истины — `app/programs/index.ts` REGISTRY и `shared/types/filesystem.ts`).

**Дерево контента** читается прямо с FS: `server/utils/manifest/scanTree.ts` рекурсивно обходит `entry/` при каждом запросе. Кеш держится на уровне endpoint'а (`defineCachedEventHandler` с `ENTITY_CACHE_MAX_AGE`: 60 dev / 3600 prod). Build-step и `manifest.json`/`file-manifest.json` убраны. Для self-host `scripts/copy-entry.ts` (postbuild) копирует `server/assets/entry` → `.output/server/assets/entry`.

Виртуальные ноды: `<entity>/images/*.png` поднимаются в children сущности как `<entity>/<file>` (`programType: showcase`), `<entity>/codes/<id>/` — как `<entity>/code/<id>` (`programType: code`, имя из `meta.json.windowTitle`). Сами папки `images/` и `codes/` в дереве не показываются.

API: `/api/filesystem/{list,get,breadcrumbs}` — кешированы через `routeRules` в `nuxt.config.ts` (`s-maxage=3600, stale-while-revalidate=60`).

## Команды

```bash
bun install                         # postinstall: nuxt prepare

bun run dev                         # nuxt dev
bun run build                       # nuxt build
bun run generate                    # SSG: nuxt generate
bun run preview                     # Превью production-сборки

bun run typecheck                   # nuxi typecheck (strict + noUncheckedIndexedAccess)
bun run lint                        # ESLint
bun run biome:check                 # Biome (lint + format)

bun run test:unit                   # Vitest (one-shot)
bun run test:unit:watch             # Vitest watch
bun run test:e2e                    # Playwright
```

## Соглашения

- **Bun only.** Никаких `npm`/`pnpm`/`yarn`. lefthook и `bun.lock` завязаны на Bun.
- **Pre-commit** через lefthook: biome + eslint + typecheck. Не использовать `--no-verify` без явного разрешения юзера.
- **TypeScript strict** + `noUncheckedIndexedAccess`: индексация `T[i]` / `Record[k]` возвращает `T | undefined` — обрабатывать явно (no `!`).
- **Vue SFC**: `<script setup lang="ts">`, явная типизация `ref<T | null>(null)`, `defineProps<{...}>()`, `defineEmits<{...}>()`.
- **Стили**: SCSS через `c()`, `c-rgba()`, `@include t(...)`, `cw/ch/cwh`. Не хардкодить hex/breakpoints — это сломает темизацию и container-aware layout.
- **Документация и комментарии**: русский (primary lang юзера). Код, идентификаторы, коммиты (Conventional Commits), PR — английский.
- **Добавление новой программы**:
  1. Создать `app/programs/<type>.ts` (export `ProgramView`).
  2. Зарегистрировать в `app/programs/index.ts` (`REGISTRY`).
  3. Расширить `ProgramType` в `shared/types/filesystem.ts`.
  4. Опционально: entity в `server/assets/entry/<...>/entity.json` с `programType: "<type>"`.
- **Без emoji** в коде, документации, коммитах, PR (см. `~/.claude/CLAUDE.md`).
- **Code rules** — см. [docs/RULES.md](docs/RULES.md). RULES.md = single source of truth (max 150 LOC/файл, code-splitting, separation of concerns); не дублировать содержимое в CLAUDE.md.

## Архитектура окон

**Единственная точка создания окна** — `useCreateAndRegisterWindow(targetPath)` (`app/components/Window/composables/`). Вызывается из:

- `app/composables/useAppBootstrap.ts` — boot по URL при инициализации.
- `app/error.vue` — fallback на ошибке роутинга.
- `app/components/Taskbar/Elements/Program/useTaskbarElement.ts` — клик по закреплённой иконке taskbar (нет открытых окон).
- `app/components/Workbench/Shortcut/index.vue` — клик по ярлыку на рабочем столе.
- `Window/composables/useCreateWindowByPath.ts` — навигация внутри уже открытого окна.

**Flow**: path → fetch entity (`/api/filesystem/get`) → resolve `programType` → `getProgram(type)` (programs/index.ts) → создать `WindowOb` → зарегистрировать в `useWindowsStore`.

**Pinia stores** (`app/stores/`):

- `windows` — главный реестр окон. Lookups: `byId`, `byPath` (first-wins при дублях), `byProgram`.
- `focus` — какое окно в фокусе.
- `bounds` — координаты и размеры (drag/resize, persisted layout).
- `contentArea` — viewport observer (зона, доступная окнам).
- `frame` — `requestAnimationFrame` loop (анимация window bounds).
- `queuedRouter` — отложенная навигация во время анимаций.
- `entities` — кеш загруженных entity (`/api/filesystem/get`).
- `windowsUI` — transient UI-состояние окон (вне доменного `windows`).

**Programs registry** (`app/programs/index.ts`): `REGISTRY: Partial<Record<ProgramType, ProgramView>>` со схемой `{ id, label, icon, component, config: { showBreadcrumbs, canNavigate } }`. API: `getProgram(type)`, `getAllPrograms()`, `hasProgram(type)`.

**Window composables** — группировка по назначению:

- **Создание/инжект**: `useCreateAndRegisterWindow`, `useCreateWindowByPath`, `useInjectWindow`, `useInjectWindowRoute`, `useWindow`.
- **Fetch контента**: `useFetchEntity`.
- **Drag/Resize**: `useResizeForDirections`, `useResizeForDirectionsEvent`, `useWindowBoundsAnimation/`.
- **Сворачивание**: `useCollapsed`, `useCollapseTrigger`, `useCollapseBoundsMemory`, `useCollapseOffscreenPosition`.
- **Fullscreen**: `useFullscreenOnMount`, `useWindowFullscreenAutoSet`, `useOnFullScreen`.
- **Focus**: `useFocusOnClick`, `useSetFocusState`, `useFrameObserverLifecycle`.
- **SEO / route / loading**: `useSeoWindow`, `useWindowRoute`, `useLoadingStateSync`, `useWindowLoading`.

`useWindow` (`Window/composables/useWindow.ts`) — единственный фасад на окно, вызывается один раз из `Window/index.vue`: группирует все per-window-эффекты, делает `provide('windowOb')` / `provide('windowRoute')`, возвращает `{ node, windowRoute, isLoading, focusWindow, unFocus }`.

**Тип окна** (`Window/types.ts`):

```typescript
type WindowState =
    | "fullscreen" | "fullscreen-ready" | "collapsed" | "drag"
    | "resize" | "loading" | "error" | "focused" | "preview";

type WindowOb = {
    id: string;
    states: Partial<Record<WindowState, true>>;
    targetFile: { value: string };  // путь
    file: FsFile | null;            // загруженная entity
};
```

**State API**: `setState(id, key, value)` / `clearState(id, key)` / `toggleState(id, key)`. При `value=true` несовместимые снимаются автоматически:

| key | конфликтует с |
| --- | --- |
| `fullscreen` | `collapsed`, `drag`, `resize` |
| `collapsed` | `fullscreen`, `drag`, `resize` |
| `drag` | `fullscreen`, `collapsed` |
| `resize` | `fullscreen`, `collapsed` |

Остальные (`loading`, `focused`, `error`, `preview`, `fullscreen-ready`) — независимые.

**Bounds**: `useBoundsStore` хранит per-id `{ target, calculated }`. `useWindowBoundsAnimation` крутит RAF-цикл (`controller.ts` + `easing.ts`), интерполирует `calculated → target` и пишет CSS-vars `--w-left/--w-top/--w-width/--w-height` (`CSS_VAR_KEYS` в `bounds.ts`). Cascade-cleanup при закрытии — `Window/utils/removeWindow.ts` (bounds + frame + loader + windows).

**Роутинг**: программный, без `[...path].vue`. `useQueuedRouterStore` — очередь `router.push` с дедупликацией (`lastPushedPath` + сравнение с хвостом очереди). `useWindowRoute` синхронизирует `windowOb.targetFile.value` ↔ URL: при focus URL = path окна; при ручной навигации обновляется `targetFile`.

**Taskbar**: единый список закреплённых и запущенных программ — `useTaskbarItems.ts` (`PINNED` массив = порядок иконок слева; закреплённая с открытым окном не удваивается). Индикатор «запущено» — полоска без скруглений (`_settings.scss`). Превью окон — `useWindowPreview` + `frameStore` (MutationObserver → html-to-image). Трей справа — `Socials.vue` + `Clock.vue`.

**Shortcut**: `Shortcut/Base.vue` — generic ярлык, адаптеры передают `:file`, `:variant ('desktop' | 'list' | 'nav')`, `:on-activate` и (опц.) slot `icon`; метаданные берёт `useGetShortcut(file)` из `programs/`. Адаптеры: `Workbench/Shortcut/index.vue`, `Programs/Explorer/shortcut.vue`, `Programs/Explorer/Nav/shortcut.vue`.

## API сервера

| Метод | Путь | Описание |
| --- | --- | --- |
| GET | `/api/filesystem/list` | Список детей по `query.path` |
| GET | `/api/filesystem/get` | Entity по `query.path` (cached) |
| GET | `/api/filesystem/breadcrumbs` | Хлебные крошки для `query.path` |

Все эндпоинты: валидация query через `parsePathQuery` (`server/utils/validation.ts` — zod: ≥1 char, начинается с `/`, отвергает `..`, `\`, `//`, null-byte, ≤1024); данные через `scanTree()` (`server/utils/manifest/scanTree.ts`, прямой `fs.readdir` от `process.cwd() + "server/assets/entry"`); endpoint-кеш через `defineCachedEventHandler` (`maxAge` = `ENTITY_CACHE_MAX_AGE`: 60 dev / 3600 prod); ошибки только через `notFound()` / `badRequest()` / `serverError(err)` (`server/utils/errors.ts`).

Сброс кэша в dev: `rm -rf .nitro/cache`. `Cache-Control` для self-host прокси — `nuxt.config.ts → routeRules`.

## Чек-листы расширения

**Новая программа**: иконка в `app/assets/icons/programs/<name>.svg` → `app/programs/<name>.ts` (export `ProgramView`) → `<name>` в union `ProgramType` (`shared/types/filesystem.ts`) → ключ в `REGISTRY` (`app/programs/index.ts`) → (опц.) `app/components/Programs/<Name>/index.vue` → (опц.) `server/assets/entry/<name>/entity.json` → `bun run typecheck`.

**Новый API-эндпоинт**: `server/api/filesystem/<name>.ts` с `defineEventHandler` → `parsePathQuery(getQuery(event))` → `scanTree()` + `findNode`/`resolveEntity` → ошибки из `server/utils/errors.ts` → (опц.) `defineCachedEventHandler` + `routeRules` → `bun run typecheck` + curl.

**Новый shortcut**: `<location>/shortcut.vue` над `Shortcut/Base.vue` с `:file`, `:variant`, `:on-activate`; (опц.) slot `icon`. Программа ярлыка должна быть в `app/programs/` — оттуда `useGetShortcut` берёт иконку и label.

## Правила разработки

1. **Цвета** — только `c()` / `c-rgba()`, никакого hex/rgb в компонентах (иначе ломается theme switch).
2. **Типографика** — только `@include t()`.
3. **Дерево контента** — только через FS (`server/assets/entry/`), никаких сгенерированных манифестов.
4. **Контент** — в `server/assets/entry/`, не в `public/`.
5. **Bounds окон** — только через `useBoundsStore`; CSS-vars пишет `useWindowBoundsAnimation`.
6. **Window states** — только `setState`/`clearState`/`toggleState`; прямая мутация `windowOb.states[key]` теряет conflict-resolution.
7. **Роутинг** — через `useQueuedRouterStore`, не напрямую `router.push`.
8. **Window-эффекты** — внутрь фасада `useWindow.ts`, не в `Window/index.vue`.
9. **Server query** — валидация обязательна (`parsePathQuery` или явная zod-схема).

## Соглашение имён

- Модули верхнего уровня `app/components/` — `PascalCase/`; подсекции внутри модуля (`resize/`, `header/`, `composables/`, `utils/`) — `lowercase/`; подкомпоненты с UI — `PascalCase/`.
- Composables — `useXxx.ts` (глобальные → `app/composables/`, локальные → рядом с компонентом).
- Stores — `app/stores/<name>.ts`, `defineStore("<name>", () => ...)`, export `useXxxStore`.
- Programs — `app/programs/<name>.ts` (lowercase, совпадает с `ProgramType`).
- Утилиты и константы — `xxxYyy.ts` (camelCase, без `use`-префикса); имя файла констант — не SCREAMING_SNAKE.
- Типы — `xxx.ts` с `export type`; `.d.ts` только для ambient-деклараций.
- Компоненты — `PascalCase.vue` либо `index.vue` для корня папки.
