# P1-02. Onboarding-флоу в app.vue

**ID:** P1-02
**Фаза:** 1. Фикс багов
**Статус:** done
**Приоритет:** high
**Оценка:** 1ч
**Зависит от:** P0-06

## Цель
Устранить несогласованность первого визита (cookie `about_visited`) и убрать SSR-гонку при инициализации окон.

## Контекст / проблема
В `app/app.vue`:
```
if (!aboutCookie.value && route.fullPath !== '/about-me') {
    aboutCookie.value = '1';
    await queuedPush('/about');
}
```
Проверяется `/about-me`, а редирект идёт на `/about`. При первом визите с URL `/projects` юзер попадёт на `/about` (которого нет как entity), а при повторном визите с `/about-me` cookie не выставится.

Плюс `clearAllWindowsState()` вызывается **до** создания окна из URL — при SSR это может дать пустой список окон клиенту, который потом догоняется клиентской гидрацией.

## Затронутые файлы
- `app/app.vue`
- Новый `app/composables/useAppBootstrap.ts`
- `public/entry/` или `server/assets/entry/` (проверить, что `about-me/entity.json` существует; `about/` тоже может быть)

## Шаги
1. Выбрать один канонический путь — `/about-me` (он уже есть в контенте).
2. Обновить условие и редирект — оба на `/about-me`.
3. Вынести bootstrap-логику в `useAppBootstrap()`:
   - проверка cookie + первичный редирект;
   - `clearAllWindowsState()` **после** роутерного резолва;
   - `useCreateAndRegisterWindow(route.fullPath)` если не `/`.
4. Вызвать `useAppBootstrap()` из `app.vue`.
5. Cookie `maxAge` оставить 1 год.

## Критерии готовности
- [x] Первый визит (без cookie) с любого URL → редирект на `/about-me` + cookie выставлен.
- [x] Повторный визит с `/about-me` → cookie не перезаписывается без нужды.
- [x] Повторный визит с `/` → Workbench без редиректов.
- [x] Повторный визит с `/projects/griboyedov` → окно с таким URL + фокус.
- [x] Нет двойного создания окна после гидрации (проверить `allWindows` в devtools Pinia).

## Проверка
- Playwright smoke `root.spec.ts` + новый тест `first-visit-redirects-to-about.spec.ts`.
- Ручной: `document.cookie = ''` → reload — видеть редирект.
