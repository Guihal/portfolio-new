<script setup lang="ts">
    import { storeToRefs } from 'pinia';
    import { useContentAreaStore } from '~/stores/contentArea';

    const { area: contentArea } = storeToRefs(useContentAreaStore());

    const sizeStyle = computed(() => ({
        width: `${contentArea.value.width}px`,
        height: `${contentArea.value.height}px`,
    }));
</script>
<template>
    <div class="preview_preffered" :style="sizeStyle"></div>
</template>
<style lang="scss">
    .preview_preffered {
        position: fixed;
        left: 0;
        top: 0;
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
