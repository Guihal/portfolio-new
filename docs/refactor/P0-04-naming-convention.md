# P0-04. Соглашение имён и структура файлов

**ID:** P0-04
**Фаза:** 0. Инфраструктура
**Статус:** done
**Приоритет:** low
**Оценка:** 1ч
**Зависит от:** —

## Цель
Зафиксировать единое соглашение об именовании и структуре. Переименовать файлы-нарушители, чтобы дальнейшие PR не добавляли новые стили.

## Контекст / проблема
В проекте сосуществуют четыре стиля:
- `Taskbar/Elements/` (PascalCase subdir)
- `Window/resize/` (lowercase subdir)
- `Programs/Explorer/Nav/` (PascalCase subdir)
- Константы: `OFFSET.ts`, `PROGRAMS.ts`, `CACHELIFETIME.ts` (SCREAMING_SNAKE в имени файла)

Плюс `Window/Window.d.ts` содержит **экспортируемые типы** и импортируется и как `./Window`, и как `./Window.d` — двойственность в импортах.

## Затронутые файлы
- Все внутри `app/components/`, `app/composables/`, `app/utils/`, `server/utils/`, `shared/`.
- Переименование: `OFFSET.ts` → `offset.ts`, `PROGRAMS.ts` → `programs.ts`, `CACHELIFETIME.ts` → `cacheLifetime.ts`, `PROGRAMHADLERS.ts` → удалить в P0-01 (пустой).
- Рефактор `Window/Window.d.ts` → `Window.ts` (обычный файл с export type).

## Соглашение (фиксируем)

### Директории компонентов
- PascalCase для «модулей»: `Taskbar/`, `Window/`, `Programs/`, `Workbench/`.
- lowercase для **подсекций внутри модуля**: `resize/`, `header/`, `composables/`, `utils/`, `nav/`.

### Файлы
- **Composables** — `useXxx.ts`. Глобальные — в `app/composables/`, локальные — рядом с компонентом.
- **Утилиты** — `xxxYyy.ts` (camelCase), без `use`-префикса.
- **Константы** — `xxxYyy.ts`, экспортируют через `export const FOO = …`. Имя файла — **не SCREAMING_SNAKE**.
- **Типы** — `xxx.ts` с `export type`. `.d.ts` только для амбиентных деклараций (модулей сторонних либ).
- **Компоненты Vue** — PascalCase.vue (`Frame.vue`) или `index.vue` для корневого компонента папки.

## Шаги
1. Переименовать `app/utils/constants/OFFSET.ts` → `offset.ts`, обновить импорты.
2. Переименовать `app/utils/constants/PROGRAMS.ts` → `programs.ts`, обновить импорты.
3. Переименовать `server/utils/CACHELIFETIME.ts` → `cacheLifetime.ts`, обновить импорты.
4. Превратить `app/components/Window/Window.d.ts` в `Window.ts`. Все импорты `./Window.d` → `./Window`.
5. Внутри `Programs/Explorer/Nav/` — решить: оставить PascalCase (соответствует «компонентной секции») или перевести в `nav/`. **Рекомендация**: оставить `Nav/` (это подкомпонент, а не подсекция). Унифицировать правило в `AGENTS.md`.
6. Обновить раздел «Структура проекта» в `AGENTS.md` (частично, детали в P7-01).

## Критерии готовности
- [x] Все импорты работают, `nuxi typecheck` чист.
- [x] `bun run build` успешен.
- [x] Соглашение добавлено как раздел в `AGENTS.md`.
- [x] Нет файлов с SCREAMING_SNAKE в имени.
- [x] Все `./Window.d` импорты заменены на `./Window` (фактически на `./types` — см. решение).

## Проверка
- Playwright smoke не ломается.
- `grep -r "\.d'" app/` — нет ложных импортов типов.
