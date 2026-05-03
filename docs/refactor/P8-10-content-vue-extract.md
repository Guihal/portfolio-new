# P8-10: Window/Content.vue — useProgramSetup

**Status:** todo
**Priority:** medium
**Estimate:** 1.5ч
**Depends on:** P8-02
**Group:** C — UI extraction
**Sunset:** —

## Цель

`Window/Content.vue` (~80 LOC) держит watch + program lookup + provide. Это Logic, не View. Extract в composable.

## Изменения

1. **`app/components/Window/composables/useProgramSetup.ts`** (≤ 60 LOC):
   - принимает `windowOb`.
   - watcher на `windowOb.file?.programType` → resolve `getProgram(type)`.
   - `provide()` ProgramView via typed key.
   - возврат `programView` ref.
2. **`app/components/Window/Content.vue`** (≤ 50 LOC) — только template + `useProgramSetup(window)` call.

## Тесты

- E2E: открытие about / explorer / project window рендерит правильную программу.
- `tests/unit/composables/useProgramSetup.test.ts` — mock `getProgram`, проверка provide.

## Acceptance criteria

- [ ] `useProgramSetup.ts` ≤ 60 LOC.
- [ ] `Content.vue` ≤ 50 LOC.
- [ ] Provide-key типизирован (`InjectionKey<ProgramView>`).
- [ ] No watch logic в SFC.

## Risks

- **Race с fetchEntity** — программа резолвится после `windowOb.file` загружен; loading-state UI.
- **Provide scope** — сохранить existing inject points (`useProgram` consumers).
