# P6-02. Breakpoints и шрифты

**ID:** P6-02
**Фаза:** 6. Стили
**Статус:** todo
**Приоритет:** low
**Оценка:** 1ч
**Зависит от:** —

## Цель
Упорядочить breakpoint-ы в одном файле. Починить шрифт `Pix`/`systen-ui` в Explorer. Сделать типографику управляемой переменной.

## Контекст / проблема
1. В компонентах есть `@include cw('md')` — миксин container-query. Определение breakpoint-ов разбросано (или неочевидно).
2. `Explorer/index.vue` использует `font-family: Pix, systen-ui` — `Pix` нигде не подключён, `systen-ui` — опечатка.
3. В `_settings.scss` и `fonts.scss` задаются `Ithaca` и `IBMPlexMono`, но компоненты ссылаются напрямую — нет переменной-абстракции.

## Затронутые файлы
- Новый `app/assets/scss/_breakpoints.scss` (если ещё нет одного места).
- `app/assets/scss/mixins.scss` (миксин `cw` читает из `_breakpoints.scss`).
- `app/assets/scss/_settings.scss` (объявление `$t-default`, `$t-mono`).
- `app/components/Programs/Explorer/index.vue` (шрифт).
- Другие места с `font-family:` напрямую (grep).

## Шаги
1. Создать/найти `_breakpoints.scss` с картой:
   ```
   $breakpoints: (
     sm: 480px,
     md: 768px,
     lg: 1024px,
     xl: 1280px,
   );
   ```
2. Миксин `cw($key)` в `mixins.scss` принимает ключ, резолвит в `@container window (max-width: …)`.
3. В `_settings.scss` добавить `$t-default: 'Ithaca', system-ui, sans-serif;` и `$t-mono: 'IBMPlexMono', monospace;`.
4. `Explorer/index.vue` заменить `font-family: Pix, systen-ui` на `font-family: $t-default` (через SCSS-переменную; работает, т.к. globals injected).
5. Проверить `grep -r "font-family:" app/` — стандартизировать везде.

## Критерии готовности
- [ ] `_breakpoints.scss` — единственная точка определения breakpoint-ов.
- [ ] Нет `Pix` и `systen-ui` в коде.
- [ ] Все компоненты используют `$t-default`/`$t-mono` или наследуют от `body`.
- [ ] Визуальная регрессия отсутствует.

## Проверка
- Ручной: текст в Explorer рендерится в Ithaca (наблюдаемо в devtools → Computed → font-family).
- Playwright smoke.
