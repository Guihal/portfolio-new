# P0-05. Логгер и единая обработка ошибок

**ID:** P0-05
**Фаза:** 0. Инфраструктура
**Статус:** done
**Приоритет:** medium
**Оценка:** 2ч
**Зависит от:** P0-01

## Цель
Ввести тонкий логгер-обёртку вместо прямых `console.*` и единый обработчик серверных ошибок.

## Контекст / проблема
- После P0-01 все `console.log` удалены. Но некоторые места (ошибки загрузки, предупреждения инициализации) всё же требуют логирования.
- Без единой точки логгирования в prod-режиме логи засоряют браузерную консоль.
- В `useFetchWindowEntity.ts` и других местах `catch(err) { console.error(err) }` проглатывает ошибку вместо её обработки.
- Серверные `createError` разбросаны по эндпоинтам, сообщения не локализованы единообразно.

## Затронутые файлы
- Новый `shared/utils/logger.ts`.
- Новый `server/utils/errors.ts`.
- Все места с `console.warn`/`console.error` в `app/`, `server/`, `shared/`.
- `server/api/filesystem/*.ts` — использовать единый обработчик.

## Шаги
1. Создать `shared/utils/logger.ts` с API: `logger.debug(…)`, `logger.info(…)`, `logger.warn(…)`, `logger.error(…)`. Внутри — проверка `ENABLE_DEBUG_LOGS` (из `runtimeConfig`).
2. Заменить все `console.warn/error` на `logger.warn/error`. Не заменять `console.log` — их быть не должно после P0-01, линтер ловит.
3. Создать `server/utils/errors.ts` с хелперами:
   - `notFound(message: string)` — 404
   - `badRequest(message: string)` — 400
   - `serverError(err: unknown)` — 500 + логирование
4. В API (`list.ts`, `get.ts`, `breadcrumbs.ts`, `files.get.ts`) заменить прямые `createError` на вызовы из `errors.ts`.
5. Добавить в `runtimeConfig` (`nuxt.config.ts`) поле `enableDebugLogs` с default `false` в prod, `true` в dev.

## Критерии готовности
- [x] `shared/utils/logger.ts` существует, покрыт минимальным unit-тестом (через `vi.spyOn(console)`).
- [x] В исходниках нет прямых `console.warn/error` (только через logger).
- [x] Серверные эндпоинты используют `errors.ts`.
- [x] В prod-сборке `logger.debug` не попадает в bundle (tree-shake или gate по флагу).
- [x] ESLint не ругается.

## Проверка
- Ручной: в dev-режиме `logger.debug('test')` появляется в консоли. В prod (`bun run build && bun run preview`) — нет.
- Ошибка 404 из `/api/filesystem/get` возвращает единую структуру.
