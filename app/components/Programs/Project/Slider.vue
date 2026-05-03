<script setup lang="ts">
    import { useSliderDrag } from './composables/useSliderDrag';

    defineProps<{
        images: string[];
        current: number;
        total: number;
        prevDisabled: boolean;
        nextDisabled: boolean;
    }>();

    const emit = defineEmits<{
        next: [];
        prev: [];
        goto: [n: number];
    }>();

    const root = ref<HTMLElement>();
    const { dragging } = useSliderDrag(
        root,
        () => emit('next'),
        () => emit('prev'),
    );
</script>

<template>
    <div
        ref="root"
        class="project__slider pixel-box"
        :class="{ dragging }">
        <NuxtImg
            v-if="images[current]"
            :src="images[current]"
            class="project__slide"
            draggable="false" />
        <div v-else class="project__empty">
            <div class="project__empty-text">Картинок пока нет</div>
        </div>
        <div v-if="!dragging && total > 0" class="project__nav">
            <button
                :disabled="prevDisabled"
                class="project__nav-btn"
                @click="emit('prev')">
                &#8592;
            </button>
            <span class="project__nav-counter">{{ current + 1 }} / {{ total }}</span>
            <button
                :disabled="nextDisabled"
                class="project__nav-btn"
                @click="emit('next')">
                &#8594;
            </button>
        </div>
    </div>
</template>

<style lang="scss">
    .project__slider {
        box-sizing: border-box;
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
        user-select: none;
        touch-action: pan-y;

        &.dragging {
            cursor: grabbing;

            .project__nav {
                display: none;
            }
        }
    }

    .project__slide {
        width: 100%;
        height: 100%;
        object-fit: contain;
        flex: 1;
        min-height: 0;
        pointer-events: none;
    }

    .project__empty {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .project__empty-text {
        @include t($fs: 16px, $lh: 1.2, $cName: 'default-contrast');
        opacity: 0.5;
    }

    .project__nav {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 8px;
        flex-shrink: 0;
    }

    .project__nav-btn {
        @include t($fs: 16px, $lh: 1, $cName: 'default-contrast');
        background: c('default-3');
        border: none;
        padding: 6px 12px;
        cursor: pointer;

        &:hover:not(:disabled) {
            background: c('default-2');
        }

        &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }
    }

    .project__nav-counter {
        @include t($fs: 14px, $lh: 1, $cName: 'default-contrast');
    }
</style>
