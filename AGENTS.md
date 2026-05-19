# AGENTS.md — portfolio-new

> **Dimonya OS — Portfolio**
> Nuxt 4 SPA-приложение в стиле ретро-ОС. Окна, таскбар, файловый менеджер.
> **Менеджер пакетов: только Bun.** Не использовать npm/pnpm/yarn.

---

## Стек

| Технология | Версия | Роль |
|------------|--------|------|
| Nuxt | ^4.4.2 | Фреймворк (SPA-режим, Nitro + Vite) |
| Vue | ^3.5.33 | UI-фреймворк |
| Vue Router | ^5.0.6 | Роутинг |
| TypeScript | strict + `noUncheckedIndexedAccess` | Типизация |
| Bun | ^1.3.13 | Runtime, пакетный менеджер, скрипты |
| Pinia | ^0.11.3 (@pinia/nuxt) | State management |
| Zod | ^4.3.6 | Runtime-валидация |
| SCSS | ^1.99.0 | Стили (globals, mixins, vars) |
| html-to-image | ^1.11.13 | Генерация превью окон |
| @nuxt/image | 2.0.0 | Оптимизация изображений |
| @nuxt/eslint | 1.15.2 | Линтинг |

**Dev / Test / CI:**
- Vitest ^4.1.5 + jsdom — юнит-тесты
- Playwright ^1.59.1 — E2E (chromium)
- ESLint — type-aware rules, projectService
- Biome ^2.4.13 — форматирование + organize imports
- lefthook ^2.1.6 — pre-commit / pre-push хуки

---

## Команды

```bash
# Установка
bun install

# Разработка (генерирует манифесты + dev-сервер)
bun run dev

# Сборка (Vercel preset)
bun run build

# Статическая генерация
bun run generate

# Проверки
bun run typecheck      # TypeScript strict
bun run lint           # ESLint
bun run biome:check    # Biome linter

# Тесты
bun run test:unit      # Vitest (jsdom)
bun run test:unit:watch
bun run test:e2e       # Playwright (chromium, SPA-режим)

# Манифесты (автогенерация при dev/build)
bun run generate:manifests
bun run generate:manifest        # проектный манифест
bun run generate:file-manifest   # файловый манифест

# Preview
bun run preview
```

---

## Структура

```
portfolio-new/
├── app/                    # Nuxt 4 app directory
│   ├── assets/             # SCSS, шрифты, SVG, иконки
│   │   ├── scss/           # globals, vars, mixins, reset
│   │   ├── fonts/
│   │   ├── svg/
│   │   └── icons/programs/
│   ├── components/         # Vue SFC (max 150 LOC enforced)
│   │   ├── Taskbar/
│   │   ├── Window/
│   │   └── ...
│   ├── composables/        # Vue composables
│   │   ├── global/
│   │   ├── shared/
│   │   ├── window/
│   │   └── useCascadeLayout.ts
│   ├── layouts/
│   │   └── default.vue
│   ├── programs/           # Реестр программ (about, explorer, project, code, etc.)
│   ├── services/           # Чистая бизнес-логика (изолирована от Vue/Pinia)
│   │   ├── filesystem/
│   │   ├── animationScheduler.ts
│   │   ├── clipboard.ts
│   │   └── README.md
│   ├── stores/             # Pinia stores
│   │   ├── bounds.ts
│   │   ├── windows.ts
│   │   ├── windowsUI.ts
│   │   └── ...
│   ├── utils/              # Утилиты (debounce, math, constants)
│   ├── app.vue             # Root
│   └── error.vue
├── server/                 # Nitro server
│   ├── api/filesystem/     # REST API для файлового менеджера
│   ├── utils/              # Server utils (manifest, cache, validation)
│   └── assets/entry/       # Статические ассеты проектов (код, превью)
├── shared/                 # Код, shared между client и server
│   ├── types/
│   └── utils/
├── tests/
│   ├── unit/               # Vitest
│   └── e2e/                # Playwright
├── scripts/                # Build-скрипты (манифесты, проверки)
├── docs/                   # Документация проекта
├── public/                 # Статика
├── nuxt.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── eslint.config.mjs
├── biome.json
├── lefthook.yml
└── tsconfig.json           # references to .nuxt/tsconfig.*.json
```

---

## Naming Conventions

- **Компоненты:** PascalCase директории + `index.vue` для entry-point
- **Composables:** `useXxx.ts` (или `useXxx/` с индексом если сложный)
- **Stores:** camelCase, единственное число (`windows.ts`, не `windowsStore.ts`)
- **Services:** camelCase, чистые функции, никаких импортов из `composables/` / `stores/` / `components/`
- **API routes:** kebab-case (`filesystem/list.ts`)
- **SCSS:** `_partial.scss` для миксинов/настроек, `globals.scss` — единая точка входа
- **Манифесты:** авто-генерируются, не редактировать вручную

---

## Архитектурные решения

### SPA-режим
- `ssr: !process.env.NUXT_TEST_SPA` — SSR выключен в проде, включён только для E2E (Playwright запускает с `NUXT_TEST_SPA=1`)
- Nitro preset: `vercel` — деплой на Vercel

### Оконная система
- Pinia-стораж `windows.ts` — единый источник правды для состояния окон
- `windowsUI.ts` — UI-специфичное (фокус, фреймы, превью)
- `bounds.ts` — геометрия и позиционирование
- `services/animationScheduler.ts` — централизованный RAF-шедулер, избегаем конфликтов анимаций

### Файловый менеджер
- Server API: `/api/filesystem/{list,get,content,breadcrumbs,asset}`
- Манифесты (авто-генерируемые) описывают иерархию проектов и файлов
- Кэширование: `s-maxage=3600` для API, `86400` для ассетов

### Лимиты (enforced)
- **150 LOC max** на файл — ESLint `max-lines: error`
- **Vue SFC strict** — скрипт `scripts/check-vue-sfc-size.ts` в pre-commit
- **services/ изоляция** — ESLint `no-restricted-imports` запрещает импорты из `composables/`, `stores/`, `components/`
- **complexity ≤ 12**, **max-lines-per-function ≤ 60** — warn

---

## Безопасность

- **НЕ коммитить `.env` / `.env.*`** — в `.gitignore`, пример в `.env.example`
- **НЕ логировать токены / ключи / session-данные**
- **НЕ выдавать наружу:** `PROXY_AUTH_TOKEN`, cookies, session-токены
- Server assets (`server/assets/entry/`) — публичные статические файлы проектов, не содержат секретов
- Runtime config: `public.enableDebugLogs` — включается только в dev

---

## Работа с агентами

### Ветки
- `main` — стабильная
- Фичи: `feature/xxx` или `feat/xxx`
- Фиксы: `fix/xxx`
- Рефактор: `refactor/xxx`

### Pre-commit (lefthook)
1. Biome check + auto-fix staged files
2. ESLint staged files
3. TypeScript typecheck
4. Vue SFC size check (`scripts/check-vue-sfc-size.ts --strict`)

### Pre-push
1. Unit tests (`vitest run`)
2. Rules drift check (`scripts/check-rules-drift.ts`)

### Auto-commit
- После сессии агента — `git add` + `git commit` если есть изменения
- Сообщение: конвенциональное (`feat:`, `fix:`, `refactor:`, `docs:`)
- **Не коммитить** если тесты или typecheck падают

### Code Tool TTL
- error_count ≥ 3 → disable
- 7 дней без запуска → кандидат на удаление

---

## Entry Points

| Файл | Назначение |
|------|-----------|
| `app/app.vue` | Root компонент, монтирует layout + программы |
| `app/layouts/default.vue` | Единственный layout |
| `app/programs/index.ts` | Реестр всех программ (окон) |
| `server/api/filesystem/list.ts` | Entry API для файлового менеджера |
| `nuxt.config.ts` | Конфигурация фреймворка |
| `vitest.config.ts` | Конфиг юнит-тестов |
| `playwright.config.ts` | Конфиг E2E (SPA-режим, chromium) |

---

## Документация проекта

- `docs/RULES.md` — архитектурные правила, импорт-лимиты
- `docs/refactor/` — план рефакторинга по фазам
- `docs/backlog.md` — идеи вне текущего рефакторинга
- `app/services/README.md` — гайд по services-слою

---

*Последнее обновление: 2026-05-20*
