# CLAUDE.md — Dimonya OS portfolio

> Единственный файл контрактов проекта. `AGENTS.md` — симлинк на этот файл; править только CLAUDE.md.
> См. также [README.md](README.md), [docs/RULES.md](docs/RULES.md) (150 LOC/файл, code-splitting, SoC — источник правды, не дублировать сюда).

## О проекте

**Dimonya OS** — портфолио-сайт в стиле десктопной ОС: окна, панель задач (`Taskbar`), рабочий стол (`Workbench`). Каждое окно — программа (`about`, `code`, `explorer`, `project`, `showcase`, `tproject`), открывается по пути в URL и показывает сущность из server-side контента (`server/assets/entry/`). Деплой — self-host / VPS (`nitro.preset = "node-server"`, `bun run build` → `bun run preview`).

Язык документации/комментариев — русский. Код, имена, команды, коммиты (Conventional Commits), PR — английский. Без emoji.

## Стек

Nuxt 4 + Vue 3.5 + TypeScript (strict + `noUncheckedIndexedAccess`), Pinia (`@pinia/nuxt`), SCSS (sass), `@nuxt/image`, zod ^4 (server query), `html-to-image` (превью окон в taskbar). **Bun только.** ESLint (`@nuxt/eslint`) + Biome (форматтер), pre-commit lefthook (biome + eslint + typecheck), Vitest + `@vue/test-utils` (unit), Playwright (e2e).

## Архитектурные слои

Каждый файл принадлежит ровно одному слою, размер ≤ 150 LOC (исключения — whitelist в `eslint.config.mjs` + `docs/RULES.md`).

| Слой | Где | Назначение | Запрет |
|---|---|---|---|
| **View** | `app/components/**/*.vue` | Template + минимум script (props, refs, один composable) | `$fetch`, `MutationObserver`, raw `setTimeout(>100ms)` |
| **Logic** | `app/composables/**`, `app/components/**/composables/**` | Vue reactivity, lifecycle, watch | DOM mutation, magic numbers |
| **State** | `app/stores/**` | Pinia: domain state + readonly accessors + actions | `MutationObserver`, dynamic imports, transient UI-state |
| **Service** | `app/services/**` | Pure функции ИЛИ thin DOM wrapper | module-scope mutable state (SSR leak) |
| **Data** | `server/api/**`, `app/services/filesystem/**` | Fetch + validation + cache | бизнес-логика |
| **Util** | `app/utils/**`, `server/utils/**`, `shared/utils/**` | Pure helpers | Vue/DOM/storage deps в `app/utils/` и `shared/utils/` |
| **Types** | `shared/types/**` | Type defs | runtime code |

**SSR-контракт `app/services/`** (импортируется и браузером, и SSR): module-scope mutable state ЗАПРЕЩЁН (P1-09); DOM только под `if (import.meta.client)` либо из `onMounted`; fetch через `$fetch`, не `window.fetch`. Изоляция от Vue/Pinia enforced ESLint `no-restricted-imports`: `app/services/**` импортит только `app/utils/*`, `shared/utils/*`, `shared/types/*`.

Границы: `app/services/` — stateful/DOM-aware; `app/utils/` — pure, тестируется без mount; `server/utils/` — h3 server-only, **никогда** не импортится из `app/`; `shared/utils/` — pure cross-runtime.

## SCSS

Глобально через `additionalData` в `nuxt.config.ts` → `c()`, `c-rgba()`, `@include t(...)`, `cw/ch/cwh` доступны в любом `<style lang="scss">` без импорта.

- Цвета — только `c('accent')` → `var(--color-accent)` и `c-rgba('default', 0.5)` → `rgb(var(--color-default-rgb) / 0.5)`; имена валидируются по `$colors` map в compile-time (typo = `@error`). Палитра в `app/assets/scss/vars.scss`: accent `#db481d`, main `#40b567`, default `#151515` (+ `default-1..3`), `default-contrast` `#cecece`. `_settings.scss` генерит `--color-<name>` + `--color-<name>-rgb`; темизация через `[data-theme]` без rebuild.
- Типографика — только `@include t($fs, $lh, $cName, $fw, $family)`, шрифт PixCyrillic.
- Container queries по `@container window` (корень окна): `@include cw(sm)/ch(sm)/cwh(sm)` — адаптация под размер окна, не viewport. Брейкпоинты — `_breakpoints.scss` (sm/md/lg/xl).
- Не хардкодить hex/breakpoints в компонентах — ломает темизацию и container-aware layout.

## Контент портфолио

`server/assets/entry/`, каждая поддиректория = сущность. Метаданные в `entity.json`: `name`, `programType` (источник истины — `app/programs/index.ts` REGISTRY + `shared/types/filesystem.ts`), опционально `year`, `tags`, `description`, `links`.

- Дерево читается с FS при каждом запросе: `scanTree()` (`server/utils/manifest/scanTree.ts`). Кеш — на уровне endpoint'а (`defineCachedEventHandler`, `ENTITY_CACHE_MAX_AGE`: 60 dev / 3600 prod). Сгенерированных манифестов нет. `scripts/copy-entry.ts` (postbuild) копирует entry → `.output/server/assets/entry`.
- Виртуальные ноды: `<entity>/images/*.avif` поднимаются в children как `<entity>/<file>` (`programType: showcase`); `<entity>/codes/<id>/` — как `<entity>/code/<id>` (`programType: code`, имя из `meta.json.windowTitle`). Папки `images/`/`codes/` в дереве не показываются.
- Изображения — **avif** (webp/png в репо нет). Отдача через `/api/filesystem/asset` (static cache-headers).

## Команды

```bash
bun install          # postinstall: nuxt prepare
bun run dev          # dev-сервер
bun run build        # прод-сборка (postbuild: copy-entry + make-og-images)
bun run preview      # превью прод-сборки
bun run typecheck    # nuxi typecheck
bun run lint         # ESLint
bun run biome:check  # Biome (lint + format)
bun run test:unit    # Vitest
bun run test:e2e     # Playwright
```

**Деплой — автоматический, после каждого пуша в `master`**: GitHub webhook
на VPS (`soulteary/webhook`, HMAC-подпись) запускает `/srv/portfolio/scripts/deploy.sh`.
Локально ничего запускать не надо; ручной деплой (когда вебхук недоступен) —
`bun scripts/deploy-remote.sh` или ssh-команда из `docs/runbooks/portfolio-deploy.md`.
После пуша дождись завершения деплоя (проверка: сайт отвечает новой версией).

## Архитектура окон

**Единственная точка создания окна** — `useCreateAndRegisterWindow(targetPath)` (`app/components/Window/composables/`). Вызывается из: `useAppBootstrap` (boot по URL), `app/error.vue` (fallback), taskbar-иконки (клик по закреплённой без открытых окон), `Workbench/Shortcut/index.vue`, `useCreateWindowByPath` (навигация внутри окна).

**Flow**: path → `/api/filesystem/get` → `programType` → `getProgram(type)` (REGISTRY) → `WindowOb` → `useWindowsStore`.

**Pinia stores** (`app/stores/`): `windows` (реестр: `byId`, `byPath` first-wins, `byProgram`), `focus`, `bounds` (координаты/размеры), `contentArea` (viewport observer), `frame` (RAF-loop), `queuedRouter` (отложенная навигация), `entities` (кеш entity), `windowsUI` (transient UI-состояние).

**`useWindow`** (`Window/composables/useWindow.ts`) — единственный фасад на окно, вызывается из `Window/index.vue`: группирует per-window-эффекты, `provide('windowOb')`/`provide('windowRoute')`.

**Тип окна** (`Window/types.ts`): `WindowOb = { id, states: Partial<Record<WindowState, true>>, targetFile: { value: string }, file: FsFile | null }`. `WindowState` ∈ fullscreen | fullscreen-ready | collapsed | drag | resize | loading | error | focused | preview.

**State API**: только `setState`/`clearState`/`toggleState` — при `value=true` несовместимые снимаются автоматически (`fullscreen`↔`collapsed`↔`drag`↔`resize`; остальные независимые). Прямая мутация `windowOb.states[key]` теряет conflict-resolution.

**Bounds**: `useBoundsStore` хранит per-id `{ target, calculated }`; `useWindowBoundsAnimation` (RAF, controller + easing) интерполирует `calculated → target` и пишет CSS-vars `--w-left/--w-top/--w-width/--w-height`. Cascade-cleanup при закрытии — `Window/utils/removeWindow.ts`.

**Роутинг**: программный, без `pages/[...path].vue`. Только через `useQueuedRouterStore` (дедуп `lastPushedPath`), не напрямую `router.push`. `useWindowRoute` синхронизирует `targetFile.value` ↔ URL.

**Taskbar**: единый список `useTaskbarItems.ts` (`PINNED` = порядок иконок; закреплённая с открытым окном не удваивается). Превью — `useWindowPreview` + `frameStore` (MutationObserver → html-to-image). Трей — `Socials.vue` + `Clock.vue`.

**Shortcut**: `Shortcut/Base.vue` — generic ярлык (`:file`, `:variant desktop|list|nav`, `:on-activate`, опц. slot `icon`); метаданные из `useGetShortcut(file)`. Адаптеры: `Workbench/Shortcut/index.vue`, `Programs/Explorer/shortcut.vue`, `Programs/Explorer/Nav/shortcut.vue`.

**Hydration-контракт (fetch оконного контента)**: окна монтируются внутри Suspense, их fetch-composables стартуют ПОСЛЕ основного hydration-pass, когда `nuxtApp.isHydrating` уже false — дефолтный `getCachedData` читает payload только при `isHydrating` → клиент рендерит fallback (path), SSR — entity → hydration mismatch. Любой fetch-wrapper для оконного контента обязан передавать `getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]` (или читать готовый `windowOb.file` из pinia payload), чтобы клиент брал данные из payload синхронно. Эталоны: `useProjectData` (key `content:<path>`), `useFetchEntity` (key `window-entity-<id>-<path>`).

**Имена компонентов**: Nuxt auto-import именует компоненты по пути (`ProgramsProjectMeta`, `ProgramsExplorerShortcut`). Короткие имена (`<Meta>`, `<Slider>`) НЕ использовать — `<Meta>` коллизит с Nuxt head, результат — пустой SSR и raw-элемент на клиенте (баг рендера проекта).

## API сервера

| Метод | Путь | Описание |
| --- | --- | --- |
| GET | `/api/filesystem/list` | Дети по `query.path` |
| GET | `/api/filesystem/get` | Entity по `query.path` (cached) |
| GET | `/api/filesystem/breadcrumbs` | Хлебные крошки |
| GET | `/api/filesystem/content` | content (images + entity) для project program |
| GET | `/api/filesystem/asset` | Файл изображения (avif, static cache) |

Все эндпоинты: валидация query (`parsePathQuery` / `parseContentPathQuery`, zod: ≥1 char, начинается с `/`, отвергает `..`, `\`, `//`, null-byte, ≤1024); данные через `scanTree()`; кеш `defineCachedEventHandler` (`ENTITY_CACHE_MAX_AGE`); ошибки только `notFound()`/`badRequest()`/`serverError(err)` (`server/utils/errors.ts`). Сброс кеша dev: `rm -rf .nitro/cache`. Cache-Control для self-host — `routeRules` в `nuxt.config.ts`.

## Правила разработки

1. **Цвета** — только `c()` / `c-rgba()`.
2. **Типографика** — только `@include t()`.
3. **Дерево контента** — только через FS (`server/assets/entry/`), никаких манифестов.
4. **Контент** — в `server/assets/entry/`, не в `public/`.
5. **Bounds окон** — только через `useBoundsStore`; CSS-vars пишет `useWindowBoundsAnimation`.
6. **Window states** — только `setState`/`clearState`/`toggleState`.
7. **Роутинг** — через `useQueuedRouterStore`.
8. **Window-эффекты** — внутрь фасада `useWindow.ts`.
9. **Server query** — валидация обязательна (`parsePathQuery` или явная zod-схема).
10. **Hydration** — оконные fetch-wrappers с `getCachedData` из payload (см. выше).

## Соглашение имён

- Модули `app/components/` верхнего уровня — `PascalCase/`; подсекции (`resize/`, `header/`, `composables/`, `utils/`) — `lowercase/`; UI-подкомпоненты — `PascalCase/`.
- Composables — `useXxx.ts` (глобальные → `app/composables/`, локальные → рядом с компонентом).
- Stores — `app/stores/<name>.ts`, `defineStore("<name>", () => ...)`, export `useXxxStore`.
- Programs — `app/programs/<name>.ts` (lowercase, совпадает с `ProgramType`).
- Утилиты/константы — `xxxYyy.ts` (camelCase, без `use`-префикса; константы не SCREAMING_SNAKE).
- Типы — `xxx.ts` с `export type`; `.d.ts` только для ambient-деклараций.
- Компоненты — `PascalCase.vue` либо `index.vue` для корня папки.

## Чек-листы расширения

**Новая программа**: иконка `app/assets/icons/programs/<name>.svg` → `app/programs/<name>.ts` → `<name>` в union `ProgramType` (`shared/types/filesystem.ts`) → ключ в `REGISTRY` → (опц.) `app/components/Programs/<Name>/index.vue` → (опц.) entity в `server/assets/entry/` → `bun run typecheck`.

**Новый API-эндпоинт**: `server/api/filesystem/<name>.ts` → валидация query → `scanTree()` + resolve → ошибки из `server/utils/errors.ts` → (опц.) `defineCachedEventHandler` + `routeRules` → `bun run typecheck` + curl.

**Новый shortcut**: `<location>/shortcut.vue` над `Shortcut/Base.vue` (`:file`, `:variant`, `:on-activate`); программа — в `app/programs/`.
