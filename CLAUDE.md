# CLAUDE.md — Dimonya OS portfolio

> **Canonical detail → [AGENTS.md](AGENTS.md)** (полная архитектура окон, lifecycle composables, чек-листы расширения, debug-логирование).
> Этот файл — компактная точка входа для будущих сессий Claude Code.
> См. также [README.md](README.md) и [docs/refactor/index.md](docs/refactor/index.md).

## О проекте

**Dimonya OS** — портфолио-сайт в стиле десктопной ОС: окна, панель задач (`Taskbar`), рабочий стол (`Workbench`). Каждое окно представляет программу (`about`, `explorer`, `project`, `tproject`), открывается по пути в URL и отображает сущность из server-side контента. Деплой — Vercel (`nitro.preset = "vercel"`).

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
| Хостинг | Vercel (nitro preset `vercel`) |

## Структура

```
app/
├── app.vue                       # Точка входа: viewport, окна, SEO
├── error.vue                     # Страница ошибки → создаёт окно из route
├── assets/
│   ├── fonts/                    # PixCyrillic.woff2 (единственный шрифт)
│   ├── icons/programs/           # SVG-иконки программ (импорт через ?raw)
│   ├── scss/                     # globals/vars/functions/mixins/_breakpoints/...
│   └── svg/
├── components/
│   ├── AnimatedText.vue
│   ├── Background.vue            # Canvas grid фон
│   ├── FullscreenPreffered.vue, PreviewPreffered.vue
│   ├── Loader.vue                # Boot loader
│   ├── TaskbarTooltips.vue, TaskbarTooltipItem.vue
│   ├── Programs/                 # About/, Explorer/Nav/
│   ├── Shortcut/Base.vue         # Generic shortcut (variant: desktop|list|nav)
│   ├── Taskbar/                  # index.vue, AllPrograms.vue, useScale.ts, Elements/Program/
│   ├── Window/                   # index.vue, View.vue, Content.vue, Loader.vue, types.ts
│   │   ├── composables/          # ~25 lifecycle hooks — см. «Архитектура окон»
│   │   ├── header/nav/, resize/, utils/
│   └── Workbench/                # index.vue, Shortcut/
├── composables/                  # useAppBootstrap, useViewportObserver, useWindowTitle, ...
├── layouts/default.vue
├── plugins/                      # 00-pinia-early.ts, warn.client.ts
├── programs/                     # Реестр: about, explorer, project, tproject + index.ts
├── stores/                       # bounds, contentArea, focus, frame, queuedRouter, windows
└── utils/                        # debounce, math, getClickShortcutEvent, useIsMobile, constants/

server/
├── api/filesystem/               # get.ts, list.ts, breadcrumbs.ts (с cache-control routeRules)
├── assets/
│   ├── manifest.json             # auto: дерево entry/ + метаданные
│   ├── file-manifest.json        # auto: индекс файлов
│   └── entry/                    # Контент портфолио: about/, projects/{griboyedov, u24}/, ...
└── utils/                        # cacheLifetime, errors, manifest, validation

scripts/
├── generate-manifest.ts          # → server/assets/manifest.json
└── generate-file-manifest.ts     # → server/assets/file-manifest.json

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

`programType` ∈ `{ "about", "explorer", "project", "tproject" }` (источник истины — `app/programs/index.ts` REGISTRY и `shared/types/filesystem.ts`).

**Манифесты** (auto-generated, не править руками):

- `server/assets/manifest.json` — дерево entry с метаданными.
- `server/assets/file-manifest.json` — индекс файлов.

Генерация: `bun run generate:manifests` — вызывается автоматически из `dev`/`build`/`generate`. Hot-reload реализован через `builder:watch` hook в `nuxt.config.ts`: изменение любого файла под `server/assets/entry/` → перегенерация манифестов.

API: `/api/filesystem/{list,get,breadcrumbs}` — кешированы через `routeRules` в `nuxt.config.ts` (`s-maxage=3600, stale-while-revalidate=60`).

## Команды

```bash
bun install                         # postinstall: nuxt prepare

bun run dev                         # generate:manifests + nuxt dev
bun run build                       # generate:manifests + nuxt build
bun run generate                    # SSG: generate:manifests + nuxt generate
bun run preview                     # Превью production-сборки

bun run generate:manifest           # → manifest.json
bun run generate:file-manifest      # → file-manifest.json
bun run generate:manifests          # Оба сразу

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
- `app/components/Taskbar/Elements/About.vue` — клик по элементу taskbar.
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

**Programs registry** (`app/programs/index.ts`): `REGISTRY: Record<ProgramType, ProgramView>` со схемой `{ id, label, icon, component, config: { showBreadcrumbs, canNavigate } }`. API: `getProgram(type)`, `getAllPrograms()`, `hasProgram(type)`.

**Window composables** — группировка по назначению:

- **Создание/инжект**: `useCreateAndRegisterWindow`, `useCreateWindowByPath`, `useInjectWindow`, `useInjectWindowRoute`, `useWindow`.
- **Fetch контента**: `useFetchEntity`.
- **Drag/Resize**: `useResizeForDirections`, `useResizeForDirectionsEvent`, `useWindowBoundsAnimation/`.
- **Сворачивание**: `useCollapsed`, `useCollapseTrigger`, `useCollapseBoundsMemory`, `useCollapseOffscreenPosition`.
- **Fullscreen**: `useFullscreenOnMount`, `useWindowFullscreenAutoSet`, `useOnFullScreen`.
- **Focus**: `useFocusOnClick`, `useSetFocusState`, `useFrameObserverLifecycle`.
- **SEO / route / loading**: `useSeoWindow`, `useWindowRoute`, `useLoadingStateSync`, `useWindowLoading`.

Полная схема, граф зависимостей composables и чек-листы расширения — [AGENTS.md](AGENTS.md).
