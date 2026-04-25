# P5-02. Cache + API на GET + zod

**ID:** P5-02
**Фаза:** 5. Server
**Статус:** done
**Приоритет:** medium
**Оценка:** 2ч
**Зависит от:** P5-01

## Цель
Перевести read-only API на GET с query (чтобы Vercel Edge кэшировал), включить кеш манифеста с реальным `maxAge`, валидировать `path` через zod.

## Контекст / проблема
- `CACHE_LIFETIME = 0` — кэш фактически отключен.
- `list` и `breadcrumbs` — POST с body (Vercel Edge не кэширует POST).
- Нет валидации path → потенциальный path-traversal при будущем расширении (например, если API начнёт читать файлы с диска).

## Затронутые файлы
- `server/utils/manifest.ts` (из P5-01) — добавить кэш.
- `server/api/filesystem/list.ts` — POST → GET.
- `server/api/filesystem/breadcrumbs.ts` — POST → GET.
- `server/api/filesystem/get.ts` — уже кэширован, обновить `maxAge`.
- Новый `server/utils/validation.ts` — zod-схемы.
- `app/components/Programs/Explorer/index.vue` — `$fetch` → GET с query.
- Другие места, где вызывается `/api/filesystem/list`, `/breadcrumbs`.

## Шаги
1. Установить `zod`.
2. Создать `server/utils/validation.ts`:
   - `pathSchema = z.string().min(1).refine(not-traversal)` — отвергать `../`, двойные слэши, `..\\`.
3. Обернуть `loadManifest` в `defineCachedFunction` с `maxAge: 60` в dev, `maxAge: 3600` в prod.
4. `list.ts`: `defineEventHandler` с `getQuery(event)`, извлечение `path`, валидация через zod.
5. `breadcrumbs.ts` — аналогично.
6. `get.ts`: обновить `defineCachedEventHandler` с `maxAge: 3600`, использовать GET (опционально — оставить POST если body заметно удобнее). **Рекомендация:** оставить `get.ts` как POST, но переписать ключ кеша на `headers: ['...']`, либо переделать на GET для единообразия.
7. Обновить клиента (`Programs/Explorer/index.vue`, и везде, где `$fetch('/api/filesystem/list', …)` идёт с body): метод GET + `query: { path }`.

## Критерии готовности
- [x] `list` и `breadcrumbs` — GET.
- [x] `loadManifest` кэшируется через `defineCachedFunction`.
- [x] zod-валидация path работает (попытка `../` → 400).
- [x] Все API тесты и Playwright smoke зелёные.
- [x] Responses проходят через Vercel Edge-кэш (проверить через `x-cache`-header на preview).

## Проверка
- `curl "https://preview.vercel/api/filesystem/list?path=/" -I` → видно `x-cache: HIT` на втором запросе.
- Unit: `pathSchema.parse('../../etc/passwd')` — кидает ошибку.
