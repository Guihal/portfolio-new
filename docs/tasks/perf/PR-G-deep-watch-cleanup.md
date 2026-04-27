# PR-G — Drop redundant deep watcher in Taskbar Program element

## Context

`Taskbar/Elements/Program/index.vue:29-33` имеет watcher на `windowObs` prop с `{ deep: true }`:

```ts
watch(
    () => windowObs,
    (obs) => updateWindowObs(programType, obs),
    { deep: true },
);
```

После PR-A AllPrograms.vue потребляет `byProgramMap` напрямую. Этот getter (`app/stores/windows.ts:28-38`) пересоздаёт `Map<ProgramType, WindowOb[]>` с новыми array-инстансами на каждый recompute. Identity массива `windowObs` меняется при любой mutation окон → shallow `() => windowObs` watch уже ловит change. `{ deep: true }` заставляет Vue делать full tree-traversal по объектам внутри array (в т.ч. reactive `WindowOb`-полям) на каждое изменение — лишняя работа.

## Цель

Убрать `{ deep: true }` flag. Сохранить triggering на изменение состава массива (add/remove window).

## Файлы

- `app/components/Taskbar/Elements/Program/index.vue` — drop `{ deep: true }`.

## Изменение

**Before** ([app/components/Taskbar/Elements/Program/index.vue:29-33](app/components/Taskbar/Elements/Program/index.vue)):

```ts
watch(
    () => windowObs,
    (obs) => updateWindowObs(programType, obs),
    { deep: true },
);
```

**After**:

```ts
watch(
    () => windowObs,
    (obs) => updateWindowObs(programType, obs),
);
```

## Reasoning

- **PR-A guarantee**: `byProgramMap` recomputes полностью пересобирают Map + arrays на каждое window mutation. `windowObs` prop получает новый array-instance per parent re-render.
- **Vue watch semantics**: shallow watch fires когда ref-getter возвращает другое значение по `===`. Array identity change → fire.
- **`updateWindowObs`** в `services/tooltipState.ts` принимает массив; его контракт зависит от **состава** массива, а не от внутренних property-changes окон. Внутренние мутации (state.drag и т.п.) не должны триггерить tooltip update — это шум.
- **Deep watch cost**: O(N × M) где N = окон, M = глубина reactive tree (states + targetFile + file). Каждая прокладка watch фигнёй.

## Edge cases

- **Парент НЕ меняет array identity, только толкает в существующий**: post-PR-A это исключено — `byProgramMap` всегда rebuilt fresh. Пред-PR-A путь (legacy) удалён.
- **Mutation `WindowOb.states.collapsed`** (например): shallow watch НЕ fires — это правильное поведение, такие изменения tooltip ассистенту не интересны.
- **Add/remove window**: parent rebuilds Map → новый array → `()=>windowObs` getter возвращает новое значение → fires.

## Тесты

- `bun run test:unit` — все тесты pass.
- `bun run typecheck` clean.
- Manual smoke: открыть 2+ окна одного типа → tooltip показывает оба → закрыть одно → tooltip обновляется → drag окно → tooltip остаётся стабильным (не дёргается).

## Приёмка

- [ ] `{ deep: true }` flag удалён из watch на `windowObs`.
- [ ] Никакие другие watcher'ы / handlers не тронуты.
- [ ] `bun run typecheck` clean.
- [ ] `bun run biome:check` clean.
- [ ] `bun run lint` clean.
- [ ] `bun run test:unit` PASS без регрессий.
- [ ] SFC ≤ 150 LOC (сейчас ~76 — окей).

## Architectural note

Тривиальная очистка после PR-A. Single-line change.
