# Programs/Project + Programs/Showcase — Design Spec

Дата: 2026-04-25
Статус: design-only, без implementation
Контекст: `Programs/Project` (страница одного проекта, открывается dblclick по entity папки проекта) и `Programs/Showcase` (single-image viewer, открывается кликом по слайду в Project).

Источник истины — `claude-design/DESIGN.md`. При расхождении — trust DESIGN.md.

---

## Принятые дизайн-решения (TL;DR)

| Решение | Значение | Причина |
|---|---|---|
| Slider aspect-ratio | `16 / 10` | Web/mockup-портфолио чаще именно в этом соотношении; не «киношно» как 16/9, не «квадратно» как 4/3 |
| Slider object-fit | `contain` | Design-работы нельзя кропать; letterboxing на `c('default-3')` естественен. Per-project override → open question |
| Tags visual | Pixel-chip + `#`-префикс (гибрид A+B) | Чип отделяет тег визуально, `#` сохраняет привычную семантику тегов |
| Slider arrows | Overlay поверх viewport, middle-edge | Конвенциональный паттерн портфолио-слайдеров; не «съедают» layout |
| Position indicator | Bottom-right corner overlay внутри viewport | Минимально вмешивается в кадр |
| Slider container padding | `10px` на `.project__slider`, viewport внутри | Breathing-room, overlay-controls сидят на картинке (внутри viewport) |
| Showcase image wrapper | БЕЗ дополнительного `.pixel-box` на изображении | `window__wrapper` уже даёт пиксель-углы окна; image — контент, не карточка |

---

## 1. Project — Layout schema

### Normal (нормальное окно, ширина ≥ 600px)

```
┌──────────────────────────────────── .window__wrapper (pixel-box, c('default')) ───────────────────────────────────┐
│  WindowHeader (стандартный — name + breadcrumbs + nav)                                                            │
│ ┌─────────────────────────────────────── .project (flex row, gap:10px, padding:10px) ────────────────────────────┐│
│ │┌── .project__meta ──────────┐ ┌─── .project__slider (pixel-box, c('default-3'), padding:10px, flex:1) ──────┐││
│ ││ (pixel-box, c('default-3'), │ │┌─── .project__slider-viewport (overflow:hidden, position:relative) ──────┐│││
│ ││  padding:10px, w:300,       │ ││┌─── .project__slider-wrapper (flex row, transform:translate3d(...)) ──┐│││
│ ││  flex-direction:column,     │ │││ ┌──slide──┐ ┌──slide──┐ ┌──slide──┐ ┌──slide──┐ ┌──slide──┐ ...     │││││
│ ││  gap:10px,                  │ │││ │ <img>   │ │ <img>   │ │ <img>   │ │ <img>   │ │ <img>   │         │││││
│ ││  flex-shrink:0,             │ │││ │ aspect: │ │ contain │ │  16/10  │ │         │ │         │         │││││
│ ││  overflow-y:auto)           │ │││ │ 16/10   │ │ cursor: │ │ default-│ │         │ │         │         │││││
│ ││                             │ │││ │ contain │ │ pointer │ │ 3 letter│ │         │ │         │         │││││
│ ││  ┌── .__title ──────┐       │ │││ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │││││
│ ││  │ 24px,600,contrast│       │ ││└────────────────────────────────────────────────────────────────────┘│││││
│ ││  └──────────────────┘       │ ││                                                                       │││││
│ ││  ┌── .__year ───────┐       │ ││ [<] middle-left arrow overlay     middle-right arrow overlay [>]      │││││
│ ││  │ 11px, 0.6 opacity│       │ ││                                                                       │││││
│ ││  └──────────────────┘       │ ││                                              ┌─ .__counter ──────┐  │││││
│ ││  ┌── .__tags (flex wrap)─┐  │ ││                                              │ "3 / 12" overlay │  │││││
│ ││  │ [#design] [#site]     │  │ ││                                              │ pixel-box         │  │││││
│ ││  │ [#vue]                │  │ ││                                              └───────────────────┘  │││││
│ ││  └───────────────────────┘  │ │└──────────────────────────────────────────────────────────────────────┘│││
│ ││  ┌── .__description ────┐   │ └──────────────────────────────────────────────────────────────────────────┘││
│ ││  │ 14px, 1.5            │   │                                                                              ││
│ ││  └──────────────────────┘   │                                                                              ││
│ ││  ┌── .__links (flex col)┐   │                                                                              ││
│ ││  │ link-1               │   │                                                                              ││
│ ││  │ link-2               │   │                                                                              ││
│ ││  └──────────────────────┘   │                                                                              ││
│ │└─────────────────────────────┘                                                                              ││
│ └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Левая meta-панель = аналог `.about__left`: 300px фикс, gap 10px между внутренними блоками, scroll внутри если контент длинный.
Правая slider-панель = `flex:1`, всю остальную ширину занимает.

### Mobile (`cw('sm')` — width < 600px) — column-reverse

```
┌──────────────── .window__wrapper ────────────────┐
│  WindowHeader                                     │
│ ┌─── .project (flex column-REVERSE, padding:10) ┐│
│ │ ┌── .project__meta (top now) ─────────────┐   ││
│ │ │ width:100%, height:fit-content,         │   ││
│ │ │ padding:10px, c('default-3') pixel-box  │   ││
│ │ │  __title  __year  __tags  __desc  __lnk │   ││
│ │ └────────────────────────────────────────┘   ││
│ │ ┌── .project__slider (bottom now) ───────┐   ││
│ │ │ width:100%,                             │   ││
│ │ │ aspect-ratio: 16/10 (height-locked),    │   ││
│ │ │ pixel-box, default-3, padding:10px      │   ││
│ │ │ ┌── viewport ──────────────────────┐   │   ││
│ │ │ │ <slide><slide><slide>...         │   │   ││
│ │ │ │ [<] arrows + counter overlay      │   │   ││
│ │ │ └───────────────────────────────────┘   │   ││
│ │ └──────────────────────────────────────────┘   ││
│ └─────────────────────────────────────────────────┘│
│  Контейнер прокручивается вертикально:              │
│   meta-сверху — слайдер-снизу.                      │
└────────────────────────────────────────────────────┘
```

Логика та же что в `.about` (см. `app/components/Programs/About/index.vue:98-103`): корневой контейнер `flex-direction: column-reverse; overflow-y: auto;` + `background: c('default-3')`.

---

## 2. Project — Sizes table

### Layout-уровень

| Token | Value | Где |
|---|---|---|
| `.project` padding | `10px` | внешний gap от window__wrapper |
| `.project` gap | `10px` | между meta и slider pillars |
| `.project__meta` width | `300px` (`min-width:300px; flex-shrink:0`) | normal mode |
| `.project__meta` width (cw sm) | `100%` (`width:100%; height:fit-content`) | mobile |
| `.project__meta` padding | `10px` | внутренний |
| `.project__meta` gap | `10px` | между title/year/tags/desc/links |
| `.project__slider` flex | `1` | normal |
| `.project__slider` width (cw sm) | `100%` | mobile |
| `.project__slider` padding | `10px` | breathing-room вокруг viewport |
| `.project__slider-viewport` aspect-ratio | `16 / 10` | нормирует высоту слайда |
| `.project__slide` aspect-ratio | `16 / 10` | каждый слайд держит ratio |
| `.project__slide` object-fit | `contain` | дефолт; см. open-q |

### Typography (через `t()` или прямое `font-family: $t-default;`)

| Селектор | Mixin / прямые | Размер / вес / цвет |
|---|---|---|
| `.project__title` | `@include t(24px, 1.2, 'default-contrast', 600)` | 24/1.2/600/contrast |
| `.project__year` | `@include t(11px, 1, 'default-contrast')` + `opacity: 0.6` | 11/1/400/contrast α0.6 |
| `.project__tag` | `@include t(11px, 1, 'default-contrast')` | 11/1/400/contrast |
| `.project__description` | `@include t(14px, 1.5, 'default-contrast')` | 14/1.5/400/contrast |
| `.project__link` | `@include t(14px, 1.4, 'default-contrast')` | 14/1.4/400/contrast → hover accent |
| `.project__counter` | `@include t(12px, 1, 'default-contrast')` | 12/1/400/contrast |
| `.project__empty-text` | `@include t(20px, 1, 'default-contrast')` | для empty/no-meta стейтов |

### Tag chips

| Token | Value |
|---|---|
| `.project__tag` padding | `2px 6px` |
| `.project__tag` background | `c('default')` (тёмный фон поверх default-3 подложки meta) |
| `.project__tags` gap | `4px` (flex-wrap) |
| `.project__tag` (pixel-box) | да |

### Slider overlay-controls

| Token | Value |
|---|---|
| `.project__slider-arrow` size | `28px × 28px` (16×16 SVG + 6px padding) |
| `.project__slider-arrow` position | `absolute; top:50%; translate:0 -50%; left:10px` (prev) / `right:10px` (next) |
| `.project__slider-arrow` background (default) | `c-rgba('default', 0)` (прозрачно) |
| `.project__slider-arrow` background (hover) | `c-rgba('default', 0.6)` |
| `.project__slider-arrow` background (active) | `c-rgba('default', 0.8)` |
| `.project__slider-arrow` (pixel-box) | да |
| `.project__counter` position | `absolute; right:10px; bottom:10px` |
| `.project__counter` padding | `2px 6px` |
| `.project__counter` background | `c-rgba('default', 0.6)` |
| `.project__counter` (pixel-box) | да |

### Links

| Token | Value |
|---|---|
| `.project__links` direction | `column` |
| `.project__links` gap | `6px` |
| `.project__link` color (default) | `c('default-contrast')` |
| `.project__link` color (hover, focus, active) | `c('accent')` |
| `.project__link` transition | `color 0.2s ease-in-out` (как `.about__social-link`) |

---

## 3. Project — BEM tree

```
.project                                  // корень. flex row, gap:10. cw('sm') → flex column-reverse
├── .project__meta                        // pixel-box на default-3. 300px / 100% (cw sm)
│   ├── .project__title                   // h1/h2 — заголовок проекта (meta.title)
│   ├── .project__year                    // если meta.year есть
│   ├── .project__tags                    // wrapper, flex wrap
│   │   └── .project__tag (pixel-box)     // на каждый tag из meta.tags[]
│   ├── .project__description             // если meta.description есть
│   └── .project__links                   // если meta.links?.length
│       └── .project__link                // <a>
└── .project__slider (pixel-box)          // bg default-3, padding 10. flex:1 / 100% (cw sm)
    ├── .project__slider-viewport         // overflow:hidden, position:relative, aspect-ratio:16/10
    │   └── .project__slider-wrapper      // flex row, Swiper кладёт transform:translate3d
    │       └── .project__slide           // a single slide. cursor:pointer (→ open showcase)
    │           └── .project__slide-img   // <img>, object-fit:contain
    ├── .project__slider-arrow            // common. .project__slider-arrow_prev / _next модификаторы
    │   └── (SVG inline, fill:currentColor)
    ├── .project__counter (pixel-box)     // "3 / 12"
    │
    │   // state-only элементы (рендерятся вместо viewport):
    ├── .project__empty                   // images.length === 0
    │   └── .project__empty-text
    └── .project__error                   // fetch failed at slider-level (если decision = inline error)
        └── .project__error-text

// State modifiers на корне (Swiper / component):
.project__slider-wrapper.grabbed          // pointer-down on viewport
.project__slider-arrow.disabled           // first/last slide reached
.project.no-meta                          // project.json missing/empty fallback
```

### Modifiers / state classes

- `.grabbed` — кладёт Swiper на `.project__slider-wrapper` пока pointer down. Курсор `grabbing`, отключает opacity arrows.
- `.disabled` — на `.project__slider-arrow` если на первом/последнем слайде. opacity 0.3, pointer-events:none.
- `.no-meta` — на корне `.project` когда `project.json` отсутствует/пустой; meta-panel показывает только fallback (path/name).
- `.project__slider-arrow_prev` / `_next` — direction-модификаторы (только для positioning, иконка через SVG mirror).

---

## 4. Project — Critical SCSS

Только `.project*` селекторы, ключевые свойства. Глобальный `<style lang="scss">`, без scoped. BEM kebab-case.

```scss
.project {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    max-height: 100%;

    display: flex;
    gap: 10px;
    padding: 10px;

    // mobile: column-reverse, как .about
    @include cw('sm') {
        flex-direction: column-reverse;
        overflow-y: auto;
        overflow-x: hidden;
        background: c('default-3');
        padding: 10px;
    }

    *, & {
        scrollbar-color: c('default-contrast') c('default-3');
    }

    // ─── meta panel ───────────────────────────────────────────
    &__meta {
        width: 300px;
        min-width: 300px;
        flex-shrink: 0;

        display: flex;
        flex-direction: column;
        gap: 10px;

        background: c('default-3');
        padding: 10px;
        box-sizing: border-box;
        overflow-y: auto;

        @include cw('sm') {
            width: 100%;
            min-width: 0;
            height: fit-content;
            max-height: fit-content;
            flex-shrink: 0;
            overflow: visible;
        }
    }

    &__title {
        @include t(24px, 1.2, 'default-contrast', 600);
        margin: 0;
    }

    &__year {
        @include t(11px, 1, 'default-contrast');
        opacity: 0.6;
        margin: 0;
    }

    &__tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    &__tag {
        @include t(11px, 1, 'default-contrast');
        background: c('default');
        padding: 2px 6px;
        // .pixel-box вешается рядом в шаблоне
    }

    &__description {
        @include t(14px, 1.5, 'default-contrast');
        margin: 0;
    }

    &__links {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    &__link {
        @include t(14px, 1.4, 'default-contrast');
        text-decoration: none;
        transition-property: color;
        transition-duration: 0.2s;
        transition-timing-function: ease-in-out;

        @media (hover: hover) {
            &:hover { color: c('accent'); }
        }
        &:focus-visible { color: c('accent'); }
        &:active        { color: c('accent'); }
    }

    // ─── slider panel ─────────────────────────────────────────
    &__slider {
        position: relative;
        flex: 1;
        min-width: 0;
        background: c('default-3');
        padding: 10px;
        box-sizing: border-box;
        // .pixel-box вешается рядом в шаблоне

        @include cw('sm') {
            flex: 0 0 auto;
            width: 100%;
        }
    }

    &__slider-viewport {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 10;
        overflow: hidden;
        background: c('default'); // letterbox-цвет под object-fit:contain
    }

    &__slider-wrapper {
        display: flex;
        flex-direction: row;
        height: 100%;
        // transform: translate3d(...) — пишет Swiper класс через CSS-vars / inline style

        &.grabbed {
            cursor: grabbing;
        }
    }

    &__slide {
        flex-shrink: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &__slide-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        // НЕ pixel-box на самом img — это контент
        pointer-events: none; // pointer events ловит .__slide (для click vs drag detection)
    }

    // ─── overlay controls ─────────────────────────────────────
    &__slider-arrow {
        position: absolute;
        top: 50%;
        translate: 0 -50%;

        width: 28px;
        height: 28px;
        padding: 6px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;

        background: c-rgba('default', 0);
        color: c('default-contrast');
        cursor: pointer;
        user-select: none;

        transition-property: background-color, opacity;
        transition-duration: 0.2s;
        transition-timing-function: ease-in-out;

        // .pixel-box вешается рядом

        &_prev { left: 10px; }
        &_next { right: 10px; }

        @media (hover: hover) {
            &:hover { background: c-rgba('default', 0.6); }
        }
        &:active { background: c-rgba('default', 0.8); }

        &.disabled {
            opacity: 0.3;
            pointer-events: none;
        }

        // скрыть стрелки во время drag
        .grabbed ~ &,
        .project__slider-wrapper.grabbed + & {
            opacity: 0;
        }
        // в шаблоне проще: при drag добавить класс на .project__slider — `.project__slider.dragging .project__slider-arrow { opacity: 0 }`.
        // Здесь зависит от того где Swiper кладёт `.grabbed`. См. open question.
    }

    &__counter {
        position: absolute;
        right: 10px;
        bottom: 10px;
        @include t(12px, 1, 'default-contrast');
        background: c-rgba('default', 0.6);
        padding: 2px 6px;
        // .pixel-box рядом
        pointer-events: none; // не должен ловить клик/драг
    }

    // ─── states ───────────────────────────────────────────────
    &__empty,
    &__error {
        width: 100%;
        aspect-ratio: 16 / 10;
        display: flex;
        align-items: center;
        justify-content: center;
        background: c('default');
    }

    &__empty-text,
    &__error-text {
        @include t(20px, 1, 'default-contrast');
        opacity: 0.6;
        text-align: center;
    }
}
```

**Замечания:**
- Все `transition-property` — inline-list, не shorthand (требование DESIGN.md §7).
- Все цвета — через `c()` / `c-rgba()`.
- Никаких `border-radius` / `box-shadow` / `gradient` / `@media` (только `cw('sm')` + `@media (hover: hover)` для disable hover на тач-устройствах — `(hover: hover)` это feature query, не viewport-query, так юзается в `.about__social-link` и `.shortcut`).
- `scrollbar-color: c('default-contrast') c('default-3')` — повторяет паттерн `.about`.

---

## 5. Project — States gallery

### `loading`

- **Trigger:** `windowOb.states.loading === true` (пока fetch images / meta идёт). Управляется window-уровнем, не компонентом.
- **Visible:** `WindowLoader` поверх всей area окна (pixel-spinner, см. `Window/Loader.vue`).
- **Component:** `.project` рендерится под loader'ом (loader z-index 999, opacity 1). Layout уже на месте, но не виден.
- **Стили:** `.project` без изменений; loader живёт по своим правилам (`window__loader.loading`).
- **Note:** не нужен отдельный `.project__loader` — переиспользуем существующий window-level loader.

### `empty` — нет картинок, есть meta

- **Trigger:** `images.length === 0 && meta != null`.
- **Visible:** `.project__meta` рендерится нормально. В `.project__slider` вместо `.project__slider-viewport` рендерится `.project__empty`.
- **Style differences:**
  ```
  .project__empty            — width:100%; aspect-ratio:16/10; display:flex; center+center;
                               background: c('default');
  .project__empty-text       — t(20px, 1, 'default-contrast'); opacity:0.6;
  ```
- **Текст:** «Картинок пока нет» (или схожий пиксельный pixie-stub).
- **Pixel-box:** `.project__slider` сохраняет pixel-box обёртку (рамка остаётся консистентной).

### `no-meta` — `project.json` отсутствует/пустой

- **Trigger:** `meta == null` (404 на project.json или пустой объект).
- **Visible:** `.project` получает класс `.no-meta`. `.project__meta` рендерит fallback:
  - `.project__title` — `entity.name` из FS (отображаемое имя папки).
  - `.project__year`, `.project__tags`, `.project__description`, `.project__links` — не рендерятся (v-if).
  - Опционально: `.project__path` (тот же стиль что `.project__year`) — показать `entity.path` (например `/projects/u24`) для дебага.
- **Slider:** работает как обычно, если `images.length > 0`. Иначе → `empty` state.
- **Style differences:** none (просто меньше элементов в meta).

### `error` — fetch упал

Два уровня:

**(a) window-level error** (manifest fetch failed, entity не нашлась):
- **Trigger:** `windowOb.states.error === true`.
- **Visible:** стандартный window-error UI (вне scope этого doc'а — общий для всех окон).
- **`.project`** не рендерится.

**(b) component-level partial error** (manifest ok, но `images/` listing упал ИЛИ `project.json` 500):
- **Trigger:** images-fetch error И meta-fetch error одновременно (если только один — проектируется как `no-meta` или `empty`).
- **Visible:** `.project__meta` показывает name+path fallback (как `no-meta`); `.project__slider` рендерит `.project__error` вместо viewport.
- **Style differences:**
  ```
  .project__error      — width:100%; aspect-ratio:16/10; flex; center; background:c('default');
  .project__error-text — t(20px, 1, 'default-contrast'); opacity:0.6;
  ```
- **Текст:** «Не удалось загрузить :(».

### `hover` на prev/next arrow

- **Trigger:** `:hover` (только когда `(hover: hover)` — touch-устройства не показывают hover).
- **Visible diff:** `.project__slider-arrow` background `c-rgba('default', 0)` → `c-rgba('default', 0.6)`.
- **Transition:** `background-color 0.2s ease-in-out` (см. SCSS).
- **Иконка:** не меняется (color остаётся `c('default-contrast')`).

### `active` (pointer down) на prev/next arrow

- **Trigger:** `:active` pseudo-class (mouse/touch press).
- **Visible diff:** `.project__slider-arrow` background → `c-rgba('default', 0.8)`.
- **Иконка:** не меняется.

### `drag-state` (pointer drag по слайдеру)

- **Trigger:** Swiper кладёт `.grabbed` на `.project__slider-wrapper` при `pointerdown` + движении (порог n px).
- **Visible diff:**
  - `.project__slider-wrapper.grabbed` — `cursor: grabbing`.
  - `.project__slider-arrow` — `opacity: 0` (скрываются на время драга — не отвлекают).
  - `.project__slide` — `cursor: grabbing` наследуется от wrapper.
- **Click vs drag:** Swiper сам различает; click без drag-сдвига → пробрасывает event на `.project__slide` → `onActivate` открывает `showcase` (открытие нового окна программы `showcase` с path этого slide.path).
- **Transition:** opacity arrows — `0.2s ease-in-out` (см. SCSS).

### `disabled` arrow (на крайнем слайде)

- **Trigger:** Vue-биндинг — `:class="{ disabled: !canPrev }"` / `{ disabled: !canNext }`. Не проигравшийся → стрелка получает `.disabled`.
- **Visible diff:** `opacity: 0.3; pointer-events: none;`.
- **Note:** альтернативный variant — полностью скрывать (`display:none`). Текущий выбор: dim+disable, чтобы layout не «прыгал».

### `slide-click` → opens showcase

- Клик по `.project__slide` (без drag) → emit / прямой вызов window-store: открыть программу `showcase` с targetFile = `slide.path`. Это behavior, не visual state — сам слайд визуально не меняется, новое окно открывается через стандартный window-spawn flow.

---

## 6. Showcase — Layout schema + sizes + states

### Layout

```
┌──────────────── .window__wrapper (pixel-box, c('default')) ────────────────┐
│  WindowHeader (стандартный)                                                  │
│  ─ name = entity.name (имя файла картинки)                                  │
│  ─ breadcrumbs / nav — стандартные                                           │
│ ┌─────── .showcase (flex, padding:10px, w:100%, h:100%) ───────────────────┐│
│ │                                                                          ││
│ │                  ┌─ .showcase__img ─┐                                    ││
│ │                  │                   │                                    ││
│ │                  │   <img>           │                                    ││
│ │                  │   max-w:100%      │                                    ││
│ │                  │   max-h:100%      │                                    ││
│ │                  │   object-fit:     │   (центрирована через flex)        ││
│ │                  │     contain       │                                    ││
│ │                  │                   │                                    ││
│ │                  └───────────────────┘                                    ││
│ │                                                                          ││
│ └──────────────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────────┘
```

Без боковых панелей. Один image-слот. Window header показывает `entity.name`.

### Sizes

| Token | Value |
|---|---|
| `.showcase` padding | `10px` |
| `.showcase` display | `flex` (`align-items:center; justify-content:center`) |
| `.showcase__img` max-width | `100%` |
| `.showcase__img` max-height | `100%` |
| `.showcase__img` object-fit | `contain` |
| `.showcase__img` `.pixel-box` | НЕТ (image — контент, не карточка) |
| Background | наследуется `c('default')` от `.window__wrapper` |

### Critical SCSS

```scss
.showcase {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    &__img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        display: block;
        // НЕ pixel-box — image это контент
    }

    &__error,
    &__empty-state {
        @include t(20px, 1, 'default-contrast');
        opacity: 0.6;
        text-align: center;
    }
}
```

### States

#### `loading`

- **Trigger:** `windowOb.states.loading === true` (window-level fetch entity).
- **Visible:** стандартный `WindowLoader` поверх. `.showcase` рендерится под loader.
- **Image native loading:** браузер показывает `<img>` progressive — ничего дополнительного делать не нужно (нет skeleton-spinner на самой картинке; window-loader покрывает первый paint).
- **Style differences:** ничего на `.showcase`.

#### `error` — broken image / 404

- **Trigger:** `<img>` `onerror` event ИЛИ entity-fetch failed (`windowOb.states.error`).
- **Window-level error** (entity не нашлась) — стандартный window-error UI.
- **Image-level error** (entity ok, image-URL даёт 404):
  - `.showcase__img` заменяется на `.showcase__error` (`v-if`).
  - **Style:**
    ```
    .showcase__error      — flex column center; gap:10px; pixel-style svg-stub icon (опц.);
    .showcase__error-text — t(20px, 1, 'default-contrast'); opacity:0.6;
    ```
  - **Текст:** «Картинка не загрузилась :(».
- **Альтернатива:** показать system fallback-иконку (SVG крестик в pixel-style) — open question.

---

## 7. Open questions

1. **`object-fit: cover` vs `contain`?** Текущий выбор — `contain` (preserves design composition, letterboxing на `c('default-3')`). Альтернатива: cover — agressively заполняет viewport, кропает края. Можно сделать опционально через `meta.imageFit?: 'cover' | 'contain'` в `project.json` → CSS-var `--project-image-fit` на `.project__slide-img`. Решить: оставить hardcoded `contain` или поддержать override.

2. **Aspect-ratio фиксированный `16/10` или адаптивный?** Сейчас все слайды нормированы к 16/10 (через container aspect-ratio + object-fit:contain). Альтернатива: aspect-ratio из `project.json` (`meta.aspectRatio?: string`) → CSS-var. Минус: разные слайды разной высоты ломают плавный slide-to-slide transition Swiper'а. Скорее всего оставить fixed, но обозначить.

3. **Error retry-button — где?** На `windowOb.states.error` уровне (стандартный window-error UI с retry, единый для всех программ) — или внутри `.project__error` локальный «Попробовать снова» button? Текущий выбор: window-level для total fail; component-level показывает только informative text без retry. Подтвердить.

4. **Mobile slider высота.** На `cw('sm')` слайдер уходит вниз через column-reverse. `.project__slider-viewport` сохраняет `aspect-ratio: 16/10` → высота = ширина_окна × 0.625. На очень узких окнах (300-400px ширина) это ~190-250px — возможно мало. Альтернатива: `min-height: 240px` в mobile или явный `height: 60vh` (но container queries не дают `cqh` для height-of-window здесь так просто). Открыто — нужен тест на реальных размерах окон.

5. **Keyboard navigation (←/→ → prev/next slide).** Out of scope этого design-doc или включаем? Если включаем — `tabindex="0"` на `.project__slider-viewport` + `@keydown.left/right`. Нет visual-change, но accessibility-impact. Решить scope.

6. **Selector для скрытия arrows во время drag.** В SCSS показан адъюэнт-селектор; на практике может быть проще: компонент сам ставит `.dragging` на `.project__slider` корне при pointerdown → `.project__slider.dragging .project__slider-arrow { opacity: 0 }`. Финальное решение зависит от того где Swiper-класс `.grabbed` действительно appears (на wrapper или на root). Implementation-level выбор.

7. **Showcase — `.pixel-box` обёртка вокруг img?** Текущий выбор: НЕТ (img free-floating). Альтернатива: `<div class="showcase__frame pixel-box">` с padding 10px на `c('default-3')` — даёт визуальную «рамку картины». Открыто; зависит от того как UX-feel должен быть (галерея vs full-screen).

8. **Tag click behavior?** Сейчас теги декоративные (без hover, без cursor:pointer). Если в будущем хочется фильтровать проекты по тегу из showcase — это новый flow. Скоупится отдельно.

9. **Long meta.description scroll.** `.project__meta` имеет `overflow-y: auto`. На длинном description meta-панель прокручивается — slider остаётся на месте. Это desired behavior. Подтвердить.

10. **`no-meta` — показать ли `entity.path` как debug-info?** Сейчас в спеке упомянуто опционально. По умолчанию — не показывать (юзер видит только заголовок-name). Решить.

---

## Приложение — sanity-check vs DESIGN.md don't list

| Don't | Use |
|---|---|
| ❌ `border-radius` | Все «округления» — через `.pixel-box` mask |
| ❌ Градиенты, `box-shadow` | Не используются |
| ❌ `rem`, `em` | Все размеры — `px` |
| ❌ `<style scoped>` | Глобальный `<style lang="scss">` + BEM |
| ❌ Inline-стили | Только CSS-vars при необходимости (Swiper transform пишет inline transform — это OK, аналог `bounds`-store) |
| ❌ Ad-hoc `font-family` | Только `t()` миксин или `font-family: $t-default;` |
| ❌ Hex/rgb в SCSS | Все цвета через `c()` / `c-rgba()` |
| ❌ `@media (width)` | Только `cw('sm')`. `@media (hover: hover)` — feature query, разрешено (юзается в `.about`) |
| ✅ Карточные контейнеры с `.pixel-box` | `.project__meta`, `.project__slider`, `.project__tag`, `.project__slider-arrow`, `.project__counter` — все pixel-box. `.project__slide-img` и `.showcase__img` — НЕ pixel-box (это контент) |
| ✅ Transitions `0.3s ease-in-out` дефолт | Используются: `0.2s` для color (links, arrow bg) — как в `.about__social-link` |

---

Конец спецификации.
