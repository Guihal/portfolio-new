<script setup lang="ts">
    import type { WindowOb } from '../types';
    import { useMove } from './useMove';

    const windowOb = inject('windowOb') as WindowOb;
    const header = ref<null | HTMLElement>(null);
    // Обработчик pointerdown для перетаскивания окна
    const pointerdown = useMove(windowOb);
</script>
<template>
    <div class="window__header" ref="header">
        <div class="window__header_el">
            <!-- Область для перетаскивания (занимает всю ширину за исключением кнопок навигации) -->
            <div class="window__header__wrapper" @pointerdown="pointerdown">
                <WindowHeaderName />
            </div>
            <!-- Кнопки управления: свернуть, fullscreen, закрыть -->
            <WindowHeaderNav />
        </div>
        <WindowHeaderBreadcrumbs />
    </div>
</template>
<style lang="scss">
    .window__header {
        width: 100%;

        background: c('default-1');
        user-select: none;

        &_el {
            display: flex;
        }

        &__wrapper {
            flex: 1 1 auto;
            min-width: 0;
            display: flex;
            padding: 0 10px;
        }
    }

    .window:not(.fullscreen) .window__header__wrapper {
        cursor: grab;
    }

    .drag {
        cursor: grabbing !important;
    }
</style>
