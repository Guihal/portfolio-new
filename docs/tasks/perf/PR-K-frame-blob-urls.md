# PR-K — Frame store: Blob URLs с revocation

## Context

[`app/services/windowPreviewGenerator.ts`](app/services/windowPreviewGenerator.ts) генерирует preview через `htmlToImage.toJpeg()` → возвращает data:URL string ~100-500 KB на окно. Эти strings оседают в `frame.images: Record<id, string>`. На window close `frame.remove(id)` удаляет reference, но:

- data:URL — это в base64-encoded строка с inline binary в самой строке. Pinia's reactive proxy + Vue subscriptions могут держать reference дольше чем нужно.
- При агрессивном open/close cycle (50+ окон в сессии) суммарный размер JPEG'ов в памяти растёт.
- HMR cleanup (`__resetFrameImages` в frame.ts) есть только для dev, не для prod.

## Цель

Заменить data:URL на Blob URL (`URL.createObjectURL(blob)`). Явно `URL.revokeObjectURL` на window close. Освобождает binary memory у browser-managed Blob storage немедленно.

## Файлы

- `app/services/windowPreviewGenerator.ts` — `toJpeg` → `toBlob` + `URL.createObjectURL`.
- `app/stores/frame.ts` — revoke в `remove()` и `$reset()` (если PR-I ландит первым).
- `app/components/Window/composables/lifecycle/useWindowPreviewObserver.ts` — нет изменений (consumer передаёт string в `frameStore.set`, теперь это blob URL вместо data URL — string один и тот же).

## Изменение

### 1. `windowPreviewGenerator.ts`

**Before**:
```ts
export async function generatePreview(
    el: HTMLElement,
    opts: GeneratePreviewOpts,
): Promise<string | null> {
    if (typeof window === "undefined") return null;
    try {
        const htmlToImage = await import("html-to-image");
        return await htmlToImage.toJpeg(el, {
            width: opts.width,
            height: opts.height,
            cacheBust: true,
            quality: 1,
        });
    } catch {
        return null;
    }
}
```

**After**:
```ts
export async function generatePreview(
    el: HTMLElement,
    opts: GeneratePreviewOpts,
): Promise<string | null> {
    if (typeof window === "undefined") return null;
    try {
        const htmlToImage = await import("html-to-image");
        const blob = await htmlToImage.toBlob(el, {
            width: opts.width,
            height: opts.height,
            cacheBust: true,
            quality: 1,
            type: "image/jpeg",
        });
        if (!blob) return null;
        return URL.createObjectURL(blob);
    } catch {
        return null;
    }
}
```

`html-to-image.toBlob()` возвращает `Blob | null`. `type: "image/jpeg"` форсит JPEG (default может быть png).

### 2. `frame.ts` — revoke в remove + $reset + set

`set()` должен revoke предыдущий URL когда перезаписывается:

```ts
function set(id: string, src: string) {
    const prev = images.value[id];
    if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
    }
    images.value[id] = src;
}

function remove(id: string) {
    const prev = images.value[id];
    if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
    }
    Reflect.deleteProperty(images.value, id);
}
```

Если PR-I мержится первым, `$reset()` тоже должен revoke все active URLs:

```ts
function $reset() {
    for (const url of Object.values(images.value)) {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    }
    images.value = {};
}
```

`startsWith("blob:")` guard — на случай если в state случайно остался data:URL (от старой версии до миграции, edge на HMR-reload). Безопасный no-op.

### 3. `__resetFrameImages` HMR-cleanup

Тоже нужно revoke:
```ts
export function __resetFrameImages() {
    try {
        const pinia = getActivePinia();
        if (pinia) {
            const store = useFrameStore();
            for (const url of Object.values(store.images)) {
                if (url.startsWith("blob:")) URL.revokeObjectURL(url);
            }
            store.images = {};
        }
    } catch {}
}
```

## Edge cases

- **SSR**: `URL.createObjectURL` undefined на server. Но `generatePreview` уже guard'ed `typeof window === "undefined"` line 20 → returns null до toBlob. ✓.
- **html-to-image.toBlob может вернуть null** при transient error (DPR=0, hidden element). Уже handled — return null → consumer не пишет в store.
- **Browser memory pressure**: Blob URLs живут пока не revoke'нуты ИЛИ document closed. Наш explicit revoke на window close или $reset — early-release.
- **Image consumers** (taskbar tooltip preview, taskbar program preview): берут string src из `frame.images[id]`. Blob URL — тоже string (`blob:http://localhost:3000/uuid`). `<img :src>` работает идентично. ✓.
- **Race**: между `set()` revoke предыдущего и new mount чтения — между ними одна microtask. На concurrent reads — Vue's reactivity дернёт consumer на изменение images map, новый src уже актуальный. Не должно быть visible flicker.
- **Memory leak если `set` вызывается с одним URL и тут же window destroyed**: revoke прошлого + remove → последний URL revoke'нется. ✓.
- **Test environment** (jsdom): `URL.createObjectURL` may not exist. Нужно мочить или skip preview-related tests if any. Текущие 151 test pass — пробежать.

## Тесты

- `bun run test:unit` PASS без регрессий.
- `bun run typecheck` clean.
- `bun run biome:check` clean.
- Manual perf: `chrome://memory-internals` или DevTools Memory panel — open 30 windows, close all. До PR-K: heap не падает за GC до значимо low. После: heap immediately опускается.

## Приёмка

- [ ] `windowPreviewGenerator.ts` использует `htmlToImage.toBlob` + `URL.createObjectURL`.
- [ ] `type: "image/jpeg"` явно в опциях toBlob.
- [ ] `frame.ts` `set()` revoke'ит previous URL перед записью.
- [ ] `frame.ts` `remove()` revoke'ит URL перед deleteProperty.
- [ ] Если PR-I мерженый — `frame.ts` `$reset()` revoke'ит все URLs.
- [ ] `__resetFrameImages` HMR cleanup тоже revoke'ит.
- [ ] `startsWith("blob:")` guard на каждом revoke (защита от mixed state).
- [ ] `bun run typecheck` clean.
- [ ] `bun run biome:check` clean.
- [ ] `bun run lint` clean.
- [ ] `bun run test:unit` PASS без регрессий.
- [ ] Все файлы ≤ 150 LOC.

## Architectural note

Соответствует docs/RULES.md (service layer для generator, state layer для store). Service остаётся pure (DOM input → Blob output → URL). State layer хранит только URL string. Lifecycle ownership корректный: store создаёт URL → store revoke'ит.

## Coordination с PR-I

Если PR-I (SSR reset) лендится **первым** — добавить `$reset()` в frame.ts с revoke (см. изменение #2). Если PR-K **первым** — добавлять `$reset()` не нужно, PR-I его добавит и должен включить revoke (плана PR-I §1 предусмотреть это или PR-K допишет в follow-up). 

Простейшее: договориться что PR-I добавляет skeleton `$reset()` с revoke loop, PR-K только модифицирует `set/remove` для revoke на set/remove. Subagent читает оба плана при dispatch'е.
