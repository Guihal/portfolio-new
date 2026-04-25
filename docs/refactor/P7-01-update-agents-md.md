# P7-01. Обновить AGENTS.md

**ID:** P7-01
**Фаза:** 7. Документация
**Статус:** todo
**Приоритет:** low
**Оценка:** 1.5ч
**Зависит от:** Фаза 4 завершена

## Цель
Актуализировать `AGENTS.md` под новую структуру. Добавить диаграмму lifecycle окна и чек-листы для расширения.

## Контекст / проблема
После фаз 2–4 структура радикально меняется (Pinia-сторы, `useWindow`-фасад, `programs/` реестр, Shortcut-Base). Текущий `AGENTS.md` устарел в разделе «Структура проекта» и «Оконный менеджер».

## Затронутые файлы
- `AGENTS.md`
- (опционально) `README.md` — короткая ссылка на `AGENTS.md`.

## Шаги
1. Пересобрать раздел **Структура проекта**:
   - `app/stores/` (новое).
   - `app/programs/` (новое).
   - `app/components/Shortcut/Base.vue` + адаптеры (новое).
   - `app/components/Window/composables/useWindow.ts` + `useWindowBoundsAnimation/`.
   - `server/utils/manifest.ts` (вместо 4 утилит).
2. Обновить раздел **Оконный менеджер**:
   - Добавить ASCII-диаграмму lifecycle окна:
     ```
     open(path)
        │
        ▼
     useWindowsStore.create(path)
        │
        ▼
     <Window :windowOb=...> mounts
        │
        ├─► useWindow(windowOb)
        │      ├── routing: useWindowRoute
        │      ├── entity:  await useFetchEntity
        │      ├── focus:   useFocusState
        │      ├── bounds:  useWindowBoundsAnimation (RAF)
        │      ├── states:  useWindowStates
        │      ├── seo:     useSeoWindow
        │      └── preview: useWindowPreview (FrameObserver)
        │
        ▼
     provide('windowOb', windowOb) → <Content /> → <ProgramComponent />
     ```
3. Обновить раздел **Программы** — теперь data-driven (`app/programs/*.ts`).
4. Добавить раздел **Чек-листы**:
   - **Новая программа**: создать `programs/<name>.ts`, добавить entity в `server/assets/entry/<name>/entity.json`, при необходимости новый компонент в `components/Programs/<Name>/`.
   - **Новый API-эндпоинт**: файл в `server/api/filesystem/`, использовать `server/utils/errors.ts`, валидировать через `zod` (см. P5-02).
   - **Новый shortcut**: создать адаптер над `Shortcut/Base.vue`.
5. Удалить из `AGENTS.md` упоминания удалённых файлов (`PROGRAMHADLERS`, `useBatchedReactive`, и т.д.).
6. Проверить актуальность всех путей — `grep` по документу.

## Критерии готовности
- [ ] Раздел **Структура проекта** отражает реальное состояние репо.
- [ ] ASCII-диаграмма lifecycle окна добавлена.
- [ ] 3 чек-листа добавлены.
- [ ] Нет упоминаний удалённых файлов.
- [ ] Документ читается с нуля за 10 минут.

## Проверка
- Дать прочитать новому разработчику (симуляция: спросить ChatGPT «объясни по AGENTS.md, как добавить программу»).
- `grep` по упомянутым в документе путям — все существуют.
