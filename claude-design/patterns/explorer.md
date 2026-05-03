# Pattern: Explorer

Программа «Проводник» — главный навигатор по виртуальной FS портфолио. Используется как UI для programType `explorer` и как компонент-заглушка для `project`/`tproject` (последнее — временно, до реализации страниц проектов).

## Файлы

- `app/components/Programs/Explorer/index.vue` — корневой layout.
- `app/components/Programs/Explorer/List.vue` — правая панель со списком ярлыков.
- `app/components/Programs/Explorer/Nav/index.vue` — левая навигация (дерево папок верхнего уровня).
- `app/components/Programs/Explorer/Nav/Facts.vue` — карточка с фактами (нижняя часть левой панели).
- `app/components/Programs/Explorer/Nav/shortcut.vue` — nav-вариант ярлыка.
- `app/components/Programs/Explorer/shortcut.vue` — list-вариант ярлыка (тонкая обёртка над `Shortcut/Base.vue`).
- `app/programs/explorer.ts` — registry-запись.

## Layout

```
.explorer  (display:flex; gap:10px; width:100%; height:100%)
├── .explorer__left           (200px nav + facts; @include cw('md') { display:none })
│   ├── ProgramsExplorerNav (если canNavigate)
│   └── <ClientOnly> ProgramsExplorerNavFacts
└── ProgramsExplorerList
    └── .explorer__content    (pixel-box; background:default-3; padding:10px; overflow-y:auto)
        ├── ProgramsExplorerShortcut v-for items
        └── .explorer__empty  (если items пусто)
```

В узких окнах (< 768px) левая панель скрывается через container query, и пользователь видит только список — навигация уходит в breadcrumbs window-header'а.

## Данные

```typescript
const { data } = await useAsyncData<FsFile[]>(
    () => `explorer-${windowRoute.value}`,
    async () => {
        if (!windowRoute.value) return [];
        return await $fetch<FsFile[]>('/api/filesystem/list', {
            query: { path: windowRoute.value },
        }) ?? [];
    },
    { server: true, immediate: true, transform: (d) => d ?? [], default: () => [] },
);
```

`/api/filesystem/list` возвращает `FsFile[]` — детей текущего пути. Сервер использует `loadManifest()` + `findNode()`.

## ProgramConfig

```typescript
{
    id: 'explorer',
    label: 'Проводник',
    config: { showBreadcrumbs: true, canNavigate: true },
}
```

`canNavigate` отключает Nav (используется в режимах, где навигация не нужна — например, программа `project` в будущем покажет только слайдер).

## BEM-имена

- `.explorer` — корень
- `.explorer__left` — боковая панель
- `.explorer__content` — список (получает `pixel-box`)
- `.explorer__empty` — пустое состояние ("Тут ничего нет :(") — `font-family: $t-default;` 40px

## Стили

```scss
.explorer {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    gap: 10px;

    &__left {
        width: 200px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;

        @include cw('md') {
            display: none;
        }
    }

    &__content {
        background: c('default-3');
        height: 100%;
        padding: 10px;
        overflow-y: auto;
        overflow-x: hidden;
    }

    &__empty {
        font-family: $t-default;
        font-size: 40px;
        line-height: 100%;
        color: c('default-contrast');
    }
}
```

## Расширение

- Новая программа на основе Explorer-layout — собрать свой компонент в `app/components/Programs/<Name>/`, использовать собственный layout. Не наследоваться от `Programs/Explorer/index.vue` напрямую.
- Чтобы скрыть Nav для своей программы — выставить `config.canNavigate = false`.
- Чтобы скрыть breadcrumbs — `config.showBreadcrumbs = false`.
