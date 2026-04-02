<script setup lang="ts">
    const { contentArea } = useContentArea();

    const width = computed(() => contentArea.value.width);
    const height = computed(() => contentArea.value.height);
</script>
<template>
    <div class="preview_preffered"></div>
</template>
<style lang="scss">
    .preview_preffered {
        position: fixed;
        left: 0;
        top: 0;
        width: calc(v-bind(width) * 1px);
        height: calc(v-bind(height) * 1px);
        background: c('default-contrast');
        opacity: 0;
        pointer-events: none;
        z-index: 12;
        transition:
            0.15s ease-in-out opacity,
            0.15s ease-in-out display allow-discrete;
        display: none;
    }

    body:has(.window.preview) .preview_preffered {
        opacity: 0.4;
        display: block;

        @starting-style {
            opacity: 0;
        }
    }
</style>
