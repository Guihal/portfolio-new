<script setup lang="ts">
    import { useWindow } from './composables/useWindow';
    import type { WindowOb } from './types';

    const { windowOb } = defineProps<{ windowOb: WindowOb }>();
    const { node: windowNode, focusWindow } = await useWindow(windowOb);
</script>
<template>
    <div
        :id="`window-${windowOb.id}`"
        ref="windowNode"
        class="window"
        :class="windowOb.states"
        @click="focusWindow">
        <div class="pixel-box window__wrapper">
            <WindowLoader />
            <WindowHeader />
            <WindowContent />
        </div>
        <WindowResizeAll />
    </div>
</template>
<style lang="scss">
    .window {
        position: fixed;
        width: 100vw;
        height: 100vh;
        left: 0;
        top: 0;
        translate: 0 0;
        container-type: size;
        container-name: window;
        contain: strict;
        will-change: translate;
        transform-origin: bottom;
        z-index: 4;

        transition-property: opacity;
        transition-duration: 0.3s;
        transition-timing-function: ease-in-out;

        &__wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: c('default');
            contain: strict;
        }

        &.loading {
            &::after {
                opacity: 1;
            }
        }

        &.focused {
            z-index: 10;
        }

        &-enter-active,
        &-leave-active {
            transition-property: opacity, scale;
            transition-duration: 0.3s;
            transition-timing-function: ease-in-out;
        }

        &-enter-from,
        &-leave-to {
            opacity: 0 !important;
            scale: 0.9;
        }
    }

    :root:has(.window.preview) {
        .window:not(.preview) {
            opacity: 0;
        }
    }
</style>
