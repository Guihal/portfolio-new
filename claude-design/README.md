# claude-design/

Design-system контекст для Claude (и людей) при работе над UI портфолио **Dimonya OS**. Папка собрана так, чтобы любой дизайн-промпт типа «сделай страницу X / компонент Y» мог стартовать только с её содержимого + краткой постановки задачи.

## Состав

```
claude-design/
├── DESIGN.md                       # ← главный документ. Концепция + палитра + типографика + pixel-эстетика + don't list + чек-листы
├── README.md                       # этот файл
├── assets/
│   ├── corners/                    # 4 SVG скруглений 4×4 (top/bottom × left/right)
│   ├── icons/                      # 4 иконки программ (about, explorer, project, tproject)
│   └── fonts.md                    # таблица шрифтов + где @font-face + правила
├── snippets/
│   ├── pixel-box.scss              # копируемый блок .pixel-box с комментариями про Chrome quirks
│   ├── color-tokens.scss           # :root --color-* + $colors map
│   ├── typography-mixin.scss       # t() миксин + 5 примеров вызова
│   └── container-queries.scss      # cw/ch/cwh миксины + breakpoints
└── patterns/
    ├── window.md                   # окно: WindowOb, useWindow, lifecycle, states, bounds
    ├── explorer.md                 # проводник: layout, List/Nav, pixel-box, container query
    ├── taskbar.md                  # taskbar: программы, Tooltip+preview, html-to-image
    └── shortcut.md                 # Shortcut/Base: variants desktop/list/nav, активация
```

## Как Claude должен это юзать

При дизайн-задаче (создать страницу, компонент, layout):

1. **Читать `DESIGN.md`** — концепция, палитра, типографика, don't list. Один раз на задачу, далее как справочник.
2. **Выбрать релевантный pattern** в `patterns/`:
   - Делаешь окно или фасад — `window.md`.
   - Список из FS / навигация по контенту — `explorer.md`.
   - UI taskbar / docked-панель / превью — `taskbar.md`.
   - Карточка-кликабельный-элемент — `shortcut.md`.
3. **Копировать SCSS из `snippets/`** в `app/assets/scss/...` если этих утилит ещё нет в проекте (они уже есть → не дублировать, ссылаться).
4. **Использовать `assets/`** как референс при создании новых SVG (corners — фиксированы, не модифицировать; иконки программ — как пример моно-цветного формата).

## Trust real source

Эта папка — **slow-moving snapshot**. При противоречии с реальным кодом (`app/`, `server/`, `shared/`) — **trust real code**.

Что обычно расходится первым:

- Точные пути файлов (`app/components/.../index.vue:42`) — компоненты могут переезжать.
- Версии breakpoints (sm/md/lg/xl) — могут меняться в `_breakpoints.scss`.
- Список programType — обновляется в `shared/types/filesystem.ts`.
- Содержимое `_settings.scss` — может менять резервные слои `default-1/2`.

Что **должно** оставаться стабильным:

- Концепция (раздел 1 DESIGN.md).
- Don't list (раздел 9).
- Pixel-эстетика (раздел 4).
- BEM-конвенции (раздел 6).

Если поменяется концептуальное правило (например, разрешим градиенты в каком-то месте) — обновить DESIGN.md явно, а не silently.

## Регенерация

Эта папка ведётся вручную, не через скрипт. Меняешь дизайн-систему — параллельно правишь `claude-design/`. Никакой автогенерации.

## За пределами этой папки

`AGENTS.md` (корень репо) — расширенный технический спек проекта (архитектура, stores, routing, API, чек-листы расширения). `claude-design/` — оптимизированная под design-задачи выжимка с фокусом на визуальные правила. Они дополняют друг друга, не дублируют.
