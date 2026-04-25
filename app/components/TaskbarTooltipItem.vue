<script setup lang="ts">
    import { storeToRefs } from 'pinia';
    import type { WindowOb } from '~/components/Window/types';
    import { useContentAreaStore } from '~/stores/contentArea';
    import type { ProgramType } from '~~/shared/types/filesystem';

    const props = defineProps<{
        programType: ProgramType;
        windowObs: WindowOb[];
        containerBounds: DOMRect | null;
    }>();

    const tooltip = ref<HTMLElement | null>(null);
    const content = ref<HTMLElement | null>(null);

    const tooltipBounds = ref<DOMRect | null>(null);
    const contentBounds = ref<DOMRect | null>(null);

    const setTooltipBounds = () => {
        if (!tooltip.value) return;
        tooltipBounds.value = tooltip.value.getBoundingClientRect();
    };
    const setContentBounds = () => {
        if (!content.value) return;
        contentBounds.value = content.value.getBoundingClientRect();
    };

    useResizeObserver(tooltip, setTooltipBounds);
    useResizeObserver(content, setContentBounds);

    const { area: contentArea } = storeToRefs(useContentAreaStore());
    const { cancelHide, hide } = useTaskbarTooltips();

    const maxWidth = computed(() => contentArea.value.width);

    const top = computed(() => {
        if (!props.containerBounds || !tooltipBounds.value) return 0;

        return props.containerBounds.top - tooltipBounds.value.height;
    });

    const left = computed(() => {
        if (!props.containerBounds || !tooltipBounds.value) return 0;

        const value =
            props.containerBounds.left +
            props.containerBounds.width / 2 -
            tooltipBounds.value.width / 2;

        const valueClamped = Math.max(
            Math.min(
                value,
                contentArea.value.width - tooltipBounds.value.width,
            ),
            0,
        );

        return valueClamped;
    });

    const onMouseover = () => cancelHide(props.programType);
    const onMouseout = () => hide(props.programType);
</script>

<template>
    <div
        ref="tooltip"
        :style="{
            '--top': top,
            '--left': left,
            '--mxw': maxWidth,
            '--c-w': contentBounds?.width ?? 0,
        }"
        class="taskbar__tooltip pixel-box"
        @mouseenter="onMouseover"
        @mouseleave="onMouseout">
        <div ref="content" class="taskbar__tooltip__content">
            <TaskbarElementsProgramAllFrames :window-obs="windowObs" />
        </div>
    </div>
</template>

<style lang="scss">
    .taskbar__tooltip {
        --left: 0;
        --top: 0;
        --mxw: 0;
        position: fixed;
        max-width: calc(var(--mxw) * 1px);
        width: calc(var(--c-w) * 1px + 20px);
        height: fit-content;
        top: 0;
        left: 0;
        translate: calc(var(--left) * 1px) calc(var(--top) * 1px);
        background: rgba(c('default'), 0.8);
        padding: 10px;
        box-sizing: border-box;
        z-index: 120;
        transition-property: width;
        transition-duration: 0.3s;
        transition-timing-function: ease-in-out;
        overflow-x: clip;

        &__content {
            width: fit-content;
            display: flex;
            gap: 10px;
        }
    }
</style>
