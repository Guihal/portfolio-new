# PR-E — TaskbarTooltipItem migrate to useTooltipPosition

## Context

После P8-17 (716b003 — `merge(P8-17): tooltip positioning composable`) `useTooltipPosition` был извлечён как pure composable, но `TaskbarTooltipItem.vue` остался с inline-копией той же логики. Дублирование: 2 ResizeObserver'а на тех же элементах, та же логика измерений + позиционирования. DRY-нарушение + лишние observers + лишние reactive subscriptions.

## Цель

Заменить inline-логику в `TaskbarTooltipItem.vue` на вызов `useTooltipPosition`. Functional parity: tooltip ведёт себя 1:1 как раньше.

## Файлы

- `app/components/TaskbarTooltipItem.vue` — заменить inline implementation на `useTooltipPosition`-вызов.

## Изменение

**Before** (текущее, [app/components/TaskbarTooltipItem.vue:14-43](app/components/TaskbarTooltipItem.vue)):

```ts
const tooltip = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);

const tooltipBounds = ref<DOMRect | null>(null);
const contentBounds = ref<DOMRect | null>(null);

const setTooltipBounds = () => {
    if (!tooltip.value) return;
    tooltipBounds.value = tooltip.value.getBoundingClientRect();
};
const setContentBounds = () => {
    if (!content.value) return;
    contentBounds.value = content.value.getBoundingClientRect();
};

useResizeObserver(tooltip, setTooltipBounds);
useResizeObserver(content, setContentBounds);

const { area: contentArea } = storeToRefs(useContentAreaStore());
const { cancelHide, hide } = useTooltipState();

const maxWidth = computed(() => contentArea.value.width);

const position = computed(() =>
    positionTooltip({
        target: props.containerBounds,
        tooltip: tooltipBounds.value,
        viewportWidth: contentArea.value.width,
    }),
);
```

**After**:

```ts
const tooltip = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);

const { top, left, contentBounds, maxWidth } = useTooltipPosition(
    tooltip,
    content,
    () => props.containerBounds,
);

const { cancelHide, hide } = useTooltipState();
```

`useTooltipPosition` (см. [app/components/Taskbar/Elements/Program/useTooltipPosition.ts](app/components/Taskbar/Elements/Program/useTooltipPosition.ts)) уже:
- наблюдает оба ref'а через `useResizeObserver`,
- хранит tooltipBounds/contentBounds в собственных refs,
- читает `contentArea.width`,
- возвращает computed { top, left, contentBounds, maxWidth }.

Template binding изменится с `position.top / position.left` на `top / left` (это уже computed'ы из composable):

```html
<div
    ref="tooltip"
    :style="{
        '--top': top,
        '--left': left,
        '--mxw': maxWidth,
        '--c-w': contentBounds?.width ?? 0,
    }"
    ...
```

Удалить unused imports после миграции:
- `storeToRefs` (не нужен — composable сам читает store)
- `positionTooltip` (composable вызывает)
- `useContentAreaStore` (composable хвостит)

## Edge cases

- `props.containerBounds` приходит как `DOMRect | null` prop. `useTooltipPosition` принимает `MaybeRefOrGetter<DOMRect | null>` — передаём геттер `() => props.containerBounds` чтобы reactivity на смену prop работала.
- Style binding имена `--top/--left` — number-only (px-формула в SCSS). `top/left` из composable = `computed<number>` (см. positionTooltip return type). Должно работать как `position.top` ранее.
- TypeScript strict + noUncheckedIndexedAccess: возврат composable строго типизирован. Без any.
- Container query / breakpoints / SCSS — не трогаем.

## Тесты

- `bun run test:unit` — pass без регрессий. Тест на TaskbarTooltipItem может не существовать; positionTooltip тестируется через service `tooltipState`.
- `bun run typecheck` clean.
- `bun run biome:check` clean.
- `bun run lint` clean (no new warnings).

## Приёмка

- [ ] Inline `tooltipBounds/contentBounds` refs удалены.
- [ ] `setTooltipBounds/setContentBounds` функции удалены.
- [ ] Два `useResizeObserver(...)` вызова удалены (composable их инкапсулирует).
- [ ] `position` computed удалён, заменён на destructure из composable.
- [ ] `maxWidth` computed удалён, взят из composable.
- [ ] Template style binding обновлён: `--top: top, --left: left` (без `position.`).
- [ ] Unused imports очищены: `storeToRefs`, `positionTooltip`, `useContentAreaStore`.
- [ ] Functional parity: tooltip позиционируется 1:1 как раньше (manual visual check + smoke test).
- [ ] LOC reduction: SFC должен сократиться с ~95 до ~50-60 LOC.
- [ ] `bun run typecheck` clean.
- [ ] `bun run biome:check` clean.
- [ ] `bun run lint` clean.
- [ ] `bun run test:unit` PASS без регрессий.

## Architectural note

Pure DRY cleanup. Logic уже extract'нут в composable; этот PR закрывает migration debt от P8-17. Side-benefit: 2 fewer ResizeObservers per tooltip instance.
