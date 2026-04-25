# P1-08. Мелкие баги (typo, шрифты, layout)

**ID:** P1-08
**Фаза:** 1. Фикс багов
**Статус:** done
**Приоритет:** low
**Оценка:** 1ч
**Зависит от:** P0-06

## Цель
Закрыть ворох мелких дефектов, которые по отдельности не блокируют, но создают шум в коде.

## Контекст / проблема
Собраны в один PR, потому что каждый — одна строка:

1. `app/components/Window/composables/useWindowLoop/Preprocessor.ts:60` — метод `getEaysied` → должен быть `getEased` (опечатка).
2. `app/components/Programs/Explorer/index.vue:96` — `font-family: Pix, systen-ui` — опечатка `systen-ui` (должно быть `system-ui`), плюс шрифт `Pix` нигде не подключён.
3. `app/components/Window/header/index.vue:35` — `.window__header__wrapper { width: calc(100% - 130px); }` — магическое число 130px, ломается если nav станет шире. Переписать через `flex: 1 1 auto` и `.window__header_el { display: flex; align-items: center; }` (уже есть).
4. `app/components/Programs/Explorer/index.vue:24` — `server: import.meta.server ? true : false` → просто `server: import.meta.server`.
5. `app/components/Programs/Explorer/index.vue:10` — ключ `useAsyncData` `'explorer-${windowRoute.value}f'` — паразитный суффикс `f`, удалить.

## Затронутые файлы
- `app/components/Window/composables/useWindowLoop/Preprocessor.ts`
- `app/components/Programs/Explorer/index.vue`
- `app/components/Window/header/index.vue`
- `app/components/Window/composables/useWindowLoop/useWindowLoop.ts` (обновить вызов `getEased`)

## Шаги
1. Переименовать `getEaysied` → `getEased` (включая вызов в `calculate`).
2. В Explorer убрать `font-family: Pix, …`. Либо выкинуть стиль, либо заменить на переменную шрифта из `_settings.scss`.
3. В header убрать магическое `calc(100% - 130px)`, перейти на flex.
4. Упростить `server: import.meta.server ? true : false`.
5. Убрать суффикс `f` в ключе asyncData.

## Критерии готовности
- [x] Все 5 правок применены.
- [x] `nuxi typecheck` и `eslint` чисто.
- [x] Explorer на пустой папке показывает «Тут ничего нет :(» в правильном шрифте.
- [x] Header окна адекватно рендерится при разной ширине.

## Проверка
- Ручной: открыть любое окно — визуально header и Explorer нормальные.
- Playwright smoke не ломается.
