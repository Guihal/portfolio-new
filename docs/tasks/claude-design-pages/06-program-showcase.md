# Task 06: program-showcase

## Goal
Новая программа `showcase` — single-image viewer окна. Открывается по deep path `/projects/<slug>/<image-name>.png` (или аналогичный путь для картинки внутри entity). Опциональный pixel-box фрейм (prop `framed`). Дизайн — артборды K–M в `claude-design/Project + Showcase.html`.

## Files (touch only)
- `app/programs/showcase.ts` (новый, ~30 LOC).
- `app/components/Programs/Showcase/index.vue` (новый, ~100 total: script ≤40, template ≤30, style ≤30).
- `app/components/Programs/Showcase/composables/useShowcaseImage.ts` (новый, ~50 LOC) — резолвит URL картинки из path.
- `tests/unit/programs/showcase/Showcase.spec.ts` (новый, ~50 LOC).
- `app/programs/index.ts` (+ ~3 LOC) — зарегистрировать `showcase` в REGISTRY.

**Total LOC**: ~233 across 5 files. Каждый ≤150.

## Dependencies
- Tasks: 01 (types — `ProgramType` уже включает `'showcase'`), 02 (endpoint), 04 (migration).
- Reads (без изменений):
  - `app/programs/index.ts`, `project.ts`, `about.ts` — REGISTRY pattern.
  - `app/components/Window/composables/useFetchEntity.ts`, `useCreateWindowByPath.ts` — routing pattern.
  - `claude-design/styles/dimonya-os.css` — `.showcase`, `.pixel-box` стили.
  - артборды K (plain), L (framed), M (tall image).

## Steps

### Шаг 1 — REGISTRY entry `app/programs/showcase.ts`
```ts
import type { ProgramView } from './index';
import ShowcaseComponent from '~/components/Programs/Showcase/index.vue';
import projectIcon from '~/assets/icons/programs/project.svg?raw';  // переиспользуем project icon

export default <ProgramView>{
  id: 'showcase',
  label: 'Showcase',
  icon: projectIcon,
  component: ShowcaseComponent,
  config: { showBreadcrumbs: true, canNavigate: false },
};
```

### Шаг 2 — `app/programs/index.ts` REGISTRY
```ts
import showcase from './showcase';

const REGISTRY: Record<ProgramType, ProgramView> = {
  explorer,
  project,
  tproject,
  about,
  showcase,   // NEW
  code,       // регистрируется в task 07
};
```

> Если task 07 ещё не merged — REGISTRY временно без `code` (это валидно — TS жалуется на missing key `Record<ProgramType, ProgramView>`. Решение: использовать `Partial<...>` на время промежуточного состояния, либо merge task 07 first.) **Рекомендация**: merge order: 06 → 07 (или одним PR оба, если timing tight).

### Шаг 3 — `useShowcaseImage.ts`
Контракт URL → image:
- Path шаблон: `/projects/<slug>/<filename>` где filename matches `/^[\w._-]+\.(png|jpg|jpeg|webp|svg)$/i`.
- Композ:
  ```ts
  export function useShowcaseImage(path: MaybeRefOrGetter<string>) {
    const parts = computed(() => {
      const p = toValue(path);
      const match = p.match(/^(.+)\/([\w._-]+\.(?:png|jpg|jpeg|webp|svg))$/i);
      if (!match) return null;
      return { entityPath: match[1], filename: match[2] };
    });
    const { data } = useFetch('/api/filesystem/content', {
      query: { path: computed(() => parts.value?.entityPath) },
      key: () => `content:${parts.value?.entityPath}`,
      server: true,
    });
    const imageUrl = computed(() => {
      if (!parts.value || !data.value?.images) return null;
      // images[] — массив URLs формата '/api/filesystem/asset?path=projects/x/images/01.png'
      return data.value.images.find(u => u.endsWith('/' + parts.value!.filename)) ?? null;
    });
    return { imageUrl, entity: computed(() => data.value?.entity) };
  }
  ```
- Если `imageUrl === null` → caller рендерит error state.

### Шаг 4 — `Showcase/index.vue`
```vue
<script setup lang="ts">
const window = useInjectWindow();
const path = computed(() => window.path);
const { imageUrl, entity } = useShowcaseImage(path);
const framed = computed(() => entity.value?.tags?.includes('framed') ?? false);
</script>

<template>
  <div class="showcase" :class="{ 'showcase--framed': framed }">
    <NuxtImg
      v-if="imageUrl"
      :src="imageUrl"
      class="showcase__img"
      :class="{ 'pixel-box': framed }"
    />
    <div v-else class="showcase__error">
      <div class="showcase__error-text">Изображение не найдено</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.showcase {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: c('default');
}
.showcase__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.showcase--framed .showcase__img {
  // pixel-box mixin handles frame
}
.showcase__error {
  @include t($fs: 14px, $cName: 'default-contrast');
  opacity: 0.5;
}
</style>
```

### Шаг 5 — Tests
- `Showcase.spec.ts`:
  - Render с `imageUrl` → `<img>` показывается.
  - Render без `imageUrl` (e.g. mock fetch returns no matching image) → error message.
  - `framed === true` → корневой div имеет class `showcase--framed`, `<img>` имеет `pixel-box`.
  - Tall image (артборд M) — `object-fit: contain` оставляет aspect ratio (CSS-only, не unit-test).

### Шаг 6 — Routing wire-up
`useCreateWindowByPath` (existing composable в `app/components/Window/composables/`) — должен правильно резолвить deep path `/projects/x/01.png` → программа `showcase`.

Logic: после `useFetchEntity` для path:
1. Если entity.json для `/projects/x/01.png` НЕ найден (это файл, не папка) — попытаться:
   - Match `/^(.+)\/([\w._-]+\.(png|jpg|jpeg|webp|svg))$/i`.
   - Match → fetch entity для parent path → если parent.entity.programType in `{'project','explorer'}` И есть images включая filename — `programType = 'showcase'`. Иначе оставить как есть (404 / fallback).

> **Замечание**: эта логика в `useCreateWindowByPath` — **внимательно** изменить, чтобы не сломать existing `tproject` (которая может иметь deep path другого формата). Если existing useCreateWindowByPath уже возвращает entity для file paths (через manifest hot-index файлов?) — переиспользовать. Если нет — добавить fallback resolution.

## Success criteria
- `/projects/u24/01-cover.png` (после fixtures task 10) → открывает Showcase окно с этой картинкой.
- `/projects/u24/non-existent.png` → Showcase окно с error «Изображение не найдено».
- `framed` toggle меняет visual frame (manual visual diff).
- Tall image не растягивается (aspect ratio preserved).
- Existing `/projects/u24` (entity-path, без файла в конце) — продолжает открывать `explorer` без regression.

## Verify
```bash
cd /usr/projects/portfolio-new
bun run typecheck && bun run lint
bun run test:unit -- programs/showcase
bun run test:e2e -- showcase  # task 09
```

## Acceptance test
Unit + e2e (`tests/e2e/programs/showcase.spec.ts` в task 09) + manual visual против артбордов K, L, M.

## Notes
- LOC ≤ 150 per file (max — index.vue ~100).
- `noUncheckedIndexedAccess`:
  - `match[1]`, `match[2]` после null-check `match` → `string | undefined` (regex group). Fix: `if (!match || !match[1] || !match[2]) return null;`.
  - `data.value?.images.find(...)` — `find` возвращает `T | undefined` → safely `?? null`.
- SSR-safe: yes (useFetch + computed).
- ESLint: `vue/no-v-html` — обязательно. `<NuxtImg>` instead of `<img>` ради lazy/responsive.
- Container queries: showcase обычно желает аспект ratio respect — `object-fit: contain` достаточно. Tall image (артборд M) проверяется visual'но.
- **Альтернатива `framed`**: вместо tag-driven — query parameter `?framed=1` ИЛИ метаданные на entity (`entity.framed?: boolean`). Решение: пока `tags.includes('framed')` — простой path-of-least-resistance, после approve можно перенести в явное поле.
- `pixel-box` mixin — определён в существующем `claude-design/styles/dimonya-os.css` И/ИЛИ в `app/assets/scss/mixins.scss`. Если нет — port из dimonya-os.css в task 06 как часть SFC style.

## Out of scope
- Project program (task 05).
- Code program (task 07).
- Cascade layout (task 08).
- `framed` toggle UI (button) — пока через config/tag.
