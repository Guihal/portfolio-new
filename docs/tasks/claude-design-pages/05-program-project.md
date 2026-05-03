# Task 05: program-project (rewrite)

## Goal
Переписать программу `project` под новый дизайн: slider картинок + meta-panel (title, year, tags, description, links). Mobile (`cw('sm')`) — column-reverse через container queries. States: empty, error, drag, disabled-arrows. Источник дизайна — артборды A–J в `claude-design/Project + Showcase.html`.

## Files (touch only)
- `app/programs/project.ts` (rewrite, ~30 LOC).
- `app/components/Programs/Project/index.vue` (новый, ~80 LOC total: script ≤30, template ≤40, style ≤10).
- `app/components/Programs/Project/Slider.vue` (новый, ~120 total: script ≤50, template ≤40, style ≤30).
- `app/components/Programs/Project/Meta.vue` (новый, ~80 total).
- `app/components/Programs/Project/composables/useProjectData.ts` (новый, ~60 LOC) — useFetch wrapper.
- `app/components/Programs/Project/composables/useSliderState.ts` (новый, ~80 LOC) — current/total/disabled-arrows.
- `app/components/Programs/Project/composables/useSliderDrag.ts` (новый, ~80 LOC) — pointer events, dragging class.
- `tests/unit/programs/project/Slider.spec.ts` (новый, ~60 LOC).
- `tests/unit/programs/project/Meta.spec.ts` (новый, ~50 LOC).

**Total LOC**: ~640 across 9 files. Каждый файл ≤150.

> **Если existing `app/programs/project.ts` или связанный компонент уже есть** — `git mv` в `app/components/Programs/Project/_legacy/` и удалить в финальном commit'е после approve. **НЕ** оставлять dead code в репо.

## Dependencies
- Tasks: 01 (types), 02 (endpoint), 03 (manifest), 04 (migration).
- Reads (без изменений):
  - `app/programs/index.ts` — REGISTRY pattern.
  - `app/programs/about.ts`, `explorer.ts`, `tproject.ts` — pattern reference.
  - `app/components/Window/composables/useFetchEntity.ts` — pattern для fetch.
  - `app/composables/useViewportObserver.ts` — pattern для container observer (если нужен).
  - `app/assets/scss/mixins.scss` — `cw`, `ch`, `cwh`, `t()`.
  - `app/assets/scss/vars.scss` — `c('default')`, `c('default-2')` palette.
  - `claude-design/Project + Showcase.html` (артборды A–J), `claude-design/styles/dimonya-os.css` (для CSS-измерений).

## Steps

### Шаг 1 — REGISTRY entry `app/programs/project.ts`
```ts
import type { ProgramView } from './index';
import ProjectComponent from '~/components/Programs/Project/index.vue';
import projectIcon from '~/assets/icons/programs/project.svg?raw';

export default <ProgramView>{
  id: 'project',
  label: 'Проект',
  icon: projectIcon,
  component: ProjectComponent,
  config: { showBreadcrumbs: true, canNavigate: true },
};
```

### Шаг 2 — `useProjectData.ts`
```ts
export function useProjectData(path: MaybeRefOrGetter<string>) {
  const { data, pending, error, refresh } = useFetch('/api/filesystem/content', {
    query: { path: toRef(() => toValue(path)) },
    key: () => `content:${toValue(path)}`,
    server: true,
  });
  return { data, pending, error, refresh };
}
```

### Шаг 3 — `useSliderState.ts`
- `current` ref (`number`).
- `total` computed (`images.value?.length ?? 0`).
- `prevDisabled` (`current === 0`).
- `nextDisabled` (`current === total - 1 || total === 0`).
- `next()`, `prev()`, `goto(i)`.
- Reset `current = 0` когда `path` меняется (watch).

### Шаг 4 — `useSliderDrag.ts`
- `pointerdown` → start tracking.
- `pointermove` → diff > threshold (40px) → toggle `dragging` ref to `true`.
- `pointerup` → if dragging — определить direction (left → next, right → prev) → call `next/prev`. Reset `dragging`.
- Touch + mouse через PointerEvents.
- `<300ms` + small movement = treat as click (don't trigger nav).
- DOM events — composable вешает listeners на ref'у, `onUnmounted` cleans up.

### Шаг 5 — `Slider.vue`
```vue
<script setup lang="ts">
defineProps<{ images: string[]; current: number; total: number; prevDisabled: boolean; nextDisabled: boolean }>();
const emit = defineEmits<{ next: []; prev: []; goto: [n: number] }>();
const root = ref<HTMLElement>();
const { dragging } = useSliderDrag(root, () => emit('next'), () => emit('prev'));
</script>

<template>
  <div ref="root" class="project__slider pixel-box" :class="{ dragging }">
    <NuxtImg v-if="images[current]" :src="images[current]" class="project__slide" />
    <div v-else class="project__empty"><div class="project__empty-text">Картинок пока нет</div></div>
    <div v-if="!dragging" class="project__nav">
      <button :disabled="prevDisabled" @click="emit('prev')">←</button>
      <span>{{ current + 1 }} / {{ total }}</span>
      <button :disabled="nextDisabled" @click="emit('next')">→</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.project__slider { ... }
@include cw('sm') { /* mobile-specific */ }
</style>
```

States:
- `images.length === 0` → `.project__empty`.
- error в caller (`index.vue`) → `<div class="project__error">Не удалось загрузить :(</div>`.
- `.dragging` class на root → скрывает `.project__nav` через `&.dragging .project__nav { display: none }`.
- `disabled` на arrows — из props.

### Шаг 6 — `Meta.vue`
Props:
```ts
defineProps<{
  title: string;
  year?: string;
  tags?: string[];
  description?: string;
  links?: { label: string; href: string }[];
  fallbackPath?: string;  // показывается dim если нет meta (артборд F)
}>();
```

Template — структура по артборду E (meta-rich):
- `<h1 class="project__title">{{ title }}</h1>`.
- `<div class="project__year" v-if="year">{{ year }}</div>` иначе `<div class="project__year" style="opacity:0.4">{{ fallbackPath }}</div>` (артборд F).
- `<ul class="project__tags" v-if="tags?.length">` — `<li>` per tag.
- `<p class="project__description" v-if="description">{{ description }}</p>` — long description scrolls (артборд D), `overflow-y: auto`.
- `<ul class="project__links" v-if="links?.length">` — `<li><a :href="link.href" :target="link.href.startsWith('http') ? '_blank' : '_self'" rel="noopener">{{ link.label }}</a></li>`.

### Шаг 7 — `index.vue` (orchestrator)
```vue
<script setup lang="ts">
const window = useInjectWindow();  // existing composable
const path = computed(() => window.path);
const { data, pending, error } = useProjectData(path);

const images = computed(() => data.value?.images ?? []);
const entity = computed(() => data.value?.entity);
const sliderState = useSliderState(images);
</script>

<template>
  <div class="project">
    <Meta
      :title="entity?.name ?? path"
      :year="entity?.year"
      :tags="entity?.tags"
      :description="entity?.description"
      :links="entity?.links"
      :fallback-path="path"
    />
    <Slider
      v-if="!error"
      :images="images"
      :current="sliderState.current.value"
      :total="sliderState.total.value"
      :prev-disabled="sliderState.prevDisabled.value"
      :next-disabled="sliderState.nextDisabled.value"
      @next="sliderState.next"
      @prev="sliderState.prev"
      @goto="sliderState.goto"
    />
    <div v-else class="project__error pixel-box">
      <div class="project__error-text">Не удалось загрузить :(</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.project { display: flex; gap: 16px; height: 100%; }
@include cw('sm') {
  .project { flex-direction: column-reverse; }  // mobile reverses meta+slider
}
</style>
```

### Шаг 8 — Tests
- `Slider.spec.ts`: render, click next/prev triggers emit, disabled state корректно, empty state когда `images.length === 0`.
- `Meta.spec.ts`: render с full meta, рендер без year (показывает fallback-path dim), tag click пока декоративен (не emit), long description scrolls (`overflow-y: auto` стиль присутствует).

## Success criteria
- `/projects/u24` (после migration task 04) рендерит project window: meta-panel слева/сверху, slider справа/снизу, корректные данные.
- Resize окна на narrow (`cw('sm')` сработал) — column-reverse активен.
- Slider → next/prev переключает картинку. На первом — prev disabled. На последнем — next disabled.
- Drag (mouse + touch) переключает картинку, при drag arrows скрыты.
- Empty state (`images === []`) показывает «Картинок пока нет».
- Error state (`useFetch.error`) показывает «Не удалось загрузить :(».
- Long description (artbord D) — meta scrolls, slider не двигается.
- Hydration: SSR HTML идентичен client после mount (no console mismatch warning).

## Verify
```bash
cd /usr/projects/portfolio-new
bun run typecheck && bun run lint && bun run biome:check
bun run test:unit -- programs/project
bun run test:e2e -- project-window  # после task 09
```

## Acceptance test
Unit (Slider, Meta) + e2e (project-window.spec.ts в task 09) + manual visual diff против `claude-design/Project + Showcase.html` артборды A–J.

## Notes
- LOC ≤ 150 per file. Pre-split на 3 SFC + 3 composables гарантирует.
- `noUncheckedIndexedAccess`:
  - `images[current]` → `string | undefined` → `v-if="images[current]"` guard.
  - `entity?.tags` → `string[] | undefined` → `tags?.length` guard.
  - В `useSliderState` — `total.value === 0` early return для disabled state.
- SSR-safe: `useFetch` в `useProjectData` — Nuxt-aware. Никакого `window`/`document` в `<script setup>` без `import.meta.client` guard. Pointer events — внутри `useSliderDrag`, который attach'ится в `onMounted`.
- ESLint:
  - `vue/no-v-html` — обязательно (`v-text` или mustache).
  - `$fetch` в SFC запрещён (RULES.md §5) — используем `useFetch` через composable, тоже ok т.к. в composable, не в SFC `<script setup>` напрямую.
  - `setTimeout` для drag threshold — нет; drag-classes через CSS ::active или Vue ref.
- Container queries: `@container window` — root `Window/index.vue` уже выставляет `container-type: inline-size` (verified в текущей архитектуре). Slider использует `@include cw('sm') { ... }` напрямую.
- `@nuxt/image` `<NuxtImg>` для картинок — handles lazy + responsive. Source = URL из `images[]`.
- Pure compute (`useSliderState` total/disabled calculations) — internal к composable, не нуждается в `app/services/`. Rule §4.2: ≥10 LOC pure (no Vue/DOM) → service. `useSliderState` использует Vue `ref`/`computed`, поэтому остаётся в composable.
- Magic numbers (drag threshold 40px, click vs drag 300ms) → `app/utils/constants/slider.ts` (RULES.md §4.3).

## Out of scope
- Showcase program (task 06).
- Code program (task 07).
- Keyboard navigation (`tabindex` на viewport — оставить заранее, реальные handlers — future PR).
- Tag click filter (декоративный пока).
