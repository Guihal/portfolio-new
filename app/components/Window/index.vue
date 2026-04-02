<script setup lang="ts">
    import { useWindowEntityFetcher } from './composables/useFetchWindowEntity';
    import { useFocusOnClick } from './composables/useFocusOnClick';
    import { useSeoWindow } from './composables/useSeoWindow';
    import { useSetFocusState } from './composables/useSetFocusState';
    import { useSetFullscreenObserver } from './composables/useSetFullscreenObserver';
    import { useSetLoadingState } from './composables/useSetLoadingState';
    import { useWindowFullscreenAutoSet } from './composables/useWindowFullscreenAutoSet';
    import { useWindowLoading } from './composables/useWindowLoading';
    import { useWindowLoop } from './composables/useWindowLoop/useWindowLoop';
    import { useWindowRoute } from './composables/useWindowRoute';
    import type { WindowOb } from './Window';
    import { useFrameObserver } from '~/composables/useFrameObserver';

    const { windowOb } = defineProps<{
        windowOb: WindowOb;
    }>();

    // Установка состояния focused при изменении focusedWindowId
    useSetFocusState(windowOb);

    const windowRoute = useWindowRoute(windowOb);

    provide('windowRoute', windowRoute);
    provide('windowOb', windowOb);

    const { getIsLoading, initWindowLoading } = useWindowLoading();

    const isLoading = getIsLoading(windowOb.id);

    // === Инициализация систем окна ===

    // Автоматический fullscreen при монтировании + реакция на changes contentArea
    useSetFullscreenObserver(windowOb);

    // Авто-переход в fullscreen при перетаскивании за границы
    useWindowFullscreenAutoSet(windowOb);

    // === Обработчики событий ===

    const { focusWindow } = useFocusOnClick(windowOb);
    const { unFocus } = useFocusWindowController();

    initWindowLoading(windowOb.id);
    useSetLoadingState(windowOb, isLoading);

    useSeoWindow(windowOb);

    const windowNode = ref<HTMLElement | null>(null);

    // Плавная анимация границ (RAF-цикл) + прямая запись CSS-переменных в DOM
    useWindowLoop(windowOb, windowNode);

    // При монтировании — сразу фокусируем окно
    const { createObserver, destroyObserver } = useFrameObserver();

    onMounted(() => {
        focusWindow();
        createObserver(windowOb);
    });

    onUnmounted(() => {
        unFocus();
        destroyObserver(windowOb.id);
    });

    await useWindowEntityFetcher(windowOb, windowRoute);
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
