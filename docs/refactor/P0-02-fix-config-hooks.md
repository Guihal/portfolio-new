# P0-02. Фикс конфига и источников контента

**ID:** P0-02
**Фаза:** 0. Инфраструктура
**Статус:** done
**Приоритет:** critical
**Оценка:** 2ч
**Зависит от:** —

## Цель
Починить dev-регенерацию манифестов и устранить конкуренцию двух источников контента.

## Контекст / проблема
1. В `nuxt.config.ts` hook `builder:watch` вызывает `bun run generate-manifest` (через дефис), а в `package.json` команда называется `generate:manifest` (через двоеточие). **В dev-режиме манифест не пересобирается** при изменениях в `public/entry/`. После добавления новой папки разработчик получает устаревший манифест и не понимает, почему файл «не появился».
2. Архитектурно: `nitro:build:before` добавляет серверный asset `server/assets/entry`, при этом скрипты-генераторы (`scripts/generate-manifest.ts`, `generate-file-manifest.ts`) читают из `public/entry/`. Есть **два источника правды** для одного и того же контента.

## Затронутые файлы
- `nuxt.config.ts`
- `scripts/generate-manifest.ts`
- `scripts/generate-file-manifest.ts`
- `public/entry/` (перемещение → удаление)
- `server/assets/entry/` (целевая директория)
- `package.json` (проверить скрипты)

## Шаги
1. В `nuxt.config.ts` в hook `builder:watch` заменить два `execSync` на один `execSync('bun run generate:manifests')`.
2. Выбрать единственный источник: `server/assets/entry/` (контент не должен быть публично доступен напрямую).
3. Переместить весь текущий `public/entry/` → `server/assets/entry/`.
4. Переписать `scripts/generate-manifest.ts` и `generate-file-manifest.ts` на чтение из `server/assets/entry/`.
5. Обновить watcher в `nuxt.config.ts`: вместо `path.includes('public/entry')` → `path.includes('server/assets/entry')`.
6. Проверить `@nuxt/image` (в `public/imgs/` картинки остаются как есть, не трогаем).
7. Убрать `public/entry/` после успешной миграции.

## Критерии готовности
- [x] В dev-режиме добавление новой папки в `server/assets/entry/` → автоматическая регенерация манифестов (видно в логе `[manifest] Regenerating...`).
- [x] `bun run build` успешно завершается.
- [x] API `/api/filesystem/list`, `/get`, `/breadcrumbs` продолжают работать (smoke P0-06).
- [x] `public/entry/` отсутствует (удалён после миграции).
- [x] `@nuxt/image` не падает на картинках.

## Проверка
- Ручной: добавить папку `server/assets/entry/test-dir/` с `entity.json` → в dev появляется в Explorer.
- `bun run build && bun run preview` — prod-сборка рабочая.
