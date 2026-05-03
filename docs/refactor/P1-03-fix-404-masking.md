# P1-03. 404 маскируется в useFetchWindowEntity

**ID:** P1-03
**Фаза:** 1. Фикс багов
**Статус:** done
**Приоритет:** high
**Оценка:** 1ч
**Зависит от:** P0-06

## Цель
Не глотать ошибку API. При 404/500 окно должно честно перейти в состояние ошибки, а пользователь — видеть страницу 404.

## Контекст / проблема
В `app/components/Window/composables/useFetchWindowEntity.ts`:
```
try {
    res = await $fetch('/api/filesystem/get', …);
} catch (err) {
    console.error(err);
}
```
Ошибка проглатывается. `useAsyncData.error` не заполнится, следовательно `watch(error, …)` с `createError` не сработает. Пользователь остаётся на «белом окне».

Плюс `immediate: true` **вместе** с `watch: [isNeedLoading]` может дать два параллельных запроса на старте.

## Затронутые файлы
- `app/components/Window/composables/useFetchWindowEntity.ts`

## Шаги
1. Убрать `try/catch` внутри `useAsyncData`.
2. Оставить один источник триггера — либо `immediate: true` (и реагировать через watch на `windowRoute`), либо `watch: [isNeedLoading]` без `immediate`. Рекомендация: `watch: [isNeedLoading], immediate: true`, но проверить что повторных запросов на mount не происходит.
3. `server: import.meta.server === true` → просто `server: import.meta.server`.
4. `watch(error, …)` должен реагировать только на переход `null/undefined → value` (игнорировать повторные пустые значения).
5. Ошибку логировать через `logger.error` (P0-05), не `console.error`.

## Критерии готовности
- [x] При запросе несуществующего пути (`/api/filesystem/get` → 404) пользователь видит страницу 404 (error.vue).
- [x] На mount окна выполняется **ровно один** запрос (проверить в devtools Network).
- [x] `useAsyncData.error` корректно заполняется.
- [x] `nuxi typecheck` чист.

## Проверка
- Ручной: в URL ввести `/nonexistent` → попасть на 404.
- Автоматический: Playwright-тест `invalid-path-shows-404.spec.ts`.
