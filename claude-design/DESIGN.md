# Dimonya OS — Design System

Этот документ описывает дизайн-систему портфолио **Dimonya OS** в форме, достаточной чтобы любой дизайн-промпт типа «сделай страницу X / компонент Y» мог стартовать только с этой папки + краткой постановки. Реальная кодовая база — в `app/`, `server/`, `shared/`. При расхождении trust real source.

## 1. Концепция

Портфолио-сайт в стиле десктопной операционной системы (Windows-подобный интерфейс). Эстетика — ретро-пиксельный минимализм:

- Тёмный фон с динамической `<canvas>`-сеткой (`Background.vue` рисует grid с devicePixelRatio).
- Окна с пиксельными «срезанными» углами (4×4 mask, не bezier border-radius).
- Один пиксельный шрифт `PixCyrillic` на весь UI.
- Минимум декоративных элементов: только цветовые акценты (`accent` оранжевый, `main` зелёный), всё остальное — оттенки тёмно-серого.
- Поведение виртуальной ОС: drag/resize окон, фокус, fullscreen/collapsed, taskbar с превью (через html-to-image), виртуальная FS контента.

Не делать: glassmorphism, neumorphism, скевоморфизм, gradient backgrounds, shadows, soft-rounded UI, любые «современные» SaaS-паттерны.

## 2. Палитра

Источник — `app/assets/scss/vars.scss` (`$colors` map) + `app/assets/scss/_settings.scss` (`:root --color-*`).

| Token | HEX | RGB triplet | Назначение |
|---|---|---|---|
| `accent` | `#db481d` | `219 72 29` | hover-цвет ссылок, активные social-links, акценты на действиях |
| `main` | `#40b567` | `64 181 103` | spinner лоадера, иконки в taskbar (`--icon-color`), активный pill в taskbar |
| `default` | `#151515` | `21 21 21` | корневой фон body (`<html>`, `body`, `#__nuxt`) |
| `default-1` | `#181818` | `24 24 24` | резервный слой (объявлен в `:root`, пока не активен) |
| `default-2` | `#1d1a1a` | `29 26 26` | резервный слой |
| `default-3` | `#2f2626` | `47 38 38` | фон карточек: `.about__photo`, `.about__info`, `.about__content`, `.explorer__content`, scrollbar-track |
| `default-contrast` | `#cecece` | `206 206 206` | основной цвет текста |

### Правила использования

- Никогда не писать hex/rgb напрямую в компонентах — только через `c('name')` и `c-rgba('name', $alpha)` (validates имя в compile-time).
- `c()` возвращает `var(--color-<name>)`, не статическое значение → runtime theme switch через `[data-theme]` без rebuild (см. `_settings.scss` stub `[data-theme="dark"]`).
- `c-rgba($name, $α)` синтезирует `rgb(var(--color-<name>-rgb) / $α)` — потому что SCSS-функция `rgba(var(...))` не работает в compile-time.

### Когда `default` vs `default-1/2/3`

- `default` (#151515) = root background, taskbar transparent base, окна `.window__wrapper` background.
- `default-1`, `default-2` — резервные. Использовать когда нужен ещё более светлый/тёмный слой между корневым фоном и карточкой. Сейчас не активны.
- `default-3` (#2f2626) — карточки и контейнеры контента (выделяются на фоне основного). Это «вторая глубина» — то, на что пользователь смотрит и читает.

### Когда `accent` vs `main`

- `accent` (оранжевый) — текстовый hover, кликабельные элементы при взаимодействии. Привлекает внимание к действию.
- `main` (зелёный) — система: иконки программ, активные состояния в taskbar, лоадер. Сигналит «всё работает».

## 3. Типографика

**Один шрифт**: `PixCyrillic`. Подключён в `app/assets/scss/fonts.scss`. Используется через:

1. `$t-default` (vars.scss) = `'PixCyrillic', system-ui, sans-serif` — для прямого `font-family: $t-default`.
2. `t()` миксин (mixins.scss) с дефолтным `$family: 'PixCyrillic'` — основной способ задания типографики.

См. `claude-design/snippets/typography-mixin.scss` и `claude-design/assets/fonts.md`.

### Сигнатура `t()`

```scss
@mixin t(
    $fs: 15px,
    $lh: 1,
    $cName: 'default',
    $fw: 400,
    $family: 'PixCyrillic'
) { ... }
```

### Примеры (из реальной кодовой базы)

| Место | Вызов |
|---|---|
| `About → __name` | `@include t(20px, 1.2, 'default-contrast', 600);` |
| `About → __title` | `@include t(20px, 1.2, 'default-contrast', 600);` |
| `About → __text` | `@include t(14px, 1.5, 'default-contrast');` |
| `About → __social-label` | `@include t(14px, 1, 'default-contrast');` |
| `Explorer → __empty` | прямой `font-family: $t-default; font-size: 40px;` |
| `Loader → __text` | прямой `font-family: $t-default; font-size: 20px;` |
| `Taskbar → __el_number` | прямой `font-family: $t-default; font-size: 8px;` |

### Правила

- Не задавать `font-family` ad-hoc в компоненте без `$t-default` или `t()` миксина.
- Не использовать `rem`/`em` — только `px`. Pixel-эстетика требует точности, а не гибкого scaling.
- `font-weight` 400 — основной. `600` для заголовков. `700` редко (для эмфазиса). Поскольку `PixCyrillic.woff2` — статический файл, веса > 400 будут браузерным synthetic-bold.

## 4. Pixel aesthetic

### `.pixel-box`

Класс, дающий пиксельные срезанные углы 4×4 во всех четырёх углах. Реализация — `mask-image` с четырьмя SVG-уголками + `mask-composite: exclude` (вырезает уголки прозрачными).

См. `claude-design/snippets/pixel-box.scss` (полный блок с комментариями) и `claude-design/assets/corners/*.svg` (4 файла).

### Зачем mask, а не `border-radius`

1. `border-radius` = bezier-кривая → антиалиас → нечёткий subpixel-rendering на любом zoom-уровне → не вписывается в pixel-эстетику.
2. SVG-углы 4×4 рисуют ровно те 4 «лестничных» пикселя, которые нужны; на любом размере экрана/zoom уголки остаются чёткими.
3. Cross-browser: Chrome/Safari через `-webkit-mask-*` (исторически лучше понимали), Firefox + современные через `mask-*` стандарт.

### Где применять

`.pixel-box` обязателен на любом «карточном» контейнере. Места из реальной кодовой базы:

- `<div class="window__wrapper pixel-box">` — `Window/index.vue`
- `<nav class="taskbar pixel-box">` — `Taskbar/index.vue`
- `<div class="explorer__content pixel-box">` — `Programs/Explorer/List.vue`
- `<div class="explorer__nav pixel-box">` — `Programs/Explorer/Nav/index.vue`
- `<div class="explorer__facts pixel-box">` — `Programs/Explorer/Nav/Facts.vue`
- `<div class="about pixel-box">`, `<div class="about__photo pixel-box">`, `<img class="about__photo-img pixel-box">`, `<div class="about__info pixel-box">`, `<div class="about__content pixel-box">` — `Programs/About/index.vue`
- `<div class="taskbar__tooltip pixel-box">` — `Taskbar/Elements/Program/Tooltip.vue`, `TaskbarTooltipItem.vue`
- `<div class="window__breadcrumbs__wrapper pixel-box">` — `Window/header/breadcrumbs.vue`

### Размер 4×4

Жёстко зафиксирован SVG-файлами. Хочешь больше — генерируй новые `.svg` (увеличь pixel-grid внутри). Не использовать `mask-size` отличный от 4×4 для текущих SVG — это размоет уголки.

## 5. Компоненты-паттерны

Полные описания — в `claude-design/patterns/`. Здесь — обзор.

### Window (`patterns/window.md`)

Корневой компонент окна. Drag/resize, fullscreen/collapsed, focus, bounds-анимация (RAF + CSS-vars), SEO, html-to-image превью для taskbar. `WindowOb` — type из `app/components/Window/types.ts`. Состояния (8) с conflict-таблицей. Lifecycle через `useWindow()` фасад.

### Explorer (`patterns/explorer.md`)

Программа «Проводник». Layout: 200px nav (left) + content (right). `cw('md')` скрывает nav в узких окнах. `.explorer__content` обязательно `pixel-box`. Данные через `/api/filesystem/list?path=...`.

### Taskbar (`patterns/taskbar.md`)

Нижняя панель. Группировка окон по `programType`. Превью через MutationObserver + html-to-image. `border-radius` разрешён только в `.taskbar__el_number` (badge числа окон).

### Shortcut (`patterns/shortcut.md`)

Generic ярлык в трёх вариантах: `desktop` / `list` / `nav`. `useGetShortcut(file)` резолвит иконку/имя из programs registry. `getClickShortcutEvent()` — `dblclick` на десктопе, `click` на мобилке.

### Loader

`app/components/Loader.vue`. Boot loader. Полноэкранный overlay, пиксельный SVG-спиннер (rotate Y 360°, 3s ease-in-out), текст `font-family: $t-default;`. Кликабелен после загрузки → triggers audio (`/loading-end.mp3`).

### Background

`app/components/Background.vue`. `<canvas>` grid фон с devicePixelRatio support. Рендерится один раз, не реагирует на resize окна без явной перерисовки. Используется как fixed-фон под всеми окнами.

### Workbench

`app/components/Workbench/index.vue`. Рабочий стол с grid ярлыков (`Workbench/Shortcut`). Адаптируется под viewport через `useGridCells`.

## 6. SCSS-конвенции

Файловая структура `app/assets/scss/`:

```
globals.scss        — @forward для vars/functions/mixins/breakpoints
vars.scss           — $colors, $t-default
functions.scss      — c($name), c-rgba($name, $α)
mixins.scss         — t(), cw('name'), ch('name'), cwh('name')
_breakpoints.scss   — $breakpoints map
_settings.scss      — :root --color-*, .pixel-box, .taskbar__el, .loader, утилиты
fonts.scss          — @font-face PixCyrillic
main.scss           — entry: reset + fonts + settings
reset.scss          — нормализация
```

`globals.scss` подключён глобально через `additionalData` (Nuxt vite config) — `c()`, `c-rgba()`, `t()`, `cw/ch/cwh` доступны в любом `<style lang="scss">` без `@use`.

### BEM, kebab-case

- Корневой класс компонента = имя компонента lowercase (`.window`, `.taskbar`, `.explorer`, `.about`).
- Элементы: `.<block>__<element>` (`.window__wrapper`, `.explorer__content`).
- Модификаторы: `.<block>--<modifier>` (`.shortcut--desktop`).
- Состояния: `.<block>.<state>` (`.window.focused`, `.taskbar__el.active`) — НЕ через модификатор `--`, а через прямой класс состояния.

### Глобальный SCSS, не scoped

`<style lang="scss">` — без `scoped`. Все стили глобальные, изолируются через BEM. Это упрощает override и сохраняет один источник правды.

### Запрещено

- ❌ `border-radius` (исключение: `.taskbar__el_number` badge).
- ❌ Градиенты.
- ❌ `box-shadow`.
- ❌ `rem`, `em` — только `px`.
- ❌ `<style scoped>`.
- ❌ Inline-стили (кроме CSS-переменных от bounds-store).
- ❌ Компоненты без BEM (тёмные классы типа `.text` или `.btn-primary`).
- ❌ Ad-hoc `font-family` (только `$t-default` или `t()` миксин).
- ❌ Hex/rgb в компонентах (только `c()` / `c-rgba()`).

## 7. Анимации и переходы

### Дефолт

```scss
transition-property: <inline-list>;
transition-duration: 0.3s;
transition-timing-function: ease-in-out;
```

`transition-property` — всегда инлайн-список, не shorthand. Это явно указывает что именно анимируется.

### Vue Transition naming

```scss
.<name>-enter-active, .<name>-leave-active {
    transition-property: opacity, scale, translate;
    transition-duration: 0.3s;
    transition-timing-function: ease-in-out;
}
.<name>-enter-from, .<name>-leave-to {
    opacity: 0;
    scale: 0.9;
}
```

Стили `enter-active` / `leave-active` объединены (одинаковая duration). `enter-from` и `leave-to` объединены (стартовое = конечное).

### Длительности

- `0.3s` — стандарт для большинства transitions (background, opacity, scale, translate).
- `0.2s` — для color-transitions на ссылках (`about__social-link`).
- `2s` (5s+) — boot loader sequence, audio fade.
- `3s` — rotate-анимация лоадер-иконки (полный цикл `rotateY(0 → 360 → 0 → -360)`).

## 8. Container queries

Точные значения — `app/assets/scss/_breakpoints.scss`:

```scss
$breakpoints: (
    'sm': 600px,
    'md': 768px,
    'lg': 1024px,
    'xl': 1280px,
);
```

Окна объявляют `container-type: size; container-name: window;`. Внутри окна — миксины `cw/ch/cwh`:

- `cw($name)` — `width <` (полезно для скрытия sidebar в узком окне).
- `ch($name)` — `height <` (для редких height-зависимых layout-смен).
- `cwh($name)` — `width < ИЛИ height <` (универсальный «маленькое окно»).

См. `claude-design/snippets/container-queries.scss`.

### НЕ использовать `@media`

`@media (min/max-width: ...)` привязан к viewport. В multi-window OS-стиле это даёт сломанный layout — маленькое окно на большом экране всё равно будет рендериться по desktop-правилам. Container queries привязаны к фактическому размеру окна.

## 9. Don't list (краткий summary)

- ❌ `border-radius` (исключение: `.taskbar__el_number`)
- ❌ Градиенты
- ❌ `box-shadow`
- ❌ `rem`, `em`
- ❌ `<style scoped>`
- ❌ Inline-стили (кроме CSS-переменных)
- ❌ Компоненты без BEM
- ❌ Ad-hoc `font-family`
- ❌ Hex/rgb в компонентах
- ❌ `@media` (только `cw/ch/cwh`)
- ❌ Glassmorphism / neumorphism / соft-rounded / shadows-everywhere

## 10. Как добавить новый programType

Из `AGENTS.md` (секция «Чек-листы расширения → Новая программа»):

1. `app/assets/icons/programs/<name>.svg` — иконка (SVG, моноцветная, цвет через `currentColor` или `--icon-color`).
2. `app/programs/<name>.ts` — экспорт `ProgramView`:
   ```typescript
   import icon from '@/assets/icons/programs/<name>.svg?raw';
   import type { ProgramView } from './index';

   const program: ProgramView = {
       id: '<name>',
       label: 'Отображаемое имя',
       icon,
       extension: '<ext>',
       config: { showBreadcrumbs: true, canNavigate: true },
       component: defineAsyncComponent(
           () => import('@/components/Programs/<Name>/index.vue'),
       ),
   };
   export default program;
   ```
3. `shared/types/filesystem.ts` — добавить `<name>` в union `ProgramType`.
4. `app/programs/index.ts` — импорт + ключ в `REGISTRY`.
5. `app/components/Programs/<Name>/index.vue` — UI компонента.
6. (опц.) `server/assets/entry/<name>/entity.json` — корневая entity, если программа имеет filesystem-точку входа.
7. `bun run generate:manifests` — регенерация `manifest.json` + `file-manifest.json`.
8. Sanity: `bun run typecheck`.

## 11. API / Filesystem

Виртуальная FS контента: `server/assets/entry/`. Каждая папка содержит `entity.json`:

```json
{
    "name": "Отображаемое имя",
    "programType": "explorer",
    "hidden": false
}
```

Скрипты `scripts/generate-manifest.ts` + `scripts/generate-file-manifest.ts` обходят дерево → пишут:

- `server/assets/manifest.json` — `{ generatedAt, rootEntity, tree: ManifestNode[], flatIndex: Record<path, ManifestEntry> }`.
- `server/assets/file-manifest.json` — расширенная версия с типами файлов (для будущего полнотекстового поиска).

В dev `nuxt.config.ts` слушает `server/assets/entry/` и регенерирует автоматически.

### Endpoints

| Метод | Путь | Возвращает |
|---|---|---|
| GET | `/api/filesystem/list?path=/x/y` | `FsFile[]` — список детей |
| GET | `/api/filesystem/get?path=/x/y` | `Entity & { path }` — entity + path (cached) |
| GET | `/api/filesystem/breadcrumbs?path=/x/y` | breadcrumb-path для UI |

Все валидируют query через `parsePathQuery` (zod, `server/utils/validation.ts`): ≥ 1 char, начинается с `/`, отвергает `..`, `\`, `//`, null-byte, длина ≤ 1024. Ошибки: `notFound()`, `badRequest()`, `serverError(err)` из `server/utils/errors.ts`.

## 12. WindowOb-модель

Тип в `app/components/Window/types.ts`:

```typescript
type WindowState =
    | 'fullscreen' | 'fullscreen-ready'
    | 'collapsed' | 'drag' | 'resize'
    | 'loading' | 'error' | 'focused' | 'preview';

type WindowOb = {
    id: string;
    states: Partial<Record<WindowState, true>>;
    targetFile: { value: string };   // путь
    file: FsFile | null;             // загруженная entity
};
```

Состояния пишутся **только** через `windowsStore.setState(id, key, value)` / `clearState` / `toggleState`. Прямая мутация `windowOb.states[key]` ломает автоматический conflict-resolution. Подробности в `patterns/window.md`.

## 13. Расширение

- Новый компонент-паттерн → добавить `claude-design/patterns/<name>.md`.
- Изменилась палитра / шрифт → обновить snippets + DESIGN.md разделы 2/3 + `assets/fonts.md`.
- Новый запрет → дополнить раздел 9 «Don't list».
- Новые брейкпоинты → обновить `_breakpoints.scss` и `claude-design/snippets/container-queries.scss`.

При противоречии этого документа и реального кода — trust real code (`app/`). Этот файл — slow-moving snapshot, не источник правды.
