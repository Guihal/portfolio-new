# Task 04: migration-existing

## Goal
Добавить optional поля (`year`, `tags`, `description`, `links`) в existing entity.json для `griboyedov`, `u24`, `about`. Миграция чисто аддитивная — никаких ломающих изменений.

## Files (touch only)
- `server/assets/entry/projects/u24/entity.json` (+ ~5 LOC).
- `server/assets/entry/projects/griboyedov/entity.json` (+ ~5 LOC).
- `server/assets/entry/about/entity.json` (+ ~5 LOC).

**Total LOC**: ~15 across 3 files. Все ≤150.

## Dependencies
- Tasks: 01 (types), 02 (endpoint), 03 (manifest).
- Reads (без изменений):
  - текущие `entity.json` (видно через `git log` для context — что было).
  - `claude-design/Project + Showcase.html` для inspiration meta-полей (см. артборд E `meta-rich`).

## Steps

### Шаг 1 — `projects/u24/entity.json`
Текущее (verified):
```json
{
    "name": "u24",
    "programType": "explorer"
}
```

Расширить (контент условный — финальный согласовать с юзером):
```json
{
    "name": "u24",
    "programType": "explorer",
    "year": "2023 — настоящее",
    "tags": ["product", "vue", "three.js", "webgl", "design-system", "dashboard"],
    "description": "Внутренний дашборд для мониторинга 24/7 операций. От аналитики realtime-стримов до alerting-движка.",
    "links": [
        { "label": "u24.dev", "href": "#" },
        { "label": "Демо (требует доступ)", "href": "#" }
    ]
}
```

> **Замечание**: `programType: "explorer"` оставлено как есть. Если визуально нужен `project` (slider+meta) — это решение **не** в этом таске; миграция programType — отдельный возможный PR (см. Out of scope).

### Шаг 2 — `projects/griboyedov/entity.json`
Текущее:
```json
{
    "name": "Фонд имени Грибоедова",
    "programType": "explorer"
}
```

Расширить:
```json
{
    "name": "Фонд имени Грибоедова",
    "programType": "explorer",
    "year": "2024",
    "tags": ["design", "site", "vue", "typography"],
    "description": "Сайт фонда поддержки молодых литераторов. Каталог авторов и работ в формате длинного ленточного скролла с анимированным набором текста.",
    "links": [
        { "label": "griboedov-fond.ru", "href": "https://griboedov-fond.ru" }
    ]
}
```

### Шаг 3 — `about/entity.json`
Расширить аналогично (зависит от текущего content). Минимум:
```json
{
    "name": "Обо мне",
    "programType": "about",
    "description": "..."
}
```

`tags`, `year`, `links` — опционально для about (контент-driven).

### Шаг 4 — regenerate manifests
```bash
bun run generate:manifests
```

Подтвердить:
```bash
cat server/assets/manifest.json | jq '.flatIndex | to_entries[] | select(.value.entity.year != null) | .key'
# должны быть выведены пути projects/u24, projects/griboyedov
```

### Шаг 5 — regression check
```bash
bun run test:unit
bun run test:e2e -- existing-projects  # см. task 09
```

## Success criteria
- 3 entity.json валидно парсятся (zod в endpoint + generator).
- `manifest.json` содержит новые поля для всех migrated entities.
- Existing routes (`/projects/u24`, `/projects/griboyedov`, `/about`) рендерят без regression — старая UI не использует новые поля, поэтому ничего не должно сломаться.
- E2E suite зелёный.

## Verify
```bash
cd /usr/projects/portfolio-new
bun run generate:manifests
cat server/assets/manifest.json | jq '.flatIndex["projects/u24"].entity'
# JSON должен содержать year, tags, description, links

bun run typecheck && bun run test:unit
bun run dev &
SERVER_PID=$!
sleep 5
curl -s http://localhost:3000/api/filesystem/get?path=projects/u24 | jq .name  # старый endpoint работает
curl -s http://localhost:3000/api/filesystem/content?path=projects/u24 | jq '.entity.tags | length'  # новый endpoint видит tags
kill $SERVER_PID
```

## Acceptance test
Manual + e2e regression suite (`existing-projects.spec.ts` создаётся в task 09).

## Rollback strategy
Каждый entity.json — independent commit (3 commits в этом PR ИЛИ 3 PR'а если хочется ещё мельче). Сломалась миграция одного — `git revert <commit>` для этого файла. **Никаких feature-флагов**: новые поля optional, runtime fallback в endpoint+UI, removal любого поля = текущее поведение.

## Notes
- LOC ≤ 150 trivially (entity.json — данные, не код, max ~30 LOC each).
- `noUncheckedIndexedAccess`: not applicable (data file).
- SSR-safe: yes (статика).
- ESLint: JSON files exempt.
- **HTTPS check для `links[].href`**: если указан внешний URL — должен быть валидным URL (zod `.refine(s => /^https?:\/\//.test(s) || s === '#')`).
- Контент `description` — final wording согласовать с юзером перед merge (placeholder OK для review).
- Кириллица в JSON → UTF-8, не escape. Biome formatter настроен на 4-space indent — соблюсти.

## Backward-compat
- Old code reading `entity.name` / `entity.programType` — ничего не меняется.
- `entity.hidden` — без изменений.
- `app/programs/about.ts`, `explorer.ts`, `project.ts` — не трогаются (UI их использует через REGISTRY; новые поля consume в task 05).

## Out of scope
- Изменение `programType` для u24/griboyedov с `explorer` на `project` — отдельное продуктовое решение, не миграция типов.
- UI consumption новых полей в existing программах (task 05+).
- Контент-фикстуры для code-окон (task 10).
