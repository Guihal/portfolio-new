# Pattern: Shortcut

Generic ярлык-карточка с тремя визуальными вариантами. Один компонент, три варианта рендера → используется на десктопе (Workbench), в списке (Explorer), в навигации (Explorer Nav).

## Файлы

- `app/components/Shortcut/Base.vue` — generic компонент.
- `app/components/Workbench/Shortcut/index.vue` — desktop-вариант (`variant="desktop"`).
- `app/components/Programs/Explorer/shortcut.vue` — list-вариант (`variant="list"`).
- `app/components/Programs/Explorer/Nav/shortcut.vue` — nav-вариант (`variant="nav"`).
- `app/composables/useGetShortcut.ts` — резолв иконки/имени/registered-флага по `FsFile`.
- `app/utils/getClickShortcutEvent.ts` — `dblclick` на десктопе, `click` на мобильных (через `useIsMobile`).

## Props

```typescript
defineProps<{
    file: FsFile;
    variant: 'desktop' | 'list' | 'nav';
    onActivate?: () => void;
}>();

defineSlots<{
    icon?: () => VNode;   // override для иконки
}>();
```

`useGetShortcut(file)` возвращает `{ icon, name, isRegistered }` — иконка SVG из programs registry, имя из `entity.json`, флаг наличия в реестре. Для незарегистрированных типов — fallback-иконка.

## Варианты

### `variant="desktop"`

Используется на Workbench (главном экране). Большая иконка по центру, label под ней. Открывается двойным кликом (одинарным на мобилке).

### `variant="list"`

В Explorer — компактный ряд "иконка слева + текст справа". Открывается одинарным кликом.

### `variant="nav"`

В Explorer Nav — узкий ряд с иконкой и сокращённым лейблом. Используется в боковой панели для быстрого перехода.

## BEM-имена

- `.shortcut` — корень
- `.shortcut__icon` — обёртка иконки
- `.shortcut__label` — текст, использует `font-family: $t-default;` (PixCyrillic)
- Модификаторы вариантов через `class="shortcut shortcut--<variant>"`.

## Активация

```typescript
import { getClickShortcutEvent } from '~/utils/getClickShortcutEvent';

const eventName = getClickShortcutEvent();   // 'dblclick' | 'click'
```

Затем `@[eventName]="onActivate"` в шаблоне (через `:on="{ [eventName]: onActivate }"`).

## Регистрация новой программы → новый shortcut

1. Добавить `app/programs/<name>.ts` (icon + label + component + config).
2. Добавить тип в `ProgramType` (`shared/types/filesystem.ts`).
3. Добавить ключ в `REGISTRY` (`app/programs/index.ts`).
4. `useGetShortcut(file)` автоматически найдёт новую программу и подставит её иконку для любого `entity.programType === '<name>'`.

Если нужен новый `variant` — добавить ветку в `Shortcut/Base.vue`, не делать форк компонента.

## Стили (выдержки)

```scss
.shortcut {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s ease-in-out;

    &__label {
        font-family: $t-default;
        color: c('default-contrast');
    }

    &--desktop {
        flex-direction: column;
        gap: 4px;
        padding: 6px;
    }

    &--list {
        gap: 8px;
        padding: 4px 6px;
    }

    @media (hover: hover) {
        &:hover { background-color: c-rgba('main', 0.4); }
    }

    &.active { background-color: c-rgba('main', 0.6); }
}
```
