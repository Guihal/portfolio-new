# P4-04. Рефактор Frame (taskbar preview)

**ID:** P4-04
**Фаза:** 4. Programs / Content
**Статус:** todo
**Приоритет:** low
**Оценка:** 2ч
**Зависит от:** P3-01

## Цель
Разделить `Taskbar/Elements/Program/Frame.vue` (183 строки) на логические куски. Упростить вычисление позиций превью.

## Контекст / проблема
`Frame.vue` смешивает 5 обязанностей:
1. Вычисление `frameWidth/Height/Left/Top` (~20 строк computed).
2. Управление `src` превью (ref + watch — непонятное кеширование).
3. Close-кнопка + крестик (HTML + стили).
4. Hover-логика (onPreview/offPreview → state.preview).
5. Вёрстка контейнера.

## Затронутые файлы
- `app/components/Taskbar/Elements/Program/Frame.vue` (упрощается)
- Новый `app/components/Taskbar/Elements/Program/useTaskbarFramePosition.ts`
- Новый `app/components/Taskbar/Elements/Program/useWindowPreview.ts`
- Новый `app/components/Taskbar/Elements/Program/FrameCloseButton.vue`

## Шаги
1. Создать `useTaskbarFramePosition(windowOb)`:
   - возвращает `{ frameWidth, frameHeight, frameLeft, frameTop }` (Computed<number>).
   - чистая функция от `calculated`, `contentArea`, `scale`.
2. Создать `useWindowPreview(windowOb)`:
   - возвращает `{ src, onPreview, offPreview }`.
   - `src` через `useFrameStore` (P2-01).
   - `onPreview/offPreview` — `useWindowsStore.setState/clearState(id, 'preview')` (P3-02).
3. Создать `FrameCloseButton.vue` — кнопка с крестиком, emit `close`.
4. В `Frame.vue` остаётся: инъекция `windowOb`, вызов 2 хуков, рендер с `<FrameCloseButton @close="close">` и `<img :src :style="…" />`.
5. Close и фокус остаются на уровне Frame (удалить окно + фокус).

## Критерии готовности
- [ ] `Frame.vue` ≤ 80 строк.
- [ ] 2 composable-а выделены.
- [ ] Close-кнопка — отдельный компонент.
- [ ] Playwright `close-via-taskbar.spec.ts` зелёный.
- [ ] Hover на frame показывает preview (class `.window.preview`).

## Проверка
- Ручной: hover на frame → окно выдвигается (preview-class).
- Close через крестик — окно исчезает.
