<script setup lang="ts">
    import { useFocusOnClick } from './composables/useFocusOnClick';
    import { useSetFocusState } from './composables/useSetFocusState';
    import { useSetFullscreenObserver } from './composables/useSetFullscreenObserver';
    import { useWindowFullscreenAutoSet } from './composables/useWindowFullscreenAutoSet';
    import { useWindowLoading } from './composables/useWindowLoading';
    import { useWindowLoop } from './composables/useWindowLoop/useWindowLoop';
    import { useWindowRoutesController } from './composables/useWindowRoutesController';
    import type { WindowOb } from './Window';

    const { windowOb } = defineProps<{
        windowOb: WindowOb;
    }>();
    const { getIsLoading, initWindowLoading } = useWindowLoading();

    const isLoading = getIsLoading(windowOb.id);

    // === Инициализация систем окна ===

    // Плавная анимация границ (RAF-цикл для left/top/width/height)
    useWindowLoop(windowOb);

    // Автоматический fullscreen при монтировании + реакция на changes contentArea
    useSetFullscreenObserver(windowOb);

    // Авто-переход в fullscreen при перетаскивании за границы
    useWindowFullscreenAutoSet(windowOb);

    // Установка состояния focused при изменении focusedWindowId
    useSetFocusState(windowOb);

    // === Вычисляемые значения для CSS (в пикселях) ===

    const width = computed(() => windowOb.bounds.calculated.width);
    const height = computed(() => windowOb.bounds.calculated.height);
    const left = computed(() => windowOb.bounds.calculated.left);
    const top = computed(() => windowOb.bounds.calculated.top);

    // === Обработчики событий ===

    const { focusWindow } = useFocusOnClick(windowOb);

    initWindowLoading(windowOb.id);

    watch(
        isLoading,
        () => {
            if (isLoading.value) {
                windowOb.states.loading = true;
            } else {
                delete windowOb.states.loading;
            }
        },
        {
            immediate: true,
        },
    );

    // При монтировании — сразу фокусируем окно
    onMounted(() => {
        focusWindow();
    });

    // Роутинг
    await useWindowRoutesController(windowOb);
</script>
<template>
    <div
        class="window"
        :class="windowOb.states"
        :id="`window-${windowOb.id}`"
        @click="focusWindow">
        <div class="pixel-box window__wrapper">
            <WindowLoader :windowOb />
            <WindowHeader :windowOb />
            <WindowContent :windowOb />
        </div>
        <WindowResizeAll :windowOb />
    </div>
</template>
<style lang="scss">
    .window {
        position: fixed;
        width: calc(v-bind(width) * 1px);
        height: calc(v-bind(height) * 1px);
        --left-tr: calc(v-bind(left) * 1px);
        --top-tr: calc(v-bind(top) * 1px);
        left: var(--left-tr);
        top: var(--top-tr);

        // left: 0;
        // top: 0;
        // transform: translate3d(var(--left-tr), var(--top-tr), 0);

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
