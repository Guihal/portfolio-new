# P5-01. Унификация manifest-модуля

**ID:** P5-01
**Фаза:** 5. Server
**Статус:** done
**Приоритет:** medium
**Оценка:** 1.5ч
**Зависит от:** —

## Цель
Свести 4 разрозненных серверных утилиты по манифесту в один модуль. Типы перенести в `shared/types/filesystem.ts`.

## Контекст / проблема
- `server/utils/getManifest.ts` — загрузка `manifest.json` с кэшем.
- `server/utils/getEntity.ts` — поиск в `flatIndex`.
- `server/utils/getAllEntitiesByPath.ts` — поиск в `tree` через `findNode`.
- `server/utils/getBreadcrumbs.ts` — breadcrumbs через `getEntity`.

Четыре файла, взаимозависимые, типы дублируются (`ManifestNode` есть в двух местах).

## Затронутые файлы
- Новый `shared/types/filesystem.ts` (без `.d.ts`): `Entity`, `FsFile`, `ManifestNode`, `Manifest`, `ProgramType`.
- Новый `server/utils/manifest.ts` (объединяет 4 утилиты).
- Удалить: `getManifest.ts`, `getEntity.ts`, `getAllEntitiesByPath.ts`, `getBreadcrumbs.ts`.
- `server/api/filesystem/*.ts` — обновить импорты.
- `shared/types/Entity.d.ts`, `FsFile.d.ts`, `Program.d.ts` — переместить контент в `filesystem.ts`, удалить файлы.

## Шаги
1. Создать `shared/types/filesystem.ts`, перенести все типы, зарефакторить на единый `ManifestNode` (сейчас его две слегка разные версии — в `getAllEntitiesByPath` и `getManifest`).
2. Создать `server/utils/manifest.ts`:
   - `loadManifest(): Promise<Manifest>`.
   - `getEntity(path: string): Promise<Entity | null>`.
   - `listChildren(path: string): Promise<FsFile[]>`.
   - `getBreadcrumbs(path: string): Promise<FsFile[]>`.
   - Внутренняя функция `findNode(tree, path): ManifestNode | null`.
3. Обновить 4 API-эндпоинта на импорт из `server/utils/manifest`.
4. Удалить 4 старых утилиты.
5. Удалить 3 `.d.ts`-файла типов (контент в `filesystem.ts`).
6. Покрыть `manifest.test.ts` — `findNode('/')`, `findNode('/about-me')`, `findNode('/nonexistent')`.

## Критерии готовности
- [x] `server/utils/` — один файл `manifest.ts` для всего, связанного с манифестом.
- [x] `shared/types/filesystem.ts` — единый источник типов.
- [x] `nuxi typecheck` чист.
- [x] Все API-эндпоинты работают (Playwright smoke зелёные).

## Проверка
- Unit-тесты на `findNode`.
- Ручной: все API возвращают то же, что раньше (сравнить через curl).
