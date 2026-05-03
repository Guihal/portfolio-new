# Task 02: api-content-endpoint

## Goal
Добавить два endpoint'а: `GET /api/filesystem/content` (структурный JSON содержимого entry-папки) и `GET /api/filesystem/asset` (стрим статики из entry).

## Files (touch only)
- `server/api/filesystem/content.ts` (новый, ~80 LOC).
- `server/api/filesystem/asset.ts` (новый, ~70 LOC).
- `server/utils/manifest/resolveContent.ts` (новый, ~70 LOC) — pure function, читает FS + собирает `EntityContent`.
- `server/utils/validation.ts` (+ ~15 LOC) — добавить `parsePathQuery` overload или новый helper если нужно (зависит от текущего API; **читать перед изменением**).
- `nuxt.config.ts` (+ ~10 LOC) — `routeRules` для двух новых путей.
- `tests/unit/content-endpoint.test.ts` (новый, ~80 LOC).

**Total touched LOC**: ~325 across 6 files. Каждый файл ≤150.

## Dependencies
- Tasks: 01 (types — `Entity` расширен).
- Reads (без изменений):
  - `server/api/filesystem/get.ts`, `list.ts`, `breadcrumbs.ts` — pattern reference (cache, error handling, zod).
  - `server/utils/manifest/resolveEntity.ts` — pattern для resolve.
  - `server/utils/cacheLifetime.ts`, `errors.ts`, `validation.ts`.
  - `nuxt.config.ts` (existing routeRules).

## Steps

### Шаг 1 — `resolveContent.ts`
Pure function `resolveContent(path: string): Promise<EntityContent | null>`:
1. `getEntity(path)` — из existing `manifest/resolveEntity`. `null` → return `null`.
2. Абсолютный FS path: `SERVER_ASSETS_ENTRY_ROOT + '/' + path`.
3. Перечислить `images/` если есть: `fs.readdir`, отфильтровать по regex `/^[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp|svg)$/i`, lex-sort, map в URL: `/api/filesystem/asset?path=${encodeURIComponent(path + '/images/' + name)}`.
4. Перечислить `codes/<id>/` если папка есть И `entity.programType === 'code'`:
   - Каждая поддиректория `<id>` MUST match `/^[a-z0-9-]+$/` иначе skip + warn.
   - Прочитать `meta.json` (zod schema: `{ windowTitle: string, description?: string, primaryLanguage?: string }`).
   - Прочитать каждый файл сниппета (filename whitelist `/^[a-zA-Z0-9._-]+$/`, ext в `{html,css,js,json,txt,ts,scss}`).
   - Size cap 100KB per file (`fs.stat().size > 100*1024` → skip + warn).
   - Detect language by ext: html/css/js/json/typescript/scss/text.
5. Если есть `codeWindows.json` — прочитать (zod schema: array of `CodeWindowMeta`).
6. Вернуть `{ path, entity, images?, codes?, codeWindows? }`.

### Шаг 2 — `content.ts` endpoint
Pattern as `get.ts`:
```ts
export default defineCachedEventHandler(
  async (event) => {
    try {
      const { path } = parseContentPathQuery(getQuery(event));
      const content = await resolveContent(path);
      if (!content) throw notFound("Содержимое не найдено");
      return content;
    } catch (e) {
      if (isError(e)) throw e;
      throw serverError(e);
    }
  },
  { name: "fs-content", maxAge: ENTITY_CACHE_MAX_AGE,
    getKey: (event) => `content:${typeof getQuery(event).path === 'string' ? getQuery(event).path : 'invalid'}` }
);
```

`parseContentPathQuery` (в `validation.ts` или local-inline):
```ts
const ContentQ = z.object({
  path: z.string().regex(/^[\w\-/.]+$/).max(200).refine(p => !p.includes('..'), 'no traversal')
});
```

### Шаг 3 — `asset.ts` endpoint
1. zod query: тот же regex + ext-whitelist `(png|jpg|jpeg|webp|svg|html|css|js|json|txt)$/i`.
2. Resolve: `fullPath = path.resolve(SERVER_ASSETS_ENTRY_ROOT, query.path)`.
3. Guard: `if (!fullPath.startsWith(SERVER_ASSETS_ENTRY_ROOT)) throw createError({statusCode:403})`.
4. `fs.stat` → 404 если не файл.
5. MIME detection (минимальный mapping или `mime-types` пакет если уже в deps; иначе local switch на ext).
6. `setResponseHeader(event, 'Content-Type', mime)`.
7. `setResponseHeader(event, 'Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=300')`.
8. `return sendStream(event, createReadStream(fullPath))`.

**Без `defineCachedEventHandler`** — стримы плохо работают с cache-обёрткой Nitro. Кеш — через response headers.

### Шаг 4 — `nuxt.config.ts` routeRules
```ts
routeRules: {
  '/api/filesystem/content': { headers: { 'cache-control': 's-maxage=3600, stale-while-revalidate=60' } },
  '/api/filesystem/asset':   { headers: { 'cache-control': 'public, s-maxage=86400, stale-while-revalidate=300' } },
  // ... existing rules без изменений
}
```

### Шаг 5 — Tests `content-endpoint.test.ts`
1. **Happy path**: `path=projects/u24` → возвращает `EntityContent` с `entity.name === 'u24'`, `images.length > 0` (после fixtures task 10) или `images === undefined` (до fixtures).
2. **Path traversal**: `path=../../etc/passwd` → 400 (zod reject).
3. **Path with `..`**: `path=projects/../u24` → 400.
4. **Missing entity**: `path=does-not-exist` → 404.
5. **Code snippet read**: mock FS с `codes/sample/index.html` (size 50 bytes) → `codes[0].files[0].source` matches; mock с size > 100KB → файл skip, warn.
6. **Filename injection**: mock с `codes/<id>/<script>.html` → файл skip (whitelist failed).

## Success criteria
- `curl http://localhost:3000/api/filesystem/content?path=projects/u24` → валидный JSON; jq `.entity.name === "u24"`.
- `curl http://localhost:3000/api/filesystem/asset?path=projects/u24/images/01-cover.png -o /tmp/img.png && file /tmp/img.png` → image file (после fixtures).
- Path traversal/malicious payloads → 400.
- Unit tests все зелёные.
- `bun run typecheck && bun run lint` без ошибок.

## Verify
```bash
cd /usr/projects/portfolio-new
bun run typecheck && bun run lint && bun run test:unit -- content-endpoint
# integration smoke (dev server должен быть запущен):
bun run dev &
SERVER_PID=$!
sleep 5
curl -s 'http://localhost:3000/api/filesystem/content?path=projects/u24' | jq '.entity.name'
curl -s -o /dev/null -w '%{http_code}\n' 'http://localhost:3000/api/filesystem/content?path=../etc/passwd'  # expect 400
kill $SERVER_PID
```

## Acceptance test
Unit (vitest, FS mocks) + integration smoke (curl против dev-server'а).

## Notes
- LOC ≤ 150 per file. content.ts (~80) + asset.ts (~70) + resolveContent.ts (~70) — все в лимите.
- `noUncheckedIndexedAccess`:
  - `query.path` — после zod parse гарантированно `string`, не undefined.
  - `entity.programType` — non-optional.
  - `meta.json` поля — после zod parse type-safe.
  - При обходе `images[]` / `codes[]` использовать `for...of` (избегать `arr[i]!`).
- SSR-safe: yes (server-only file, не импортится из `app/`).
- ESLint:
  - Никаких `console.log` (use `console.warn` для skip-warn'ов или nitro logger).
  - Никаких `any` — `z.infer<typeof Schema>` для inferred types.
- **Dependency note**: проверить `mime-types` в `package.json`. Если нет — local switch на ext (10-15 LOC, простой `Record<string, string>`).
- **NO** importing `app/`, `shared/types` allowed. `Entity` берётся из `~~/shared/types/filesystem`.
- `codes` поле возвращается **только** если `entity.programType === 'code'` И папка `codes/` существует. Иначе `undefined` (не пустой массив).
- `images` поле — **undefined** если папка отсутствует или пуста (после filter), не пустой массив.

## Backward-compat
- Existing `/api/filesystem/get`, `list`, `breadcrumbs` — НЕ трогаем. Они продолжают возвращать `Entity` без новых полей (zod / TS позволяют).
- Новые routeRules в `nuxt.config.ts` — additive, не replace existing.

## Out of scope этого таска
- Migration existing entity.json (task 04).
- Manifest changes (task 03).
- UI consumption (task 05, 07).
