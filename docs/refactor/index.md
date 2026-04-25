# Рефакторинг Dimonya OS — оглавление задач

Разбивка плана рефакторинга на 32 задачи, сгруппированные по 7 фазам.
Каждая задача — отдельный `.md` файл в этой директории, именование: `P<phase>-<nn>-<slug>.md`.

**Общая оценка:** ≈ 12–15 рабочих дней.

## Статусы

- `todo` — не начата
- `in-progress` — в работе
- `review` — ждёт ревью / тестов
- `done` — закрыта

## Порядок выполнения (граф зависимостей)

```
Фаза 0 (подготовка) ─┐
                     ├─> Фаза 1 (багфиксы, параллельно) ✅ ─┐
                     │                                    │
                     └──────────────────────────────> Фаза 2 (Pinia) ─┐
                                                                       │
                                                                       ├─> Фаза 3 (window lifecycle) ─┐
                                                                       │                              │
                                                                       │                              ├─> Фаза 4 (programs)
                                                                       │                              │
                                                                       │                              ├─> Фаза 5 (server, параллельно) ✅
                                                                       │                              ├─> Фаза 6 (стили, параллельно)
                                                                       │                              └─> Фаза 7 (docs, параллельно)
```

## Таблица всех задач

### Фаза 0 — Инфраструктура

| ID | Задача | Приоритет | Оценка | Зависит от |
|----|--------|-----------|--------|-----------|
| P0-01 | [Чистка пустых файлов и debug-логов](P0-01-cleanup-empty-files.md) ✅ | high | 1ч | — |
| P0-02 | [Фикс конфига и источников контента](P0-02-fix-config-hooks.md) ✅ | critical | 2ч | — |
| P0-03 | [Lint, форматтер, lock-файлы, tsconfig](P0-03-lint-and-tooling.md) ✅ | medium | 2ч | — |
| P0-04 | [Соглашение имён и структура](P0-04-naming-convention.md) ✅ | low | 1ч | — |
| P0-05 | [Логгер и единая обработка ошибок](P0-05-logger-and-errors.md) ✅ | medium | 2ч | P0-01 |
| P0-06 | [Тестовый контур (Vitest + Playwright)](P0-06-test-harness.md) ✅ | critical | 4ч | P0-03 |

### Фаза 1 — Фикс существующих багов

| ID | Задача | Приоритет | Оценка | Зависит от |
|----|--------|-----------|--------|-----------|
| P1-01 | [[CRIT] Дубликаты окон не детектятся](P1-01-fix-duplicate-window-detection.md) ✅ | critical | 0.5ч | P0-06 |
| P1-02 | [Onboarding-флоу в app.vue](P1-02-fix-onboarding-flow.md) ✅ | high | 1ч | P0-06 |
| P1-03 | [404 маскируется в useFetchWindowEntity](P1-03-fix-404-masking.md) ✅ | high | 1ч | P0-06 |
| P1-04 | [Дубликат fullscreen-ready логики](P1-04-merge-fullscreen-ready-logic.md) ✅ | medium | 1ч | P0-06 |
| P1-05 | [Некорректный width clamp](P1-05-fix-clampers.md) ✅ | medium | 1ч | P0-06 |
| P1-06 | [Циклы в useWindowRoute](P1-06-fix-window-route-loops.md) ✅ | medium | 2ч | P0-06 |
| P1-07 | [Перфоманс useFrameObserver](P1-07-optimize-frame-observer.md) ✅ | high | 1.5ч | P0-06 |
| P1-08 | [Мелкие баги (typo, шрифты, layout)](P1-08-fix-small-bugs.md) ✅ | low | 1ч | P0-06 |
| P1-09 | [SSR-утечки module-scope state](P1-09-fix-ssr-module-scope-leaks.md) ✅ | high | 2ч | P0-06 |

### Фаза 2 — Pinia-сторы

| ID | Задача | Приоритет | Оценка | Зависит от |
|----|--------|-----------|--------|-----------|
| P2-01 | [Скелеты Pinia-сторов](P2-01-setup-pinia-stores-skeleton.md) ✅ | high | 3ч | Фаза 1 |
| P2-02 | [Composables → фасады над сторами](P2-02-migrate-composables-to-facades.md) ✅ | high | 3ч | P2-01 |
| P2-03 | [Миграция консюмеров и чистка](P2-03-migrate-consumers-and-cleanup.md) | high | 4ч | P2-02 |

### Фаза 3 — Window lifecycle

| ID | Задача | Приоритет | Оценка | Зависит от |
|----|--------|-----------|--------|-----------|
| P3-01 | [Единый useWindow-фасад](P3-01-useWindow-facade.md) | high | 3ч | P2-03 |
| P3-02 | [Единый API states](P3-02-states-unified-api.md) | high | 2ч | P2-03 |
| P3-03 | [Упразднить тривиальные composables](P3-03-drop-trivial-composables.md) | medium | 2ч | P3-01 |
| P3-04 | [Рефактор useWindowLoop](P3-04-refactor-window-loop.md) | medium | 2ч | P2-03 |
| P3-05 | [useQueuedRouter в Pinia](P3-05-refactor-queued-router.md) | medium | 1.5ч | P2-03 |

### Фаза 4 — Programs / Content

| ID | Задача | Приоритет | Оценка | Зависит от |
|----|--------|-----------|--------|-----------|
| P4-01 | [Data-driven реестр программ](P4-01-programs-registry.md) | medium | 2ч | P3-01 |
| P4-02 | [ProgramContext для режимов](P4-02-program-context.md) | medium | 2ч | P4-01 |
| P4-03 | [Рефактор Explorer](P4-03-refactor-explorer.md) | low | 1.5ч | P4-02 |
| P4-04 | [Рефактор Frame](P4-04-refactor-frame.md) | low | 2ч | P3-01 |
| P4-05 | [Shortcut Base + адаптеры](P4-05-shortcut-base.md) ✅ | medium | 1.5ч | — |

### Фаза 5 — Server

| ID | Задача | Приоритет | Оценка | Зависит от |
|----|--------|-----------|--------|-----------|
| P5-01 | [Унификация manifest-модуля](P5-01-unify-manifest-module.md) ✅ | medium | 1.5ч | — |
| P5-02 | [Cache + API на GET + zod](P5-02-cache-and-api-GET.md) ✅ | medium | 2ч | P5-01 |
| P5-03 | [Область применения file-manifest](P5-03-file-manifest-scope.md) ✅ | low | 0.5ч | P5-01 |

### Фаза 6 — Стили

| ID | Задача | Приоритет | Оценка | Зависит от |
|----|--------|-----------|--------|-----------|
| P6-01 | [CSS-переменные и runtime-темы](P6-01-css-vars-theming.md) | low | 2ч | — |
| P6-02 | [Breakpoints и шрифты](P6-02-breakpoints-and-fonts.md) | low | 1ч | — |

### Фаза 7 — Документация

| ID | Задача | Приоритет | Оценка | Зависит от |
|----|--------|-----------|--------|-----------|
| P7-01 | [Обновить AGENTS.md](P7-01-update-agents-md.md) | low | 1.5ч | Фаза 4 |
| P7-02 | [Backlog будущих фич](P7-02-backlog-future-features.md) ✅ | low | 0.5ч | — |

## Общие критерии готовности рефакторинга

- [ ] Все 5 Playwright-smoke тестов зелёные.
- [ ] `nuxi typecheck` без ошибок при `strict: true` + `noUncheckedIndexedAccess: true`.
- [ ] `biome check` и `nuxt lint` чисто.
- [ ] `app/components/Window/index.vue` ≤ 40 строк.
- [ ] Нет `console.log` в исходниках (проверяется линтером).
- [ ] Нет пустых файлов в `app/`, `shared/`, `server/`.
- [ ] `AGENTS.md` актуализирован.
- [ ] Добавление новой программы демонстрируется одним PR на 2–3 файла.
