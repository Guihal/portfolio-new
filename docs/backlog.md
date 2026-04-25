# Backlog: будущие фичи

Список идей вне текущего плана рефакторинга (`docs/refactor/`). Каждый пункт — отдельная будущая задача, не часть рефакторинга.

## Готовы к приоритизации

- (пусто сейчас — заполнить после завершения рефакторинга)

## Идеи (без оценки)

### UX

- **Runtime-темы (день/ночь)** — инфраструктура готова в [P6-01](refactor/P6-01-css-vars-theming.md) (CSS-переменные). Добавить переключатель в Taskbar или About-окне.
- **Keyboard shortcuts**:
  - Cmd/Ctrl+W — закрыть окно.
  - Cmd/Ctrl+M — свернуть.
  - Alt+Tab — переключить фокус между окнами.
  - Cmd+` — циклически переключать окна одной программы.
- **Persist окон** — сохранять `id` + bounds + focus в `localStorage`. При следующем визите восстанавливать.
- **Мобильный layout taskbar** — сейчас hard-coded 50px, обрезается safe-area на iPhone. Нужен адаптивный layout (после [P6-02](refactor/P6-02-breakpoints-and-fonts.md)).

### Content

- **Полнотекстовый поиск по файлам** — использовать `server/assets/file-manifest.json` (см. [P5-03](refactor/P5-03-file-manifest-scope.md)). Эндпоинт `/api/filesystem/search?q=…`.
- **Медиа-плеер** как новая программа (showcase «добавить программу = 1 файл» из [P4-01](refactor/P4-01-programs-registry.md)).
- **Markdown-просмотр** для `.md` файлов в Explorer.

### Tech

- **Миграция SCSS → только CSS** — если тем станет больше, SCSS может стать overhead-ом.
- **Service Worker** для offline-режима (манифест уже кэшируется).
- **i18n** — сейчас всё на русском; добавить английский через `@nuxtjs/i18n`.
- **Analytics** — отслеживание открытий окон (без PII).

### Производительность

- **Virtual scroll** в Explorer для больших папок.
- **Lazy-loading превью** — не генерировать `html-to-image` для окон, которые ещё не в taskbar.
- **Service Worker кэширование** API-ответов.
