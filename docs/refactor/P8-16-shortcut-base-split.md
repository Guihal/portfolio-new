# P8-16: Shortcut/Base.vue → external SCSS module

**Status:** todo
**Priority:** low
**Estimate:** 1.5ч
**Depends on:** P8-01
**Group:** E — File-size hard-fixes
**Sunset:** —

## Цель

`Shortcut/Base.vue` (141 LOC) — script ~35, template ~35, style ~70. Style вынести в external SCSS module.

## Изменения

```
app/components/Shortcut/
├── Base.vue                  (≤80; script + template)
└── Base.module.scss          (~70; стили вариантов desktop|list|nav)
```

`<style lang="scss" module>` syntax в Vue 3 — `useCssModule` доступ.

## Тесты

- Visual regression zero (E2E screenshot).
- 3 варианта (desktop/list/nav) рендерятся правильно.

## Acceptance criteria

- [ ] `Base.vue` ≤ 80 LOC.
- [ ] `Base.module.scss` присутствует.
- [ ] Все 3 variants работают.

## Risks

- **CSS module import** — Nuxt 4 поддерживает `<style module>` нативно.
- **Variant logic** — class binding через `$style.variantX`.
