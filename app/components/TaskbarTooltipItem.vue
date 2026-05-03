<script setup lang="ts">
    import { useTooltipPosition } from '~/components/Taskbar/Elements/Program/useTooltipPosition';
    import type { WindowOb } from '~/components/Window/types';
    import type { ProgramType } from '~~/shared/types/filesystem';

    const props = defineProps<{
        programType: ProgramType;
        windowObs: WindowOb[];
        containerBounds: DOMRect | null;
    }>();

    const tooltip = ref<HTMLElement | null>(null);
    const content = ref<HTMLElement | null>(null);

    const { top, left, contentBounds, maxWidth } = useTooltipPosition(
        tooltip,
        content,
        () => props.containerBounds,
    );

    const { cancelHide, hide } = useTooltipState();

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
