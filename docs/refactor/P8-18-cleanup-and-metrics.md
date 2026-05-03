# P8-18: cleanup + warn→error switch + final metrics

**Status:** todo
**Priority:** high
**Estimate:** 2ч
**Depends on:** A–E (всё)
**Group:** F — Finalize
**Sunset:** —

## Цель

После всех splits переключить ESLint `max-lines` с **warn** на **error**. Trim whitelist (sunset entries удалить). Финальный AGENTS.md update. Metrics badge.

## Изменения

1. **`eslint.config.mjs`** — main block `max-lines` level: `'warn'` → `'error'`.
2. **`eslint.config.mjs` whitelist trim** — удалить sunset-PR entries которые мерджнуты:
   - Удалить `app/stores/windows.ts: 200` (sunset P8-11 ✅).
   - Оставить permanent: `facts-data.ts: 300`, `programs/index.ts: 200`.
3. **`docs/RULES.md` whitelist table** — синхронизировать со state ESLint config.
4. **`docs/refactor/baseline-loc.txt`** vs current snapshot diff → записать в P8-18 commit message и `docs/refactor/post-phase-8-loc.txt`.
5. **`AGENTS.md`** — финальный update «Архитектурные слои» с реальными примерами файлов.
6. **`README.md`** — добавить badge / section про architecture limits.
7. **`scripts/check-vue-sfc-size.ts`** — переключить из `--report` режима в fail-mode (если ещё не).
8. **`docs/refactor/index.md`** — отметить Phase 8 ✅ + P8-01..P8-18 ✅.

## Тесты

- `bun run lint` — zero errors (только existing warnings закрыты).
- `bun run scripts/check-vue-sfc-size.ts` — zero violations.
- Все existing tests (unit + E2E + typecheck + biome) зелёные.

## Acceptance criteria

- [ ] ESLint `max-lines: error` active.
- [ ] Whitelist sunset entries удалены.
- [ ] `docs/refactor/post-phase-8-loc.txt` присутствует с diff vs baseline.
- [ ] README badge.
- [ ] Все 18 P8-* files отмечены ✅ в `index.md`.
- [ ] CI зелёный.

## Risks

- **Late-discovered violations** — если lint выдаёт error на файле, который не был в плане — расширить P8-* (новый sunset entry или extend existing).
- **Bus factor** — все P8 docs детальные, новый dev может продолжить.
