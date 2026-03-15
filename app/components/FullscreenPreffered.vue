<script setup lang="ts">
    const { contentArea } = useContentArea();

    const width = computed(() => contentArea.value.width);
    const height = computed(() => contentArea.value.height);
</script>
<template>
    <div class="fullscreen_preffered"></div>
</template>
<style lang="scss">
    .fullscreen_preffered {
        position: fixed;
        left: 0;
        top: 0;
        width: calc(v-bind(width) * 1px);
        height: calc(v-bind(height) * 1px);
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
