<script setup lang="ts">
    import type { WindowOb } from '~/components/Window/Window';

    const tooltip = ref<HTMLElement | null>(null);
    const content = ref<HTMLElement | null>(null);

    const { windowObs, isShow, containerBounds, mouseover, mouseout } =
        defineProps<{
            windowObs: WindowOb[];
            isShow: boolean;
            containerBounds: DOMRect | null;
            mouseover: () => void;
            mouseout: () => void;
        }>();

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

    const { contentArea } = useContentArea();

    const maxWidth = computed(() => contentArea.value.width);

    const top = computed(() => {
        if (!containerBounds || !tooltipBounds.value) return 0;

        const value = containerBounds.top - tooltipBounds.value.height;

        return value;
    });

    const left = computed(() => {
        if (!containerBounds || !tooltipBounds.value) return 0;

        const value =
            containerBounds.left +
            containerBounds.width / 2 -
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
</script>

<template>
    <Teleport to="body">
        <Transition name="taskbar__tooltip">
            <div
                v-if="isShow"
                ref="tooltip"
                :style="{
                    '--top': top,
                    '--left': left,
                    '--mxw': maxWidth,
                    '--c-w': contentBounds?.width ?? 0,
                }"
                @mouseover="mouseover"
                @mouseout="mouseout"
                class="taskbar__tooltip pixel-box">
                <div ref="content" class="taskbar__tooltip__content">
                    <TaskbarElementsProgramAllFrames :windowObs />
                </div>
            </div>
        </Transition>
    </Teleport>
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
        transition-property: opacity, scale, width;
        transition-duration: 0.3s;
        transition-timing-function: ease-in-out;
        overflow-x: clip;

        &-enter-active {
            transition-property: opacity, scale;
        }

        &__content {
            width: fit-content;
            display: flex;
            gap: 10px;
        }

        &-enter-from,
        &-leave-to {
            opacity: 0 !important;
        }
    }
</style>
