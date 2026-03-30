<script setup lang="ts">
    import type { WindowOb } from '../Window';
    import { useMove } from './useMove';

    const windowOb = inject('windowOb') as WindowOb;
    const header = ref<null | HTMLElement>(null);
    // Обработчик pointerdown для перетаскивания окна
    const pointerdown = useMove(windowOb);

    const setHeight = () => {
        if (!header.value) return;
        const bounds = header.value.getBoundingClientRect();
        const height = bounds.height;
        const parent = header.value.parentNode as HTMLElement;
        if (!parent) return;

        parent.style.setProperty('--header-height', `${height}px`);
    };

    useResizeObserver(header, setHeight);
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
            width: calc(100% - 130px);
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
