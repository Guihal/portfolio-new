<script setup lang="ts">
    import type { WindowOb } from '../Window';
    import { useMove } from './useMove';

    const windowOb = inject('windowOb') as WindowOb;
    // Обработчик pointerdown для перетаскивания окна
    const pointerdown = useMove(windowOb);
</script>
<template>
    <div class="window__header">
        <!-- Область для перетаскивания (занимает всю ширину за исключением кнопок навигации) -->
        <div class="window__header__wrapper" @pointerdown="pointerdown">
            <WindowHeaderName />
        </div>
        <!-- Кнопки управления: свернуть, fullscreen, закрыть -->
        <WindowHeaderNav />
    </div>
</template>
<style lang="scss">
    .window__header {
        width: 100%;
        display: flex;
        background: c('default-1');
        user-select: none;

        &__wrapper {
            width: calc(100% - 130px);
            display: flex;
            padding: 0 10px;
        }
    }

    .window:not(.fullscreen) {
        cursor: grab;
    }

    .drag .window__header__wrapper {
        cursor: grabbing;
    }
</style>
