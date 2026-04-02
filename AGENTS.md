# AGENTS.md

## Проект

Портфолио-сайт в стиле десктопной ОС (Windows-подобный интерфейс). Название — **Dimonya OS**. Реализован на Nuxt 4 с TypeScript, SCSS, Pinia. Развёртывается на Vercel.

## Стек

| Слой             | Технология                                             |
| ---------------- | ------------------------------------------------------ |
| Фреймворк        | Nuxt 4 (`nuxt ^4.3.1`, `vue ^3.5.28`)                  |
| Язык             | TypeScript                                             |
| Стили            | SCSS (глобальные функции/миксины через `globals.scss`) |
| Состояние        | Pinia + `useState`                                     |
| Менеджер пакетов | Bun (также есть `pnpm-lock.yaml`)                      |
| Линтинг          | ESLint (`@nuxt/eslint`), Biome                         |
| Форматтер        | Biome                                                  |
| Хостинг          | Vercel (preset `vercel` в `nitro`)                     |
| Изображения      | `@nuxt/image`                                          |
| Утилиты          | `html-to-image` (скриншоты окон для превью в taskbar)  |

## Команды

```bash
bun install                # Установка зависимостей
bun run dev                # Dev-сервер (автогенерация манифестов + nuxt dev)
bun run build              # Production-сборка (автогенерация манифестов + nuxt build)
bun run generate           # Static generation
bun run generate:manifest  # Генерация manifest.json из public/entry/
bun run generate:file-manifest  # Генерация file-manifest.json
bun run generate:manifests  # Обе манифесты сразу
bun run preview            # Превью production-сборки
```

## Структура проекта

```
app/                        # Основной код приложения (Nuxt app directory)
├── app.vue                 # Точка входа: инициализация viewport, окон, SEO
├── error.vue               # Страница ошибки
├── assets/
│   ├── fonts/              # Шрифты: IBMPlexMono, Ithaca
│   └── scss/
│       ├── globals.scss    # Точка входа SCSS (@forward vars, functions, mixins)
│       ├── vars.scss       # Цвета ($colors map)
│       ├── functions.scss  # Функция c() для цветов
│       ├── mixins.scss     # Миксин t() для типографики
│       ├── main.scss       # Импортирует reset, fonts, settings
│       ├── reset.scss      # CSS reset
│       ├── fonts.scss      # @font-face объявления
│       └── _settings.scss  # Глобальные стили :root, body
├── components/
│   ├── AnimatedText.vue    # Анимация печатания текста
│   ├── Background.vue      # Canvas-сетка на фоне (grid)
│   ├── FullscreenPreffered.vue  # Индикатор полноэкранного режима
│   ├── Loader.vue          # Экран загрузки (пиксельный спиннер + звук)
│   ├── TaskbarTooltipItem.vue / TaskbarTooltips.vue  # Тултипы панели задач
│   ├── Programs/
│   │   └── Explorer/       # Программа «Проводник»
│   │       ├── index.vue   # Основной компонент: навигация + содержимое
│   │       ├── shortcut.vue # Иконка файла/папки
│   │       └── Nav/        # Навигация: index, shortcut, Facts
│   ├── Taskbar/
│   │   ├── index.vue       # Панель задач (нижняя, fixed)
│   │   ├── AllPrograms.vue # Список программ в taskbar
│   │   ├── useIsCurrentRoute.ts
│   │   ├── useScale.ts
│   │   └── Elements/
│   │       ├── About.vue   # Кнопка «О себе»
│   │       └── Program/    # Кнопка программы (frame, tooltip, etc.)
│   ├── Window/
│   │   ├── index.vue       # Компонент окна (фокус, роутинг, анимация bounds)
│   │   ├── View.vue        # TransitionGroup всех окон
│   │   ├── Content.vue     # Рендер программы по programType
│   │   ├── Loader.vue      # Загрузчик окна
│   │   ├── Window.d.ts     # Типы WindowOb, WindowState, WindowStates
│   │   ├── _nav.scss       # Стили навигации окна
│   │   ├── composables/    # 17 composables для окна
│   │   │   ├── useCreateAndRegisterWindow.ts  # Создание + регистрация окна
│   │   │   ├── useCreateWindowByPath.ts       # Создание окна по API-пути
│   │   │   ├── useFetchWindowEntity.ts        # Загрузка entity для окна
│   │   │   ├── useWindowRoute.ts              # Синхронизация окна ↔ URL
│   │   │   ├── useWindowLoading.ts            # Состояние загрузки
│   │   │   ├── useCollapsed.ts                # Сворачивание окна
│   │   │   ├── useOnFullScreen.ts             # Полноэкранный режим
│   │   │   ├── useWindowFullscreenAutoSet.ts  # Авто-fullscreen при drag за край
│   │   │   ├── useSetFullscreenObserver.ts    # Observer fullscreen
│   │   │   ├── useSetFocusState.ts            # Установка focused-состояния
│   │   │   ├── useSetLoadingState.ts          # Установка loading-состояния
│   │   │   ├── useFocusOnClick.ts             # Фокус по клику
│   │   │   ├── useSeoWindow.ts               # SEO title для окна
│   │   │   ├── useIsInerractionWindow.ts      # Проверка взаимодействия
│   │   │   ├── useClampTargetOnResizeEnd.ts   # Ограничение bounds при resize
│   │   │   ├── useResizeForDirections.ts      # Направления resize (top/left/right/bottom)
│   │   │   └── useResizeForDirectionsEvent.ts # Обработчики событий resize
│   │   ├── header/         # Заголовок окна
│   │   │   ├── index.vue   # Контейнер (drag, навигация, breadcrumbs)
│   │   │   ├── name.vue    # Название окна
│   │   │   ├── breadcrumbs.vue
│   │   │   └── useMove.ts  # Drag-and-drop логика
│   │   ├── resize/         # 10 компонентов resize-хендлов
│   │   │   ├── All.vue, Top, Bottom, Left, Right
│   │   │   ├── LeftTop, RightTop, LeftBottom, RightBottom
│   │   │   └── index.vue
│   │   └── utils/
│   │       ├── debounce.ts, clampers.ts, useGetId.ts
│   │       └── (другие утилиты)
│   └── Workbench/
│       ├── index.vue       # Рабочий стол (grid ярлыков)
│       └── Shortcut/       # Ярлык на рабочем столе
├── composables/
│   ├── useAllWindows.ts         # Глобальное хранилище окон (useState)
│   ├── useAllWindowsBounds.ts   # (пустой)
│   ├── useBatchedReactive.ts    # Batched реактивный объект (queueMicrotask)
│   ├── useBatchedRef.ts         # Batched ref (queueMicrotask)
│   ├── useContentArea.ts        # Viewport − taskbar = рабочая область
│   ├── useFocusController.ts    # Глобальный focusedWindowId
│   ├── useFrameObserver.ts      # MutationObserver → html-to-image (превью окон)
│   ├── useGridCells.ts          # Расчёт сетки для grid-layout
│   ├── useMutationObserver.ts   # (пустой)
│   ├── useQueuedRouter.ts       # Очередь router.push с дедупликацией
│   ├── useResizeObserver.ts     # Обёртка ResizeObserver
│   ├── useSeoUnfocus.ts         # SEO title при снятии фокуса
│   ├── useSetChainedWatchers.ts # Условные watchers (активны только при условии)
│   ├── useTaskbarTooltips.ts    # Управление тултипами taskbar
│   ├── useWindowBounds.ts       # Bounds окон: target (reactive) + calculated (plain)
│   ├── useWindowFetch.ts        # Fetch-обёртка с loading-состоянием
│   ├── useWindowPaths.ts        # Поиск окна по пути
│   ├── useWindowTitle.ts        # Title окна (label + name)
│   └── useWindowsGroupByProgram.ts  # Группировка окон по programType
├── layouts/
│   └── default.vue         # ClientOnly: Background + FullscreenPreffered + Loader
├── plugins/
│   └── warn.client.ts      # Кастомный Vue warn handler
└── utils/
    ├── getClickShortcutEvent.ts  # Обработчик клика (double-click на десктопе)
    ├── useIsMobile.ts            # Определение мобильного устройства
    └── constants/
        ├── OFFSET.ts             # Смещение 15px
        └── PROGRAMS.ts           # Реестр программ (explorer, project, tproject)

server/
├── api/
│   └── filesystem/
│       ├── list.ts          # POST /api/filesystem/list — список файлов по пути
│       ├── get.ts           # POST /api/filesystem/get — получить entity по пути
│       ├── files.get.ts     # GET /api/filesystem/files — получить file-manifest.json
│       └── breadcrumbs.ts   # POST /api/filesystem/breadcrumbs — хлебные крошки
├── assets/
│   ├── manifest.json        # Автогенерируемый манифест (tree + flatIndex)
│   ├── file-manifest.json   # Автогенерируемый файловый манифест
│   └── entry/               # Контент портфолио (серверный asset)
│       ├── entity.json      # Корневая entity
│       ├── about-me/entity.json
│       └── projects/entity.json + griboyedov/, u24/
└── utils/
    ├── CACHELIFETIME.ts         # Время кэша (сейчас 0)
    ├── getAllEntitiesByPath.ts  # Поиск детей в manifest.tree
    ├── getBreadcrumbs.ts        # Хлебные крошки через getEntity
    ├── getEntity.ts             # Получение entity из flatIndex
    ├── getManifest.ts           # Чтение manifest.json (кэш в prod)
    └── PROGRAMHADLERS.ts        # Обработчики программ (заготовка)

shared/
├── types/
│   ├── Entity.d.ts          # { name, programType, hidden? }
│   ├── FsFile.d.ts          # Entity & { path }
│   └── Program.d.ts         # ProgramType = 'explorer' | 'project' | 'tproject'
└── utils/Programs/
    ├── All.ts               # ALLPROGRAMS: Record<ProgramType, Program>
    └── Explorer.ts          # (пустой)

scripts/
├── generate-manifest.ts     # Обходит public/entry/ → manifest.json (tree + flatIndex)
└── generate-file-manifest.ts # Обходит public/entry/ → file-manifest.json (с типами файлов)

public/
├── robots.txt
├── entry/                   # Контент портфолио (entity.json в каждой папке)
│   ├── entity.json
│   ├── about-me/entity.json
│   └── projects/entity.json + ...
└── imgs/                    # Изображения
```

## Архитектура

### Виртуальная файловая система

Контент портфолио хранится как виртуальная файловая система в `public/entry/`. Каждая директория содержит `entity.json` с метаданными:

```json
{
    "name": "Отображаемое имя",
    "programType": "explorer",
    "hidden": false
}
```

Скрипты `generate-manifest.ts` и `generate-file-manifest.ts` обходят дерево `public/entry/` и генерируют:

- `server/assets/manifest.json` — дерево + плоский индекс
- `server/assets/file-manifest.json` — детальный манифест с типами файлов

В dev-режиме `nuxt.config.ts` отслеживает изменения в `public/entry/` и автоматически перегенерирует манифесты.

### Оконный менеджер

Ключевая концепция: каждое окно — объект `WindowOb`:

```typescript
type WindowOb = {
    id: string; // Уникальный ID
    states: WindowStates; // fullscreen, collapsed, drag, resize, loading, error, focused
    targetFile: { value: string }; // Путь к файлу
    file: FsFile | null; // Загруженная entity
};
```

**Жизненный цикл окна:**

1. `useCreateAndRegisterWindow` — создание и регистрация в `allWindows`
2. Проверка дубликатов через `useWindowPaths.hasPath`
3. `useWindowEntityFetcher` — загрузка entity через API
4. `useWindowRoute` — двунаправленная синхронизация окна ↔ URL
5. `useWindowLoop` — RAF-цикл для анимации bounds (CSS-переменные)
6. `useFrameObserver` — MutationObserver → html-to-image (превью для taskbar)

**Bounds система:**

- `target` — целевые координаты (реактивные, batched через `useBatchedReactive`)
- `calculated` — текущие анимированные координаты (plain object)
- RAF-цикл в `useWindowLoop` плавно анимирует calculated → target
- CSS-переменные `--w-top`, `--w-left`, `--w-width`, `--w-height` управляют позицией

### Роутинг

- Catch-all роут (`[...path].vue` отсутствует, используется программный роутинг)
- `useQueuedRouter` — очередь навигации с дедупликацией
- URL синхронизируется с активным окном через `useWindowRoute`
- При фокусе окна — URL обновляется на `windowOb.targetFile.value`
- При ручной навигации — обновляется `windowOb.targetFile`

### Программы

Типы программ определены в `shared/types/Program.d.ts`:

- `explorer` — файловый проводник
- `project` — просмотр проекта
- `tproject` — просмотр проекта на Tilda

Все программы используют один компонент `Programs/Explorer/index.vue`, но могут иметь разные конфигурации.

### Taskbar

- Нижняя панель с кнопками программ и «О себе»
- Группировка окон по `programType` через `useWindowsGroupByProgram`
- Тултипы с превью окон (скриншоты через `html-to-image`)
- Тултипы управляются через `useTaskbarTooltips`

## SCSS

### Глобальные функции (доступны везде через `additionalData`)

```scss
c('color-name')  // Функция получения цвета из $colors map
@include t($fs, $lh, $cName, $fw, $family)  // Миксин типографики
```

### Цветовая палитра (`vars.scss`)

```scss
$colors: (
    'accent': #db481d,
    // Оранжевый акцент
    'main': #40b567,
    // Зелёный фон
    'default': #151515,
    // Основной тёмный
    'default-1': #181818,
    // Заголовок окна
    'default-2': #1d1a1a,
    // Промежуточный тёмный
    'default-3': #2f2626,
    // Фон контента
    'default-contrast': #cecece, // Светлый текст
);
```

### Шрифты

- **Ithaca** — основной шрифт (для текста)
- **IBMPlexMono** — моноширинный

## API сервера

| Метод | Путь                          | Описание                                               |
| ----- | ----------------------------- | ------------------------------------------------------ |
| POST  | `/api/filesystem/list`        | Список файлов в директории (body: `{ path }`)          |
| POST  | `/api/filesystem/get`         | Получить entity по пути (body: `{ path }`), кэшируемый |
| GET   | `/api/filesystem/files`       | Получить file-manifest.json                            |
| POST  | `/api/filesystem/breadcrumbs` | Хлебные крошки для пути                                |

## Важные паттерны

### Batched Reactivity

`useBatchedReactive` и `useBatchedRef` используют `queueMicrotask` для батчинга обновлений. Это критично для производительности при быстром изменении bounds окон во время drag/resize.

### Chained Watchers

`useSetChainedWatchers` создаёт условные watchers — они активны только когда условие (getter) возвращает true. Используется для drag/resize чтобы не тратить ресурсы в idle.

### Scoped Initialization

Composables `useContentArea`, `useFocusWindowController` используют флаги инициализации (`let initialized = false`) для предотвращения дублирования observers.

### CSS Container Queries

Окна используют `container-type: inline-size` + `container-name: window` для адаптивности контента внутри окон (например, скрытие навигации в Explorer при ширине < 768px).

## Правила разработки

1. **Все цвета через `c()`** — никогда не использовать хардкод цветов
2. **Типографику через `@include t()`** — для единообразия
3. **Не редактировать `manifest.json` и `file-manifest.json` вручную** — они автогенерируемые
4. **Контент добавлять через `public/entry/`** — создавать папку с `entity.json`
5. **При добавлении новой программы** — обновить `ProgramType`, `PROGRAMS`, `ALLPROGRAMS`
6. **Bounds окон** — всегда через `useWindowBounds`, не напрямую в DOM
7. **Роутинг** — через `useQueuedRouter`, не напрямую `router.push`
8. **Форматирование** — Biome (не Prettier)
9. **Пакеты** — через Bun
