# Шрифты Dimonya OS

В проекте — **один шрифт**: `PixCyrillic`. Используется везде: body, заголовки, breadcrumbs, ярлыки, badges, loader. Никаких body-mono или decorative-альтернатив.

## Семейство

| Имя `font-family` | Файл | Где `@font-face` | Через что подключается |
|---|---|---|---|
| `PixCyrillic` | `app/assets/fonts/PixCyrillic.woff2` | `app/assets/scss/fonts.scss` | `$t-default = 'PixCyrillic', system-ui, sans-serif` (vars.scss); default `$family` в `t()` миксине |

## История

- Раньше было три шрифта: Ithaca (decorative), IBMPlexMono (body-mono), PixCyrillic (loader-only).
- Ithaca убрали (визуальное решение), затем IBMPlexMono тоже — упростили до одного PixCyrillic ради чистоты pixel-эстетики.
- Никаких миграций для контента не требовалось — все вызовы шли через `$t-default` или дефолт `t()` миксина, а они теперь оба резолвятся в PixCyrillic.

## Веса

`PixCyrillic.woff2` — variable-вес НЕ поддерживает (один статический файл). `font-weight: 400/600/700/...` в SCSS будут браузерным fake-bold (synthetic). Если нужны реальные веса — добавить дополнительные `.woff2` файлы и расширить `@font-face` блок в `fonts.scss`.

## Fallback

`system-ui, sans-serif` подставляется при ошибке загрузки `.woff2`. `font-display: swap` — ждёт минимально, потом блок ради body. В UI это означает, что при медленной сети первый paint увидит system-ui без пиксельной эстетики, потом переключится. Это приемлемо.

## Никогда не делать

- ❌ `font-family: 'Inter', ...` или иной ad-hoc шрифт прямо в компоненте — только `$t-default` или `t()` миксин.
- ❌ `font-family: monospace` — используем `$t-default` (с системным fallback).
- ❌ Добавлять новые семейства без обновления этого файла + DESIGN.md + AGENTS.md.

## Если хочется другой шрифт для конкретного места

Передать `$family` параметр в `t()` миксин:

```scss
@include t(20px, 1.2, 'default-contrast', 600, 'CustomFont');
```

И добавить `@font-face` в `fonts.scss`. Но желательно — обсудить с product-стороной перед добавлением второго семейства.
