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
    <div class="fullscreen_preffered" :style="sizeStyle"></div>
</template>
<style lang="scss">
    .fullscreen_preffered {
        position: fixed;
        left: 0;
        top: 0;
        border: 5px solid c('default-contrast');
        box-sizing: border-box;
        transition:
            0.3s ease-in-out opacity,
            0.3s ease-in-out display allow-discrete;
        display: none;
        opacity: 0;
    }

    body:has(.fullscreen-ready) .fullscreen_preffered {
        opacity: 1;
        display: block;

        @starting-style {
            opacity: 0;
        }
    }
</style>
