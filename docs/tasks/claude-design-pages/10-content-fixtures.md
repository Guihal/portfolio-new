# Task 10: content-fixtures

## Goal
Создать реальный контент в `server/assets/entry/projects/griboyedov/` для демо новых программ (`code`, `showcase`, cascade-layout). Включает code-snippets (`marquee`, `cookie-banner`), `codeWindows.json` для cascade, и placeholder-изображения для slider'а. Используется как fixture для unit / e2e тестов task 09 + acceptance manual review против артбордов.

## Files (touch only)
- `server/assets/entry/projects/griboyedov/codes/marquee/meta.json` (новый, ~10 LOC).
- `server/assets/entry/projects/griboyedov/codes/marquee/index.html` (новый, ~20 LOC).
- `server/assets/entry/projects/griboyedov/codes/marquee/styles.css` (новый, ~30 LOC).
- `server/assets/entry/projects/griboyedov/codes/marquee/init.js` (новый, ~20 LOC).
- `server/assets/entry/projects/griboyedov/codes/cookie-banner/meta.json` (новый, ~10 LOC).
- `server/assets/entry/projects/griboyedov/codes/cookie-banner/banner.html` (новый, ~15 LOC).
- `server/assets/entry/projects/griboyedov/codeWindows.json` (новый, ~15 LOC).
- `server/assets/entry/projects/griboyedov/images/01-cover.png` (новый, placeholder ~50KB).
- `server/assets/entry/projects/griboyedov/images/02-slider.png` (новый, placeholder).
- `server/assets/entry/projects/griboyedov/images/03-detail.png` (новый, placeholder).
- `server/assets/entry/projects/u24/images/01-cover.png` (новый, placeholder).
- `server/assets/entry/projects/u24/images/02-grid.png` (новый, placeholder).

**Total LOC**: ~120 across 7 text files + 5 binary placeholders. Каждый файл ≤150 LOC.

## Dependencies
- Tasks: 01 (types — `'code'` programType), 02 (endpoint reads codes/), 03 (manifest copies new fields), 04 (entity.json updated с year/tags/...).
- Reads (без изменений):
  - `claude-design/Project + Showcase.html` — артборды O–U (code window content).
  - `claude-design/scenes.jsx` — JSON примеры из mock dataset.
  - existing `server/assets/entry/projects/griboyedov/entity.json` (после migration task 04).

## Steps

### Шаг 1 — `marquee/meta.json`
```json
{
  "windowTitle": "marquee.html",
  "description": "CSS-анимация бегущей строки для шапки сайта."
}
```

### Шаг 2 — `marquee/index.html`
```html
<div class="marquee">
  <div class="marquee__track">
    <span>Фонд имени Грибоедова</span>
    <span>Фонд имени Грибоедова</span>
    <span>Фонд имени Грибоедова</span>
    <span>Фонд имени Грибоедова</span>
  </div>
</div>
```

### Шаг 3 — `marquee/styles.css`
```css
.marquee {
  overflow: hidden;
  width: 100%;
  background: #151515;
  color: #cecece;
  padding: 12px 0;
}

.marquee__track {
  display: flex;
  gap: 32px;
  white-space: nowrap;
  animation: marquee-scroll 18s linear infinite;
}

.marquee__track span {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
```

### Шаг 4 — `marquee/init.js`
```js
(function () {
  var marquee = document.querySelector('.marquee');
  if (!marquee) return;
  var track = marquee.querySelector('.marquee__track');
  if (!track) return;
  marquee.addEventListener('mouseenter', function () {
    track.style.animationPlayState = 'paused';
  });
  marquee.addEventListener('mouseleave', function () {
    track.style.animationPlayState = 'running';
  });
})();
```

### Шаг 5 — `cookie-banner/meta.json`
```json
{
  "windowTitle": "cookie-banner.html",
  "description": "Минималистичный cookie-banner с auto-dismiss."
}
```

### Шаг 6 — `cookie-banner/banner.html`
```html
<div class="cookie-banner" id="cookie-banner" data-storage-key="cookie-accepted">
  <p class="cookie-banner__text">
    Сайт использует cookies. Продолжая использование, вы соглашаетесь с нашей
    <a href="/privacy" class="cookie-banner__link">политикой конфиденциальности</a>.
  </p>
  <button type="button" class="cookie-banner__button" data-action="accept">
    Принять
  </button>
</div>
```

### Шаг 7 — `codeWindows.json`
```json
{
  "layout": "cascade",
  "windows": [
    { "id": "marquee" },
    { "id": "cookie-banner" }
  ]
}
```

> **Schema**: `{ layout: 'cascade' | 'tile-h', windows: { id: string }[] }` — `id` matches subdirectory имя в `codes/`. Endpoint task 02 читает этот файл если есть, returns в `EntityContent.codeWindows`.

### Шаг 8 — Placeholder images
Использовать tool типа ImageMagick или pre-made placeholders:
- `01-cover.png` — 800×600, заметный (`magick -size 800x600 xc:#db481d -fill white -gravity center -annotate +0+0 'griboyedov 01' griboyedov-01-cover.png` или вручную через editor).
- `02-slider.png` — 800×600, другой цвет.
- `03-detail.png` — портретная (например 600×900) — для проверки артборда M (tall image).
- `u24/01-cover.png` — 800×600.
- `u24/02-grid.png` — 800×600.

> **Альтернатива**: использовать `/usr/projects/portfolio-new/post-update.png`, `tooltip-after-pre.png` и аналогичные screenshots из git status (already untracked) — git mv вместо генерации.

> **Итог**: точный набор картинок не критичен — важно что они существуют и валидны как PNG для `<NuxtImg>` SSR rendering. Минимум 3 картинки для griboyedov (slider next/prev test) и 2 для u24.

### Шаг 9 — Update `griboyedov/entity.json`
**Pre-condition**: после task 04 file имеет `programType: 'project'` (или explorer + сохранение). Verify контракт:

```json
{
  "name": "Фонд имени Грибоедова",
  "programType": "project",
  "year": "2024 — настоящее",
  "tags": ["site", "branding", "code"],
  "description": "Корпоративный сайт фонда — slider, marquee, cookie-banner.",
  "links": [
    { "label": "site", "href": "https://griboyedov.example/" },
    { "label": "code: marquee", "href": "/projects/griboyedov/code/marquee" },
    { "label": "back", "href": "/projects" }
  ]
}
```

> Если программа ещё `explorer` (post-task-04 conservative migration) — это OK, deeplink `/projects/griboyedov/code/marquee` всё равно открывает code window через `useCreateWindowByPath` resolver (task 07). Cascade-режим тогда триггерится через `/projects/griboyedov/code-cascade` или явный URL. **Решение**: для acceptance task 10 — переключить `programType: 'project'` в griboyedov, чтобы default open показывал new design. u24 пока оставить `explorer` (regression проверка task 09 § existing-projects).

## Success criteria
- `server/assets/entry/projects/griboyedov/codes/marquee/{meta.json, index.html, styles.css, init.js}` существуют и валидны (JSON parse + content readable).
- `cookie-banner/{meta.json, banner.html}` существуют.
- `codeWindows.json` parse'ится по схеме task 02.
- `images/` содержит минимум 3 картинки для griboyedov, 2 для u24 (валидные PNG).
- Endpoint `GET /api/filesystem/content?path=projects/griboyedov` возвращает `codes: [{ id: 'marquee', files: [3] }, { id: 'cookie-banner', files: [1] }]` + `images: [3 URLs]` + `codeWindows: { layout: 'cascade', windows: [...] }`.
- Manifest регенерируется (после `bun run generate:manifests`) и включает обновлённую entity.json структуру.
- Open `/projects/griboyedov` → project window показывает slider с 3 картинками + meta-panel.
- Open `/projects/griboyedov/code/marquee` → code window с 3 tabs (HTML/CSS/JS), копирование работает.

## Verify
```bash
cd /usr/projects/portfolio-new
bun run generate:manifests
bun run dev  # → curl localhost:3000/api/filesystem/content?path=projects/griboyedov | jq
# expect: codes[].files[].source.length > 0, images.length === 3, codeWindows.layout === 'cascade'
bun run typecheck && bun run lint
```

Manual:
1. `/projects/griboyedov` — slider с 3 картинками, meta panel с year/tags/links.
2. `/projects/griboyedov/01-cover.png` — showcase окно.
3. `/projects/griboyedov/code/marquee` — code-окно с 3 tabs.
4. Cascade trigger (deeplink из task 08) — 2 окна (marquee, cookie-banner) спавнятся со сдвигом.

## Acceptance test
e2e (task 09) использует эти fixtures напрямую — passing tests = passing fixtures. Manual visual против артбордов A–J (project), K–M (showcase), O–U (code).

## Notes
- **Code-snippets — не runtime код Tilda**, а копи-пейст ready текст для пользователя. Никакого `<script>` execution в browser ('source' попадает в `<pre><code v-text>` per task 07 XSS guard).
- **Размер `source`**: max 100KB per file (enforced в endpoint task 02). Все snippets fixture < 5KB — well within limit.
- **Images binary**: добавляем как часть commit'а (git stores binary). Если есть concern про размер repo — использовать `git lfs` (но для placeholders < 100KB — overkill).
- **Manifest update**: после добавления новых файлов под `entry/` — auto-regeneration через `builder:watch` hook. В CI — `bun run generate:manifests` явно перед build.
- **`griboyedov/entity.json` update**: НЕ ломает existing `programType: 'project'` users (task 04 уже добавил optional fields). Task 10 заполняет рассмотренный набор.
- `name` field — required (см. shared/types/filesystem.ts).
- **u24 пока минимальная**: оставить `programType: 'explorer'` для regression test'а (existing-projects.spec.ts assert'ит explorer view). u24 post-fixture migration на 'project' — future task.
- **Permission на directory listing** — endpoint task 02 уже валидирует filename whitelist. Файлы codes/{snippet}/* — все matchable `/^[a-zA-Z0-9._-]+$/`.

## Backward-compat
- Existing entity.json для griboyedov, u24, about — required fields сохранены, optional добавлены.
- Manifest schema (после task 03) — расширен, не breaking.
- Endpoint `/api/filesystem/get` (legacy) — non-modified, continues возвращать `{ name, programType, hidden? }`.

## Out of scope
- Production-ready картинки (artist-quality renders) — placeholders достаточно для MVP/test'ов.
- u24 migration на новый design (`programType: 'project'`) — задача backlog, после fixtures для u24 готовы.
- Tilda integration testing (вставить snippet в Tilda и проверить что работает) — manual QA шаг, не automation.
- Дополнительные projects (новые slugs) — out of scope, focus на griboyedov + u24.
