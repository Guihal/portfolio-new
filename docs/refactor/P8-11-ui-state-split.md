# P8-11: UI-state из global stores

**Status:** todo
**Priority:** medium
**Estimate:** 2ч
**Depends on:** P8-02
**Group:** C — UI extraction
**Sunset:** —

## Цель

`stores/windows.ts` (182 LOC) держит `errorMessage` (transient UI). `stores/frame.ts` держит `images` (preview cache, тоже UI). Цель: убрать transient UI-state из core registry.

**Open question** (юзер закрывает до start): per-window `useWindowUIState` composable VS отдельный store `windowsUIState.ts`. Default: композабл per-window (proper view-state ownership).

## Изменения

1. **`app/composables/useWindowUIState.ts`** (≤ 80 LOC) ИЛИ **`app/stores/windowsUIState.ts`** — выбор юзера.
   - `errorMessage: Ref<string | null>` per window.
   - `previewImage: Ref<string | null>` per window (если выбран composable путь — store frame.ts остаётся для cross-cut state, в нём только setter API; UI consumer берёт через composable).
2. **`app/stores/windows.ts`** — удалить `errorMessage` field, ≤ 150 LOC после.
3. **Consumers**:
   - `Window/View.vue` или error-display SFC — берёт `errorMessage` из composable/UI-store.
   - `Taskbar/Elements/Program/Tooltip.vue` — берёт preview из composable, не `frame.images`.
4. **whitelist в `eslint.config.mjs`** для `app/stores/windows.ts` — снимается (sunset reached).

## Тесты

- `tests/unit/stores/windows.test.ts` — обновляется (errorMessage assertions removed).
- `tests/unit/composables/useWindowUIState.test.ts` — error setter, preview setter.
- E2E: error отображается при 404; preview отображается при collapse.

## Acceptance criteria

- [ ] `windows.ts` ≤ 150 LOC.
- [ ] `errorMessage` отсутствует в `WindowOb` interface.
- [ ] `frame.ts.images` либо удалён (если composable путь), либо изолирован в чистом setter API.
- [ ] Whitelist для windows.ts удалён из eslint.config.

## Risks

- **State migration** — error display SFC должен подключиться к composable правильно (provide/inject).
- **Per-window vs global trade-off** — если выбран composable, теряется global access (но это и нужно).
