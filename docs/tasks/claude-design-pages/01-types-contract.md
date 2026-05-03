# Task 01: types-contract

## Goal
Расширить `shared/types/filesystem.ts` новыми optional полями `Entity` и расширить `ProgramType` enum для будущих программ `code` / `showcase`. Backward-compat обязателен.

## Files (touch only)
- `shared/types/filesystem.ts` (+ ~25 LOC; total expected ~70).
- `tests/unit/types.test.ts` (новый файл, ~30 LOC) — type-level assertions.

## Dependencies
- Tasks: — (root таск, нет зависимостей).
- Reads (без изменений):
  - `shared/types/filesystem.ts` — текущий контракт.
  - `app/programs/index.ts` — `getProgram()` runtime fallback.
  - `server/assets/entry/projects/{u24,griboyedov}/entity.json`, `about/entity.json` — existing minimal entities (для верификации backward-compat).

## Steps
1. Открыть `shared/types/filesystem.ts`.
2. Расширить `ProgramType` union: добавить `'code' | 'showcase'` к существующему `'about' | 'explorer' | 'project' | 'tproject'`.
3. Добавить экспорт `EntityLink`:
   ```ts
   export type EntityLink = { label: string; href: string };
   ```
4. Расширить `Entity` optional полями:
   ```ts
   export type Entity = {
     name: string;
     programType: ProgramType;
     hidden?: boolean;
     year?: string;
     tags?: string[];
     description?: string;
     links?: EntityLink[];
   };
   ```
5. Сохранить `FsFile`, `FsList`, `Breadcrumb`, `ManifestEntry`, `ManifestNode`, `Manifest` без изменений (они композируются из `Entity`).
6. Создать `tests/unit/types.test.ts`:
   - `expectType<Entity>({ name: 'x', programType: 'about' })` — minimal проходит.
   - `expectType<Entity>({ name: 'x', programType: 'code', tags: ['a'], year: '2024', description: 'd', links: [{label:'l',href:'#'}] })` — full тоже.
   - `expectType<ProgramType>('showcase')` и `'code'` валидно; `'unknown' as ProgramType` через `// @ts-expect-error`.

## Success criteria
- `bun run typecheck` zero errors.
- Все existing файлы, импортирующие `Entity` / `ProgramType`, продолжают компилироваться (legacy callers получают расширенный тип, но используют только старые поля — структурно совместимо).
- `tests/unit/types.test.ts` зелёный.

## Verify
```bash
cd /usr/projects/portfolio-new
bun run typecheck && bun run test:unit -- types
```

## Acceptance test
Unit (vitest) + typecheck.

## Notes
- LOC ≤ 150 per file (текущий `filesystem.ts` после +25 LOC ~ 70).
- `noUncheckedIndexedAccess` не задевает type defs (runtime только).
- SSR-safe: yes (только types, нет runtime).
- ESLint: types-only файл — никаких runtime-правил не нарушает.
- `shared/types/**` exempt from LOC hard limit (whitelist в `docs/RULES.md` §3.2).
- `getProgram(type: ProgramType): ProgramView | null` уже возвращает `null` для отсутствующего ключа в REGISTRY — расширение enum не ломает runtime fallback. Регистрация `code`/`showcase` в REGISTRY происходит в task 06/07.
- **НЕ** удалять existing typedef `FsFile = Entity & { path: string }` — legacy callers зависят.

## Backward-compat verification
Запустить локально:
```bash
bun run generate:manifests
cat server/assets/manifest.json | jq '.flatIndex | to_entries[] | select(.value.entity != null) | .value.entity'
```
Все existing entity (минимум 4: about, projects, projects/u24, projects/griboyedov) парсятся через расширенный `Entity` без runtime-ошибки и без TS errors.

## Out of scope этого таска
- Регистрация `code` / `showcase` в `REGISTRY` (task 06, 07).
- Миграция existing entity.json с новыми полями (task 04).
- Использование новых полей в endpoint / UI (task 02, 05).
