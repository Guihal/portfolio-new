# P4-05. Shortcut Base + адаптеры

**ID:** P4-05
**Фаза:** 4. Programs / Content
**Статус:** done
**Приоритет:** medium
**Оценка:** 1.5ч
**Зависит от:** —

## Цель
Вынести общий shortcut-компонент и построить три адаптера. Упростить добавление новых мест, где используется «ярлык».

## Контекст / проблема
Сейчас есть три похожих shortcut-компонента:
- `app/components/Workbench/Shortcut/index.vue` — ярлык на рабочем столе.
- `app/components/Programs/Explorer/shortcut.vue` — строка в списке файлов.
- `app/components/Programs/Explorer/Nav/shortcut.vue` — пункт навигации слева.

Плюс утилиты `useGetShortcut.ts`, `getClickShortcutEvent.ts` — делят похожие детали.

## Затронутые файлы
- Новый `app/components/Shortcut/Base.vue` — общий компонент.
- `app/components/Workbench/Shortcut/index.vue` — переписать как адаптер.
- `app/components/Programs/Explorer/shortcut.vue` — адаптер.
- `app/components/Programs/Explorer/Nav/shortcut.vue` — адаптер.
- `app/components/Workbench/Shortcut/useGetShortcut.ts` — обобщить или переместить в `app/composables/`.

## Шаги
1. Создать `Shortcut/Base.vue`:
   - props: `file: FsFile`, `variant: 'desktop' | 'list' | 'nav'`.
   - slot: `icon`, `text` — для адаптерных переопределений.
   - общие стили-переменные (`--shortcut-color`).
   - обрабатывает клик (через `getClickShortcutEvent` — double-click на desktop, single на list/nav).
2. Переписать `Workbench/Shortcut/index.vue` → адаптер, использующий `Shortcut/Base` в режиме `desktop`.
3. Аналогично — Explorer shortcut и Nav shortcut.
4. `useGetShortcut` — оставить один (он возвращает `{ nameText, icon }` на основе `file.programType`).
5. Проверить различия в стилях между тремя — выделить через `variant`-классы.

## Критерии готовности
- [x] Общий `Shortcut/Base.vue` существует.
- [x] Три адаптера переключены.
- [x] Дублирование CSS уменьшено (замер через visual-check).
- [x] Playwright smoke все зелёные.
- [x] Добавление нового места для shortcut-а требует только адаптера.

## Проверка
- Ручной: все три места визуально как раньше.
- Smoke: двойной клик по desktop-shortcut открывает окно, single-click в Explorer-list — тоже.
