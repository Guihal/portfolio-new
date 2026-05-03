# Task 03: manifest-extend

## Goal
Расширить `scripts/generate-manifest.ts` чтобы новые поля `Entity` (year, tags, description, links) попадали в `server/assets/manifest.json`. Проверить что hot-reload через `builder:watch` уже покрывает `codes/` и `images/` subtree.

## Files (touch only)
- `scripts/generate-manifest.ts` (+ ~40 LOC; total expected ≤ 250 — exempt from 150 limit, см. RULES.md §3.2 whitelist `scripts/**`).
- `tests/unit/manifest.test.ts` (+ ~30 LOC; tests файл exempt).

## Dependencies
- Tasks: 01 (types), 02 (endpoint).
- Reads (без изменений):
  - `scripts/generate-manifest.ts` — текущая реализация.
  - `server/utils/manifest/loadManifest.ts`.
  - `nuxt.config.ts` `builder:watch` hook.
  - `tests/unit/manifest.test.ts` — текущие assertions.

## Steps

### Шаг 1 — расширить generator
Open `scripts/generate-manifest.ts`. Найти место где читается `entity.json` и формируется `ManifestEntry`. Изменения:

1. При парсинге `entity.json` — пропустить через zod schema (если ещё не):
   ```ts
   const EntitySchema = z.object({
     name: z.string(),
     programType: z.enum(['about','explorer','project','tproject','code','showcase']),
     hidden: z.boolean().optional(),
     year: z.string().optional(),
     tags: z.array(z.string()).optional(),
     description: z.string().optional(),
     links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
   });
   ```
2. Вставить parsed `entity` в `ManifestEntry.entity` целиком (не только name+programType — **полный** объект). Сериализуется в JSON автоматически.
3. Сохранять в `manifest.json` через `JSON.stringify(manifest, null, 2)` — sorted keys для детерминизма (если уже есть — оставить).

### Шаг 2 — assertion в `manifest.test.ts`
Добавить тест:
```ts
test('manifest includes extended Entity fields', async () => {
  // mock entity.json со всеми новыми полями
  // run generateManifest()
  // assert flatIndex['<path>'].entity.year === '2024'
  // assert flatIndex['<path>'].entity.tags.length === 2
});
```

### Шаг 3 — verify hot-reload coverage
В `tests/unit/manifest.test.ts` добавить smoke-assertion:
```ts
test('builder:watch glob covers codes/ and images/ subtree', () => {
  // import nuxt config; assert builder:watch glob is 'server/assets/entry/**' (or '**/*')
  // OR — manually check nuxt.config.ts через AST/grep
});
```

Альтернативно — проверка через grep в test setup:
```ts
const config = await import('../../nuxt.config.ts');
// ... inspect builder:watch hook string
```

Если статически проверить сложно — **document only** в task `## Notes` с ссылкой на конкретную строку `nuxt.config.ts` где hook определён, и manual verify (touch `codes/x/index.html` → confirm в dev console «manifest regenerated»).

### Шаг 4 — manual smoke
```bash
bun run generate:manifest
cat server/assets/manifest.json | jq '.flatIndex | to_entries[] | select(.value.entity.year != null) | .key'
# должно вывести paths где year задан (после task 04 — все 3 existing entities)
```

## Success criteria
- `bun run generate:manifest` пишет в `manifest.json` все новые поля entity (year/tags/description/links) если они присутствуют в исходных `entity.json`.
- Test `manifest includes extended Entity fields` зелёный.
- `nuxt.config.ts builder:watch` glob проверен (manually OR через тест) — покрывает `codes/`, `images/`, `codeWindows.json`, любые новые поддеревья.
- `bun run typecheck` zero errors.

## Verify
```bash
cd /usr/projects/portfolio-new
bun run generate:manifests
cat server/assets/manifest.json | jq '.flatIndex | to_entries[] | .value.entity | select(. != null) | keys' | sort -u
# должен включать year/tags если task 04 применил миграцию

bun run test:unit -- manifest
bun run typecheck
```

## Acceptance test
Unit + manual smoke.

## Notes
- LOC: `scripts/**` whitelisted до 250 (RULES.md §3.2). После +40 LOC лимит не превышен.
- `tests/**` whitelisted до 400.
- SSR-safe: build-time script, никаких runtime concerns.
- ESLint: build-script, exempt от некоторых правил (см. eslint.config.mjs overrides).
- **Backward-compat**: existing entity.json без новых полей продолжают работать — все zod-поля optional.
- Если current `generate-manifest.ts` копирует только `name+programType` явно — заменить на spread `{ ...parsedEntity }` после zod parse.
- Hot-reload assertion может быть hard-coded check на строку `'server/assets/entry/**'` в `nuxt.config.ts` (читать файл, regex search).

## Backward-compat verification
После changes:
```bash
bun run generate:manifests
diff <(jq -S '.flatIndex' server/assets/manifest.json | head -100) /tmp/manifest-before.json
```
Existing entries должны иметь те же поля (плюс новые если их добавили в entity.json в task 04). Никаких удалённых полей.

## Out of scope
- Migration entity.json content (task 04).
- Endpoint contract (task 02).
