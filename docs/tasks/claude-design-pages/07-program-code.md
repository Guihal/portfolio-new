# Task 07: program-code

## Goal
Новая программа `code` — окно с кодом для копирования в Tilda. Tabs (HTML/CSS/JS), `<pre><code>` рендер (XSS-safe), copy-to-clipboard с fallback'ом, состояние «Скопировано» 2s. URL шаблон: `/projects/<slug>/code/<snippet-id>` (опц.) или `/projects/<slug>/code` (первый snippet). Дизайн — артборды O–U в `claude-design/Project + Showcase.html`.

## Files (touch only)
- `app/programs/code.ts` (новый, ~30 LOC).
- `app/components/Programs/Code/index.vue` (новый, ~120 total: script ≤50, template ≤50, style ≤20).
- `app/components/Programs/Code/Tabs.vue` (новый, ~80 total).
- `app/components/Programs/Code/CopyButton.vue` (новый, ~80 total).
- `app/components/Programs/Code/composables/useCodeSnippet.ts` (новый, ~70 LOC) — резолв snippet из URL.
- `app/services/clipboard.ts` (новый, ~50 LOC) — fallback chain pure-ish.
- `app/utils/constants/timing.ts` (existing, +5 LOC если файл есть; иначе создать ~10 LOC) — `COPY_FEEDBACK_MS = 2000`.
- `app/programs/index.ts` (+ ~3 LOC).
- `tests/unit/programs/code/Code.spec.ts` (новый, ~70 LOC).
- `tests/unit/programs/code/clipboard.spec.ts` (новый, ~50 LOC).

**Total LOC**: ~558 across 10 files. Каждый ≤150.

## Dependencies
- Tasks: 01 (types — `'code'` в ProgramType), 02 (endpoint — `codes[]` + `codeWindows[]`), 04 (migration).
- Reads (без изменений):
  - `app/programs/index.ts` REGISTRY pattern.
  - `app/components/Window/composables/useFetchEntity.ts`, `useCreateWindowByPath.ts`.
  - `claude-design/Project + Showcase.html` артборды O–U.
  - `claude-design/styles/dimonya-os.css` `.code__win`, `.code__tab`, `.code__copy` стили (port в SFC style).

## Steps

### Шаг 1 — REGISTRY entry `app/programs/code.ts`
```ts
import type { ProgramView } from './index';
import CodeComponent from '~/components/Programs/Code/index.vue';
import projectIcon from '~/assets/icons/programs/project.svg?raw';

export default <ProgramView>{
  id: 'code',
  label: 'Код',
  icon: projectIcon,
  component: CodeComponent,
  config: { showBreadcrumbs: true, canNavigate: false },
};
```

Зарегистрировать в `app/programs/index.ts` REGISTRY.

### Шаг 2 — `useCodeSnippet.ts`
```ts
export function useCodeSnippet(path: MaybeRefOrGetter<string>) {
  // Path шаблоны:
  //   /projects/<slug>/code               → entity = projects/<slug>, snippet = first
  //   /projects/<slug>/code/<snippet-id>  → entity = projects/<slug>, snippet = <id>
  const parsed = computed(() => {
    const p = toValue(path);
    const m = p.match(/^(.+)\/code(?:\/([\w-]+))?$/);
    if (!m || !m[1]) return null;
    return { entityPath: m[1], snippetId: m[2] ?? null };
  });
  const { data, error } = useFetch('/api/filesystem/content', {
    query: { path: computed(() => parsed.value?.entityPath) },
    key: () => `content:${parsed.value?.entityPath}`,
    server: true,
  });
  const snippet = computed(() => {
    const codes = data.value?.codes;
    if (!codes || codes.length === 0) return null;
    if (!parsed.value?.snippetId) return codes[0]!;
    return codes.find(c => c.id === parsed.value!.snippetId) ?? null;
  });
  const notFound = computed(() => parsed.value !== null && data.value !== null && snippet.value === null);
  return { snippet, entity: computed(() => data.value?.entity), error, notFound };
}
```

### Шаг 3 — `clipboard.ts` service
```ts
// Pure-ish (no Vue ref), accepts text + returns Promise<boolean> success.
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;  // SSR
  // 1. navigator.clipboard (HTTPS / localhost)
  if (window.navigator?.clipboard?.writeText) {
    try {
      await window.navigator.clipboard.writeText(text);
      return true;
    } catch { /* fallthrough */ }
  }
  // 2. document.execCommand fallback
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
export function isClipboardAvailable(): boolean {
  return typeof window !== 'undefined' && (
    !!window.navigator?.clipboard?.writeText ||
    typeof document?.execCommand === 'function'
  );
}
```

### Шаг 4 — `CopyButton.vue`
```vue
<script setup lang="ts">
import { COPY_FEEDBACK_MS } from '~/utils/constants/timing';
const props = defineProps<{ text: string; label?: string }>();
const copied = ref(false);
const available = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => { available.value = isClipboardAvailable(); });
onUnmounted(() => { if (timer) clearTimeout(timer); });

async function handleClick() {
  const ok = await copyToClipboard(props.text);
  if (ok) {
    copied.value = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { copied.value = false; }, COPY_FEEDBACK_MS);
  }
}
</script>

<template>
  <button
    class="code__copy"
    :class="{ copied }"
    :disabled="!available"
    :aria-disabled="!available"
    @click="handleClick"
  >
    {{ copied ? 'Скопировано' : (label ?? 'Скопировать') }}
  </button>
</template>

<style lang="scss" scoped>
.code__copy {
  @include t($fs: 12px, $cName: 'default-contrast');
  background: c-rgba('default-2', 0.8);
  // ... styles per dimonya-os.css
}
.code__copy.copied { color: c('main'); }
.code__copy:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
```

### Шаг 5 — `Tabs.vue`
```vue
<script setup lang="ts">
defineProps<{ files: { name: string; language: string; source: string }[]; activeIdx: number }>();
defineEmits<{ select: [idx: number] }>();
</script>

<template>
  <ul class="code__tabs">
    <li
      v-for="(file, i) in files"
      :key="file.name"
      :class="{ active: i === activeIdx }"
      @click="$emit('select', i)"
    >
      {{ file.name }}
    </li>
  </ul>
</template>
```

`{{ file.name }}` — Vue auto-escape, plus filename whitelist уже применяется в endpoint (task 02). Defense-in-depth.

### Шаг 6 — `Code/index.vue`
```vue
<script setup lang="ts">
const window = useInjectWindow();
const path = computed(() => window.path);
const { snippet, entity, error, notFound } = useCodeSnippet(path);
const activeIdx = ref(0);
watch(snippet, () => { activeIdx.value = 0; });

const activeFile = computed(() => snippet.value?.files[activeIdx.value]);
</script>

<template>
  <div class="code">
    <div v-if="error" class="code__error">Не удалось загрузить :(</div>
    <div v-else-if="notFound" class="code__error">Сниппет не найден</div>
    <template v-else-if="snippet">
      <header class="code__header">
        <div class="code__title">{{ snippet.windowTitle }}</div>
        <CopyButton v-if="activeFile" :text="activeFile.source" />
      </header>
      <p v-if="snippet.description" class="code__desc">{{ snippet.description }}</p>
      <Tabs
        v-if="snippet.files.length > 1"
        :files="snippet.files"
        :active-idx="activeIdx"
        @select="activeIdx = $event"
      />
      <pre v-if="activeFile" class="code__pre"><code v-text="activeFile.source"></code></pre>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.code { display: flex; flex-direction: column; height: 100%; padding: 12px; gap: 8px; }
.code__pre { flex: 1; overflow: auto; background: c('default-1'); padding: 12px; }
.code__pre code { @include t($fs: 12px, $cName: 'default-contrast', $family: 'monospace'); white-space: pre; }
.code__tabs { display: flex; gap: 4px; }
.code__tabs li { padding: 4px 8px; cursor: pointer; opacity: 0.6; }
.code__tabs li.active { opacity: 1; background: c('default-2'); }
</style>
```

**XSS guard**: `<code v-text="activeFile.source">` — Vue заменяет на `textContent`, никакого parsing HTML. Любой `<script>` внутри source отображается как escaped text.

### Шаг 7 — Routing wire-up
`useCreateWindowByPath`:
- Path `/projects/x/code` или `/projects/x/code/<id>` → fetch parent entity (`projects/x`) через content endpoint.
- Если `entity.programType !== 'code'` И тут code-path — используем virtual: `programType = 'code'`, child windows. (Альтернатива: requirement что parent entity сам может быть programType=code — но тогда `/projects/x` отображается как code-окно, что не дизайн-intent. Текущее решение: code = sub-window над project.)
- Если `entity.codes` нет — error «Сниппет не найден».

> **Resolution decision**: `/projects/x/code/<id>` — virtual path, не файловая система. `useCreateWindowByPath` парсит, override `programType='code'` на основе path-suffix, передаёт path как is через `useInjectWindow`.

### Шаг 8 — Tests
- `clipboard.spec.ts`:
  - mock `navigator.clipboard.writeText` resolves → `copyToClipboard` returns true.
  - mock `navigator.clipboard.writeText` rejects → fallback to `document.execCommand`, returns true if execCommand returned true.
  - Both unavailable → returns false.
  - `isClipboardAvailable` true в jsdom (`document.execCommand` exists by default).
- `Code.spec.ts`:
  - Render с snippet → tabs visible, `<pre><code>` содержит escaped source.
  - Click tab → activeIdx changes.
  - Click copy → `copied.value === true`, после 2s — false. Mock setTimeout.
  - Snippet с `<script>alert(1)</script>` в source → assert NOT executed (`document.querySelector('script')` не найдёт vue-injected).

## Success criteria
- `/projects/griboyedov/code/marquee` (после fixtures task 10) — открывает code-окно с 3 вкладками (HTML/CSS/JS).
- Click копирует source активной вкладки в clipboard.
- «Скопировано» отображается 2s.
- В insecure context (HTTP не-localhost) — fallback на `execCommand`. Если оба недоступны — кнопка disabled.
- Script-payload не выполняется.

## Verify
```bash
cd /usr/projects/portfolio-new
bun run typecheck && bun run lint && bun run biome:check
bun run test:unit -- programs/code clipboard
bun run test:e2e -- code-window  # task 09
```

## Acceptance test
Unit (Code, Tabs, CopyButton, clipboard) + e2e (`code-window.spec.ts` в task 09) + manual против артбордов O, P, Q, R.

## Notes
- LOC ≤ 150 per file.
- `noUncheckedIndexedAccess`:
  - `snippet.value?.files[activeIdx.value]` → `T | undefined`. Computed → safely `T | undefined`. Template `v-if="activeFile"` guard.
  - `m[1]`, `m[2]` после null-check `m` остаются `string | undefined` для optional capture group `m[2]` (regex `(...)?`). Use `??` chain.
- SSR-safe:
  - `clipboard.ts` `typeof window === 'undefined'` guard в начале — early return false.
  - `useCodeSnippet` через `useFetch` — Nuxt-aware.
  - `CopyButton` `available.value = false` initial → SSR shows disabled state. `onMounted` — set `true` если client. Hydration mismatch prevented (initial state idempotent).
- ESLint:
  - `vue/no-v-html` — enforced. Use `v-text`.
  - `vue/no-static-inline-styles` — ok, у нас scoped SCSS.
  - `setTimeout` magic — `COPY_FEEDBACK_MS` в `app/utils/constants/timing.ts` (RULES.md §4.3 + §5).
- **html-to-image preview disable** для programType=code — НЕ в этом таске. См. task 08 (cascade) — там же обновляется `useWindowPreview` чтобы skip preview для code (taskbar показывает icon).
- `<pre><code v-text>` — final XSS solution. Никакого syntax highlighting в этом MVP (light vs dark themes consistency). Future PR — Shiki / highlight.js, но **только** через `:html` с pre-escaped output.

## Out of scope
- Cascade layout multiple code windows (task 08).
- Syntax highlighting.
- Preview (taskbar) optimization для code-окна.
- Edit mode (read-only sufficient).
