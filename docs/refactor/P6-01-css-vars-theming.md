# P6-01. CSS-переменные и runtime-темы

**ID:** P6-01
**Фаза:** 6. Стили
**Статус:** todo
**Приоритет:** low
**Оценка:** 2ч
**Зависит от:** —

## Цель
Перевести `$colors` (SCSS-map) на CSS custom properties. Это даёт возможность переключать темы без пересборки.

## Контекст / проблема
Сейчас в `app/assets/scss/vars.scss` задан `$colors: (…)`, а в `_settings.scss` эти же значения записаны как `:root { --color-…: … }`. Два источника правды. Функция `c('accent')` из `functions.scss` возвращает SCSS-значение (compile-time).

Это блокирует runtime-темы (день/ночь, пользовательские темы). Чтобы переключить тему — сейчас нужна пересборка.

## Затронутые файлы
- `app/assets/scss/vars.scss`
- `app/assets/scss/functions.scss`
- `app/assets/scss/_settings.scss`
- Все `.vue` файлы с `c('…')` (значительная часть) — **не требуется** правка, если `c()` теперь возвращает `var(--color-…)`.

## Шаги
1. В `_settings.scss` разместить **одно** объявление CSS-переменных:
   ```
   :root {
     --color-accent: #db481d;
     --color-main: #40b567;
     --color-default: #151515;
     --color-default-1: #181818;
     --color-default-2: #1d1a1a;
     --color-default-3: #2f2626;
     --color-default-contrast: #cecece;
   }
   ```
2. В `functions.scss` переписать `@function c($name) { @return var(--color-#{$name}); }`.
3. `vars.scss` — оставить как источник начальных значений (чтобы можно было использовать в `rgba($colors, 0.5)`-подобных местах). Или удалить, если нигде не используется иначе чем через `c()`.
4. Проверить все вхождения вида `rgba(c('default'), 0.5)` — это работает в CSS через `color-mix` или новым `rgb(var(--color-default) / 0.5)` (требует хранить цвета в формате `R G B`).
   - **Рекомендация**: хранить цвета в двух форматах — hex (для `c()`) и RGB-channels (для alpha-compositing).
5. Добавить data-атрибут темы: `<html data-theme="dark">` и в `_settings.scss` блок `[data-theme="dark"] { --color-default: #0a0a0a; … }` (на перспективу; полностью реализовать — в P7-02).

## Критерии готовности
- [ ] Цвета описаны в CSS-переменных один раз.
- [ ] `c('accent')` возвращает `var(--color-accent)`.
- [ ] Визуальные регрессии отсутствуют (pixel-compare или ручной смоук).
- [ ] Возможность переключить тему через `document.documentElement.dataset.theme = 'dark'` работает (базовая проверка).

## Проверка
- Ручной: в devtools Elements → изменить `--color-accent` на `blue` → весь UI мгновенно меняет акцент.
