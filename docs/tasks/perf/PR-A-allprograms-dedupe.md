# PR-A — AllPrograms dedupe

## Цель

Убрать дублирование группировки окон по `programType` в `AllPrograms.vue`. Использовать готовый getter `byProgramMap` из `useWindowsStore`. Pure win — два computed на одни данные = два cache-invalidation per mutation.

## Файлы

- `app/components/Taskbar/AllPrograms.vue` — заменить локальный `windowsGroupByProgram` на чтение из store.

## Изменение

**Before** ([app/components/Taskbar/AllPrograms.vue:10-25](app/components/Taskbar/AllPrograms.vue)):

```ts
const windowsGroupByProgram = computed<Partial<Record<ProgramType, WindowOb[]>>>(() => {
    const result: Partial<Record<ProgramType, WindowOb[]>> = {};
    for (const w of store.list) {
        if (!w?.file) continue;
        const t = w.file.programType;
        if (!hasProgram(t)) continue;
        const bucket = result[t] ?? [];
        bucket.push(w);
        result[t] = bucket;
    }
    return result;
});
```

**After**:

```ts
import { storeToRefs } from 'pinia';
const { byProgramMap } = storeToRefs(store);
```

В template итерироваться по Map: `v-for="[programType, windows] in byProgramMap" :key="programType"`.

Оставить фильтр через `hasProgram()` если нужен — но `byProgramMap` уже игнорирует окна без `file.programType` (см. `app/stores/windows.ts:28-38`). Достаточно.

## Тесты

- `bun run test:unit` — должен пройти полностью без регрессий. Существующие тесты taskbar / windows store не должны падать.
- `bun run typecheck` — clean.
- `bun run biome:check` — clean.

## Приёмка

- [ ] `app/components/Taskbar/AllPrograms.vue`: удалён локальный `windowsGroupByProgram`, computed вычисление дедуплицировано.
- [ ] Template итерируется по `byProgramMap` напрямую (Map iteration `[type, windows]`).
- [ ] Импорты очищены: `hasProgram`, локальный type для record — убрать если не нужны.
- [ ] `bun run typecheck` clean.
- [ ] `bun run biome:check` clean.
- [ ] `bun run test:unit` PASS без регрессий.
- [ ] `bun run lint` clean.
- [ ] SFC ≤ 150 LOC (script-only ≤ 80) — должен сократиться.

## Architectural note

Pure deduplication. State logic уже в store как single source of truth — сейчас просто consume. Никаких новых публичных API.
