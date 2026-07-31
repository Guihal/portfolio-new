<script setup lang="ts">
    // biome-ignore lint/correctness/noUnusedImports: consumed by <template> via <script setup> auto-expose
    import { SOCIAL_LINKS } from '~/utils/constants/socials';
</script>

<template>
    <a
        v-for="social in SOCIAL_LINKS"
        :key="social.id"
        class="taskbar__el taskbar__social"
        :href="social.url"
        target="_blank"
        rel="noopener noreferrer"
        :title="social.label"
        :aria-label="social.label">
        <!-- v-html: статичные локальные SVG-файлы, не user input -->
        <span class="taskbar__el_img" v-html="social.icon"></span>
    </a>
</template>

<style lang="scss">
    .taskbar__social {
        // Иконки на currentColor: _settings.scss задаёт только --icon-color,
        // который читают program-иконки через fill="var(--icon-color)".
        color: c('main');
        display: flex;
        align-items: center;
    }
</style>
