# P8-15: About.vue 271 → ≤150

**Status:** todo
**Priority:** medium
**Estimate:** 2ч
**Depends on:** P8-01
**Group:** E — File-size hard-fixes
**Sunset:** —

## Цель

`Programs/About/index.vue` (271 LOC) — 180 строк template + 80 style + слабый script. Split на data + sub-components.

## Изменения

**Decision (юзер закрывает в `REFACTOR-PLAN.md` open question #4):** combination — extract data + sub-components. Default ниже:

```
app/components/Programs/About/
├── index.vue                      (≤150; верхний layout)
├── content.ts                     (~80; structured content data, не строки)
├── Bio.vue                        (~50; биография block)
├── Skills.vue                     (~50; навыки block)
├── Contacts.vue                   (~40; соц-ссылки block)
└── About.module.scss              (если style тяжёлый — external SCSS module ~70 LOC)
```

`index.vue` — `<Bio :data />`, `<Skills :data />`, `<Contacts :data />` + import `content.ts`.

## Тесты

- E2E Playwright screenshot — pixel-perfect (or near) match с baseline.
- `bun run scripts/check-vue-sfc-size.ts` — About/index.vue ≤ 150.

## Acceptance criteria

- [ ] `About/index.vue` ≤ 150 LOC.
- [ ] `content.ts` структурированные данные (тип `AboutContent`).
- [ ] Sub-components ≤ 80 LOC each.
- [ ] Visual regression zero.

## Risks

- **Visual regression** — Playwright screenshot ловит.
- **i18n future** — структурированный `content.ts` упрощает будущий i18n (out of scope).
