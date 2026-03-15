# QWEN.md — Инструкции для проекта

## О проекте
Портфолио на Nuxt 3 с TypeScript и SCSS.

## Стек
- **Framework:** Nuxt 3
- **Язык:** TypeScript
- **Стили:** SCSS (глобальные функции/миксины через `globals.scss`)
- **Менеджер пакетов:** Bun
- **State:** Pinia
- **Изображения:** @nuxt/image

## Структура
```
app/
├── app.vue
├── assets/
│   └── scss/
│       ├── globals.scss  # Точка входа для глобальных стилей
│       ├── vars.scss     # Переменные ($colors и др.)
│       ├── functions.scss # Функции (c(), etc.)
│       └── mixins.scss   # Миксины
├── components/
├── composables/
├── layouts/
└── utils/
```

## SCSS: глобальные функции
Для использования функций из `globals.scss` в компонентах:

1. В `nuxt.config.ts` настроен `additionalData`:
```ts
additionalData: '@use "@/app/assets/scss/globals.scss" as *;'
```

2. **Важно:** Если функция использует переменные из другого файла, явно импортируйте их:
```scss
// functions.scss
@use './vars' as *;  // Обязательно для доступа к $colors
@use 'sass:map' as map;
```

## Команды
```bash
bun run dev      # Dev-сервер
bun run build    # Продакшен сборка
bun run lint     # ESLint
```

## Соглашения
- Компоненты: `<script setup lang="ts">`
- Стили: SCSS с глобальными функциями (`c('color-name')`)
- Refs: явная типизация `ref<HTMLCanvasElement | null>(null)`
