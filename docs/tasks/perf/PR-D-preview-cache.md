# PR-D — Preview cache (skip redundant html-to-image calls)

## Цель

Убрать избыточные вызовы `html-to-image.toJpeg` когда content + bounds окна не изменились с прошлого успешного скриншота. JPEG encode тяжёлый (DOM walk → canvas → blob). MutationObserver триггерит regenerate на любую DOM-мутацию даже если визуально ничего не поменялось.

## Файлы

- `app/components/Window/composables/lifecycle/useWindowPreviewObserver.ts` — добавить bounds+mutation hash, skip если совпало с last.
- `app/services/windowPreviewGenerator.ts` — без изменений (pure DOM-input).

## Изменение

### `useWindowPreviewObserver.ts`

Добавить closure state:

```ts
let lastBoundsKey = "";
let lastMutationCount = 0;
let mutationCount = 0;
```

Каждый MutationObserver fire инкрементит `mutationCount`. В debounced regenerate:

```ts
const regenerate = debounce(async () => {
    if (!alive || shouldSkip()) return;
    
    const boundsKey = `${slot.calculated.width}x${slot.calculated.height}`;
    if (boundsKey === lastBoundsKey && mutationCount === lastMutationCount) {
        return; // nothing changed since last successful render
    }
    
    const localMutationCount = mutationCount; // snapshot before await
    const jpeg = await generatePreview(wrapper, {
        width: slot.calculated.width,
        height: slot.calculated.height,
    });
    if (!alive || !jpeg) return;
    
    lastBoundsKey = boundsKey;
    lastMutationCount = localMutationCount;
    frameStore.set(windowOb.id, jpeg);
}, PREVIEW_DEBOUNCE_MS);
```

MutationObserver callback:
```ts
const observer = new MutationObserver(() => {
    mutationCount++;
    regenerate();
});
```

### Edge cases

- **First call**: `lastBoundsKey === ""` ≠ любому реальному boundsKey → fall through, выполняется generate.
- **Drag/resize end**: shouldSkip false снова, bounds могли поменяться → boundsKey diff → regenerate.
- **Pure bounds change без mutation** (drag не меняет content, только координаты): boundsKey diff → regenerate.
- **MutationObserver fires во время await**: mutationCount > localMutationCount после await → следующий debounced fire поймает diff и regenerate. Не теряем мутации.
- **Concurrent regenerate**: debounce коалесцирует. Two-phase mutation guard через snapshot защищает от race.
- **Initial regenerate() call** (line 50 в текущем коде): сработает один раз, заполнит lastBoundsKey/lastMutationCount от 0.

## Тесты

- `bun run test:unit` — pass.
- Add unit (если есть тесты для useWindowPreviewObserver): mock generatePreview, verify call count = 1 при двух MutationObserver fire'ах с одинаковым content + bounds. Опционально, не блокирующее.
- Manual: открыть окно → idle → preview генерится один раз. Drag/resize → preview обновляется after end.

## Приёмка

- [ ] `app/components/Window/composables/lifecycle/useWindowPreviewObserver.ts`: добавлен skip при совпадении `boundsKey + mutationCount` с last.
- [ ] MutationObserver callback инкрементит `mutationCount`.
- [ ] `boundsKey` собирается из `slot.calculated.{width,height}`.
- [ ] Snapshot mutation count перед await — защита от race.
- [ ] `lastBoundsKey/lastMutationCount` обновляются ТОЛЬКО на successful render (`jpeg !== null`).
- [ ] Cleanup function без изменений (alive flag, observer.disconnect, frameStore.remove).
- [ ] `bun run typecheck` clean.
- [ ] `bun run biome:check` clean.
- [ ] `bun run test:unit` PASS без регрессий.
- [ ] `bun run lint` clean.
- [ ] Файл ≤ 150 LOC.

## Architectural note

State scope = closure внутри композабла. Не store — preview-cache не нужен снаружи и не должен переживать unmount окна. Не утечёт между запросами на SSR (composable вызывается в `onMounted`, под `import.meta.client` guard).
