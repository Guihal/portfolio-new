# P4-03. Рефактор Explorer

**ID:** P4-03
**Фаза:** 4. Programs / Content
**Статус:** todo
**Приоритет:** low
**Оценка:** 1.5ч
**Зависит от:** P4-02

## Цель
Разделить `Programs/Explorer/index.vue` на контейнер и список. Гарантировать типобезопасный доступ к `data`.

## Контекст / проблема
`app/components/Programs/Explorer/index.vue` смешивает:
- загрузку данных через `useAsyncData`;
- рендер левой панели (Nav + Facts);
- рендер списка файлов / пустого состояния.

Плюс `data?.length > 0` при типе `FsFile[] | null` — нечёткая типизация (после P0-03 строгий режим поломает это).

## Затронутые файлы
- `app/components/Programs/Explorer/index.vue` (контейнер)
- Новый `app/components/Programs/Explorer/List.vue` (список + empty-state)
- `app/components/Programs/Explorer/Nav/index.vue` (без изменений)

## Шаги
1. В `index.vue` оставить:
   - `inject('windowOb')`, `inject('windowRoute')`.
   - `useAsyncData` с `transform: (data) => data ?? []` — `data.value` всегда `FsFile[]`.
   - Рендер: `<div class="explorer"><div class="explorer__left"><Nav /><ClientOnly><Facts /></ClientOnly></div><List :items="data" /></div>`.
2. Создать `List.vue`:
   - props: `items: FsFile[]`.
   - рендер: пустое состояние, если `items.length === 0`; иначе — список `Shortcut`.
   - стили пустого состояния переехать сюда.
3. Упростить `useAsyncData` ключ: `'explorer-' + windowRoute.value` (без `f`).
4. `server: import.meta.server ? true : false` → `server: true`.
5. Удалить debug `console.log`.

## Критерии готовности
- [ ] `Explorer/index.vue` — только контейнер (~40 строк).
- [ ] `List.vue` — только рендер списка и empty-state.
- [ ] `data.value` всегда `FsFile[]`.
- [ ] Playwright smoke `shortcut-opens-window` зелёный.
- [ ] Ручной: открыть пустую папку → видно «Тут ничего нет :(».

## Проверка
- Ручной smoke.
- `nuxi typecheck` чист.
