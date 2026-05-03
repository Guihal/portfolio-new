# P8-06: stores/frame.ts split — DOM observers вон из store

**Status:** todo
**Priority:** high
**Estimate:** 1.5ч
**Depends on:** P8-02
**Group:** C — UI extraction
**Sunset:** —

## Цель

`stores/frame.ts` смешивает domain state (frame map, images cache) с DOM-логикой (MutationObserver, dynamic import `html-to-image`, debounce). Split: store держит state, composable управляет lifecycle observer'а, service делает screenshot.

## Изменения

1. **`app/services/windowPreviewGenerator.ts`** (≤ 100 LOC):
   - `generatePreview(el: HTMLElement): Promise<string>` — обёртка над `html-to-image.toJpeg` с PixCyrillic font preload.
   - Pure (за вычетом DOM input).
   - Под `import.meta.client` guard.
2. **`app/composables/useWindowPreview.ts`** (≤ 80 LOC):
   - принимает `windowId`, root ref.
   - устанавливает `MutationObserver`, дебаунсит, вызывает `generatePreview()`, обновляет store.
   - cleanup на `onScopeDispose`.
3. **`app/stores/frame.ts`** (≤ 80 LOC после рефактора):
   - только state: `images: Map<string, string>`, `setImage(id, dataUrl)`, `getImage(id)`.
   - убрать MutationObserver, dynamic import, debounce.
4. **`app/components/Window/composables/useWindow.ts`** — после mount окна вызывает `useWindowPreview(windowOb.id, rootRef)`.
5. **Тесты**:
   - `tests/unit/services/windowPreviewGenerator.test.ts` (mock `html-to-image`).
   - `tests/unit/stores/frame.test.ts` (state setter / getter).
   - E2E: collapse окна → tooltip показывает screenshot.

## Тесты

- `bun run test:unit` всё зелёное.
- `bun run test:e2e` — превью в taskbar tooltip генерится при collapse.

## Acceptance criteria

- [ ] `services/windowPreviewGenerator.ts` ≤ 100 LOC.
- [ ] `composables/useWindowPreview.ts` ≤ 80 LOC.
- [ ] `stores/frame.ts` ≤ 80 LOC.
- [ ] Нет `MutationObserver` / `setTimeout` / `import('html-to-image')` в store.
- [ ] Visual regression zero на screenshot.

## Risks

- **`html-to-image` font preload** — переехать вместе с генератором, иначе текст в screenshot ломается.
- **Existing P1-07 frame-observer optimisation** — сохранить debounce + observer disconnect logic.
