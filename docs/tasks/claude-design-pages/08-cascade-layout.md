# Task 08: cascade-layout

## Goal
Layout-режимы для множественных code-окон: cascade (артборд S — окна стопкой со сдвигом) и tile-h (артборд T — два рядом). Открытие проекта с `codeWindows.json` спавнит N окон в указанном layout. Plus disable html-to-image preview для programType=code (taskbar показывает icon).

## Files (touch only)
- `app/components/Programs/Code/Cascade.vue` (новый, ~80 LOC) — orchestrator (используется как deeplink-driven спавнер).
- `app/composables/useCascadeLayout.ts` (новый, ~60 LOC) — pure offset calc + sequential spawn helper.
- `app/utils/constants/cascade.ts` (новый, ~10 LOC) — offset values.
- `app/stores/bounds.ts` (+ ~20 LOC) — helper `nextCascadePosition(prevBounds, idx)`.
- `app/composables/useWindowPreview.ts` (+ ~5 LOC) — skip preview if `programType === 'code'`. **Если файл существует** — внести изменение. Если нет — упомянуть в `## Notes` task 08 как future PR.
- `tests/unit/cascade/Cascade.spec.ts` (новый, ~50 LOC).
- `tests/unit/cascade/useCascadeLayout.spec.ts` (новый, ~50 LOC).

**Total LOC**: ~275 across 7 files. Каждый ≤150.

## Dependencies
- Tasks: 01 (types), 02 (endpoint), 07 (code program).
- Reads (без изменений):
  - `app/stores/bounds.ts`, `focus.ts`, `windows.ts` — current store API.
  - `app/components/Window/composables/useCreateAndRegisterWindow.ts` — single-window spawn.
  - артборды S (cascade), T (tile-h).
  - `claude-design/styles/dimonya-os.css` `.code-cascade__win` styles.

## Steps

### Шаг 1 — `cascade.ts` constants
```ts
// app/utils/constants/cascade.ts
export const CASCADE_OFFSET_X = 24;
export const CASCADE_OFFSET_Y = 14;
export const CASCADE_INITIAL_BOUNDS = { width: 900, height: 620 };
export const TILE_H_GAP = 16;
```

### Шаг 2 — `useCascadeLayout.ts`
```ts
export type CascadeLayout = 'cascade' | 'tile-h';

export function useCascadeLayout() {
  const boundsStore = useBoundsStore();
  const windowsStore = useWindowsStore();

  function computeBounds(layout: CascadeLayout, idx: number, viewport: { w: number; h: number }) {
    if (layout === 'tile-h') {
      const half = (viewport.w - TILE_H_GAP) / 2;
      return {
        x: idx === 0 ? 0 : half + TILE_H_GAP,
        y: 0,
        width: half,
        height: viewport.h,
      };
    }
    // cascade
    return {
      x: CASCADE_OFFSET_X * idx,
      y: CASCADE_OFFSET_Y * idx,
      width: CASCADE_INITIAL_BOUNDS.width,
      height: CASCADE_INITIAL_BOUNDS.height,
    };
  }

  async function spawnCodeWindows(
    parentEntityPath: string,
    codeWindows: { id: string; layout?: CascadeLayout }[],
  ) {
    const layout: CascadeLayout = codeWindows[0]?.layout ?? 'cascade';
    const viewport = useContentAreaStore().area;
    for (let i = 0; i < codeWindows.length; i++) {
      const cw = codeWindows[i]!;
      const bounds = computeBounds(layout, i, viewport);
      const path = `${parentEntityPath}/code/${cw.id}`;
      await useCreateAndRegisterWindow(path, { initialBounds: bounds });
      // sequential await — последнее окно получает focus естественно
    }
  }

  return { computeBounds, spawnCodeWindows };
}
```

### Шаг 3 — `bounds.ts` helper (Pinia store)
Добавить action:
```ts
nextCascadePosition(prevId: string | null): { x: number; y: number } {
  if (!prevId) return { x: 0, y: 0 };
  const prev = this.byId[prevId];
  if (!prev) return { x: 0, y: 0 };
  return { x: prev.x + CASCADE_OFFSET_X, y: prev.y + CASCADE_OFFSET_Y };
}
```

(Используется только при ad-hoc спавне follow-up окон, не в первой волне cascade. Optional — можно выбросить если `useCascadeLayout` достаточно.)

### Шаг 4 — `Cascade.vue`
Не визуальный компонент — orchestrator (или альтернативно — composable; решение: SFC чтобы Nuxt pages-driven mounting было предсказуемым). Используется в редком кейсе deep link `/projects/<slug>/code-cascade` (см. routing ниже).

```vue
<script setup lang="ts">
const props = defineProps<{ entityPath: string }>();
const { data } = useFetch('/api/filesystem/content', {
  query: { path: props.entityPath }, key: () => `content:${props.entityPath}`, server: true,
});
const { spawnCodeWindows } = useCascadeLayout();

watchEffect(() => {
  const codeWindows = data.value?.codeWindows;
  if (codeWindows && codeWindows.length > 0) {
    spawnCodeWindows(props.entityPath, codeWindows);
  }
});
</script>

<template>
  <div class="cascade-orchestrator" />
</template>
```

> **Альтернативное решение**: cascade-логика в `useCreateWindowByPath` — если path matches `<entity>` И entity.codeWindows непустой → открыть один project window + N code windows. Без отдельного `Cascade.vue`. **Решение**: предпочитаю trigger из existing flow (open-with-children pattern), Cascade.vue как fallback компонент для programmatic invocation. Final API определяется в начале impl.

### Шаг 5 — `useWindowPreview` skip для code
**Pre-check**: верифицировать что `app/composables/useWindowPreview.ts` существует. Если да — добавить early return:
```ts
if (windowOb.programType === 'code') {
  // taskbar shows icon, no html-to-image preview
  return null;
}
```
Если файл не существует — TODO note в task 08, отдельный PR.

### Шаг 6 — `Cascade.spec.ts`
- `useCascadeLayout.computeBounds('cascade', 0, ...)` → `{ x: 0, y: 0, ... }`.
- `useCascadeLayout.computeBounds('cascade', 2, ...)` → `{ x: 48, y: 28, ... }`.
- `useCascadeLayout.computeBounds('tile-h', 0, { w: 1200, h: 800 })` → `{ x: 0, y: 0, width: 592, height: 800 }`.
- `useCascadeLayout.computeBounds('tile-h', 1, { w: 1200, h: 800 })` → `{ x: 608, y: 0, width: 592, height: 800 }`.
- `spawnCodeWindows` mock — sequential await order verified, focus at last window.

## Success criteria
- Открытие entity с `codeWindows.json` (после task 10 fixture) — спавнит N code-окон в правильном layout.
- Cascade: окна со сдвигом 24px×14px, последнее на топе.
- Tile-h: 2 окна делят viewport horizontally с gap 16px.
- Focus race resolved: последнее окно из массива оказывается focused (sequential await).
- Taskbar для code-окна показывает icon, не превью (если useWindowPreview обновлён).

## Verify
```bash
cd /usr/projects/portfolio-new
bun run typecheck && bun run lint
bun run test:unit -- cascade
bun run test:e2e -- cascade  # task 09
```

## Acceptance test
Unit (computeBounds math + sequential spawn) + e2e (visual cascade в Playwright) + manual против артбордов S, T.

## Notes
- LOC ≤ 150 per file.
- `noUncheckedIndexedAccess`:
  - `codeWindows[i]!` — обязателен `!` ИЛИ `const cw = codeWindows[i]; if (!cw) continue;`. Prefer guard, не `!`.
  - `this.byId[prevId]` — `WindowBounds | undefined` → guard.
- SSR-safe:
  - `Cascade.vue` — `useFetch` SSR-aware.
  - `spawnCodeWindows` зовётся только client-side (требует mounting), `watchEffect` — но `useCreateAndRegisterWindow` сам должен быть SSR-safe (verified в existing usage).
- ESLint:
  - Magic numbers (`24`, `14`, `16`) — все в `app/utils/constants/cascade.ts` (RULES.md §4.3).
  - Никаких `setTimeout` (sequential await через Promise).
  - State (`stores/bounds.ts` action) — pure mutation, не транзиентный UI state.
- **Race condition**: `useCreateAndRegisterWindow` — predictable promise. Sequential `for...of` + `await` гарантирует порядок. Тест mock'ает `useCreateAndRegisterWindow` returning `Promise.resolve()` с tracked args.
- **Focus store**: `focus` обновляется внутри `useCreateAndRegisterWindow` (existing behavior). После `await` последнего окна — focus уже установлен на нём естественно.
- **Z-index** управляется existing `focus` store (last focused = top через CSS `z-index` из focus-rank). Cascade не вмешивается в z-index напрямую.

## Backward-compat
- `bounds.ts` — добавление action не ломает существующие consumers.
- `useCreateAndRegisterWindow` — sig не меняется (initialBounds opt уже поддерживается, см. existing usage в `useAppBootstrap`).
- `app/programs/code.ts` — single code-window opening still works (без cascade-orchestrator).

## Out of scope
- Z-index перестраивание при focus change (existing behavior достаточно).
- User dragging cascade-окон в layout-mode (cascade — initial spawn position, после drag — обычное free-floating).
- `tile-h` динамическое resize (split-pane) — beyond MVP.
