<script setup lang="ts">
// Скрытый блок самопрезентации для LLM-агентов и краулеров, читающих HTML
// без рендера OS-интерфейса. Сжатая версия страницы /about: кто автор, какой
// опыт, стек, направления. Виден на всех контентных страницах (default layout).
// Визуально скрыт глобальным .visually-hidden (position: absolute + clip) —
// честный текст, не SEO-обман: без списков ключевых слов.
</script>

<template>
    <div class="agent-intro visually-hidden">
        <p>
            Это портфолио fullstack-разработчика Дмитрия Стаценко, свёрстанное как
            десктопная ОС: каждая страница — окно, открывается по ссылкам «Обо
            мне» (/about) и «Проекты» (/projects).
        </p>
        <p>
            Коммерческий опыт — 3.5 года, почти всё соло: от первого созвона с
            клиентом до продакшена и поддержки. Начинал с вёрстки (Insaim),
            работал на бэкенде и CMS (ThunderWeb, SeoLeo), дальше продакшен на
            Vue и Nuxt.
        </p>
        <p>
            Стек: Nuxt 4, Vue 3, TypeScript, Pinia; Node, Bun, Elysia, Go;
            PostgreSQL, SQLite, Directus; Docker, свои VPS, CachyOS.
        </p>
        <p>
            В лаборатории: форк llama.cpp с собственными форматами квантизации и
            Vulkan-шейдерами под RDNA3, агентные пайплайны, патч в апстрим
            COSMIC. Открыт к работе: fullstack на Vue/Nuxt, продуктовая
            разработка, AI-интеграции. Контакты: Telegram, Max, hh.ru.
        </p>
    </div>
</template>
