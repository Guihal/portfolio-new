# QWEN.md — Инструкции для проекта

## О проекте

Портфолио на Nuxt 4 с TypeScript и SCSS. Интерфейс в стиле десктопной среды с окнами, панелью задач и рабочим столом.

## Стек

- **Framework:** Nuxt 4
- **Язык:** TypeScript
- **Стили:** SCSS (глобальные функции/миксины через `globals.scss`)
- **Менеджер пакетов:** Bun
- **State:** Pinia
- **Изображения:** @nuxt/image
- **Линтер:** @nuxt/eslint
- **Форматтер:** Biome

## Структура

```
app/
├── app.vue
├── assets/
│   ├── fonts/
│   └── scss/
│       ├── globals.scss      # Точка входа (@forward vars, functions, mixins)
│       ├── vars.scss         # Переменные ($colors)
│       ├── functions.scss    # Функции (c() для цветов)
│       ├── mixins.scss       # Миксины (t() для типографики)
│       ├── main.scss         # Основные стили (reset, fonts, settings)
│       ├── reset.scss        # Сброс стилей
│       ├── fonts.scss        # Подключение шрифтов
│       └── _settings.scss    # Глобальные настройки (root, body)
├── components/
│   ├── Programs/             # Компоненты программ
│   ├── Taskbar/              # Панель задач
│   ├── Window/               # Оконный менеджер
│   │   └── composables/      # useCreateAndRegisterWindow, etc.
│   ├── Workbench/            # Рабочий стол
│   ├── Background.vue
│   └── FullscreenPreffered.vue
├── composables/              # useAllWindows, useContentArea, useFocusController...
├── layouts/
├── pages/
│   └── [...path].vue         # Catch-all роутинг
├── plugins/
├── stores/                   # Pinia stores
└── utils/

server/
├── api/
│   └── filesystem/           # API для работы с файловой системой
├── assets/
│   └── entry/                # Контент портфолио (about-me, projects, ...)
│       ├── entity.json       # Метаданные корневой директории
│       └── manifest.json     # Автогенерируемый индекс контента
└── utils/

scripts/
└── generate-manifest.ts      # Генерация manifest.json из entry/
```

## SCSS: глобальные функции

Для использования функций из `globals.scss` в компонентах:

1. В `nuxt.config.ts` настроен `additionalData`:

```ts
additionalData: '@use "@/assets/scss/globals.scss" as *;';
```

2. **Важно:** Если функция использует переменные из другого файла, явно импортируйте их:

```scss
// functions.scss
@use './vars' as *; // Обязательно для доступа к $colors
@use 'sass:map' as map;
```

3. **Доступные функции и миксины:**

```scss
// Функция получения цвета
c('color-name')  // Возвращает цвет из $colors

// Миксин для типографики
@include t($fs: 15px, $lh: 1, $cName: 'default', $fw: 400, $family: 'Ithaca')
```

4. **Цветовая палитра:**

```scss
$colors: (
    'accent': #db481d,
    'main': #40b567,
    'default': #151515,
    'default-1': #181818,
    'default-contrast': #cecece,
);
```

## Контент портфолио

Контент хранится в `server/assets/entry/`. Каждая директория может содержать `entity.json` с метаданными:

```json
{
    "name": "Название",
    "programType": "Тип программы"
}
```

Манифест генерируется автоматически при запуске dev-сервера или билда через `scripts/generate-manifest.ts`.

## Команды

```bash
bun run dev       # Dev-сервер (с генерацией манифеста)
bun run build     # Продакшен сборка (с генерацией манифеста)
bun run generate  # SSR генерация
bun run preview   # Предпросмотр продакшен билда
```

## Соглашения

- **Компоненты:** `<script setup lang="ts">`
- **Стили:** SCSS с глобальными функциями (`c('color-name')`, `@include t(...)`)
- **Refs:** явная типизация `ref<HTMLCanvasElement | null>(null)`
- **Роутинг:** динамический через `([...path].vue)` с созданием окон
- **Окна:** использование `useCreateAndRegisterWindow()` для регистрации окон
- **Фокус:** `useFocusWindowController()` для управления фокусом окон

## Архитектура окон

- `WindowView` — основной вид окон
- `Workbench` — рабочая область (рабочий стол)
- `Taskbar` — панель задач
- `useContentArea()` — управление контентной областью и viewport observer
