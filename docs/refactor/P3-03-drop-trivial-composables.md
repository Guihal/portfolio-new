# P3-03. Упразднить тривиальные composables

**ID:** P3-03
**Фаза:** 3. Window lifecycle
**Статус:** todo
**Приоритет:** medium
**Оценка:** 2ч
**Зависит от:** P3-01

## Цель
Удалить/слить composables, у которых нет содержательной логики — только 1–2 watch-а или одна обёртка.

## Контекст / проблема
Несколько composables существуют «для декомпозиции», но никакой содержательной логики не несут, создают дополнительный слой переходов в IDE без выгоды.

## Затронутые файлы

### Упразднить
- `app/components/Window/composables/useSetFullscreenObserver.ts` — логика ("при mount включить fullscreen + следить за contentArea") переносится в `useWindowStates` через `nextTick` + watcher; магический `setTimeout(100)` удаляется.
- `app/components/Window/composables/useSetLoadingState.ts` (20 строк) — один watch, инлайн в `useWindow`.
- `app/components/Window/composables/useIsInerractionWindow.ts` (7 строк) — при единственном использовании инлайн.

### Слить
- `app/components/Window/composables/useFetchWindowEntity.ts` + `app/composables/useWindowFetch.ts` → новый `app/components/Window/composables/useFetchEntity.ts` (единая сигнатура + loading-state).

## Шаги
1. Проверить `grep` на все три композабла-кандидата на удаление — какие файлы их импортируют.
2. Переписать логику в `useWindowStates` (для fullscreen-observer) и `useWindow` (для loading-state inline).
3. Удалить 3 файла.
4. Создать `useFetchEntity(windowOb, windowRoute)`:
   - Внутри: `useWindowFetch<Entity>` + `useAsyncData` (из P1-03).
   - Возврат: `{ entity: Ref<FsFile | null>, isLoading: Ref<boolean>, error: Ref<Error | null> }`.
5. Удалить `useWindowEntityFetcher.ts` и `useWindowFetch.ts`.

## Критерии готовности
- [ ] Перечисленные файлы удалены.
- [ ] Функциональность сохранена (Playwright smoke).
- [ ] `Window/composables/` содержит не более 8 файлов.
- [ ] `nuxi typecheck` чист.

## Проверка
- Полный smoke.
- Ручной: открыть окно → видно loader → загрузка entity → исчезает loader.
