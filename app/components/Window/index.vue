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

    // Плавная анимация границ (RAF-цикл для left/top/width/height)
    useWindowLoop(windowOb);

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

    await useWindowEntityFetcher(windowOb, windowRoute);

    // При монтировании — сразу фокусируем окно
    onMounted(() => {
        focusWindow();
    });

    watchEffect(() => console.log(Object.keys(windowOb.states).join(' ')));

    onUnmounted(() => {
        unFocus();
    });
</script>
<template>
    <div
        :id="`window-${windowOb.id}`"
        class="window"
        :class="windowOb.states"
        :style="{
            '--w-width': windowOb.bounds.calculated.width + 'px',
            '--w-height': windowOb.bounds.calculated.height + 'px',
            '--w-left': windowOb.bounds.calculated.left + 'px',
            '--w-top': windowOb.bounds.calculated.top + 'px',
        }"
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
        --w-top: 0;
        --w-left: 0;
        --w-width: 0;
        --w-height: 0;
        width: var(--w-width);
        height: var(--w-height);
        --left-tr: var(--w-left);
        --top-tr: var(--w-top);
        // left: var(--left-tr);
        // top: var(--top-tr);
        container-type: inline-size;
        container-name: window;

        left: 0;
        top: 0;
        transform: translate3d(var(--left-tr), var(--top-tr), 0);

        will-change: translate, width, height;

        transform-origin: bottom;

        z-index: 4;

        &__wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: c('default');
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
</style>
