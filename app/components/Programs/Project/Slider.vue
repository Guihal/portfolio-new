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
        <!-- Stage центрирует кадр. Без него img — flex-item слайдера, и
             flex-grow растягивал бокс сверх аспекта → letterbox под маской. -->
        <div class="project__stage">
            <!-- Обычный img: ipx не проксирует /api/filesystem/asset (403),
                 а картинки в entry уже сжаты в avif. -->
            <img
                v-if="images[current]"
                :src="images[current]"
                alt=""
                class="project__slide pixel-box"
                draggable="false" />
            <div v-else class="project__empty">
                <div class="project__empty-text">Картинок пока нет</div>
            </div>
        </div>
        <div v-if="!dragging && total > 0" class="project__nav pixel-box">
            <button
                :disabled="prevDisabled"
                class="project__nav-btn pixel-box"
                @click="emit('prev')">
                &#8592;
            </button>
            <span class="project__nav-counter">{{ current + 1 }} / {{ total }}</span>
            <button
                :disabled="nextDisabled"
                class="project__nav-btn pixel-box"
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
        gap: 10px;
        padding: 10px;
        background: c('default-3');
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

    .project__stage {
        flex: 1;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        // useSliderDrag ставит capture только при e.target === root слайдера,
        // иначе drag ломается — stage не должен перехватывать pointer.
        pointer-events: none;
    }

    .project__slide {
        // Нативный sizing replaced-элемента: бокс img == кадр по обеим осям,
        // letterbox нулевой → pixel-box режет углы самой картинки.
        display: block;
        width: auto;
        height: auto;
        max-width: 100%;
        max-height: 100%;
    }

    .project__empty {
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
        gap: 10px;
        padding: 6px 10px;
        width: fit-content;
        margin: 0 auto;
        background: c('default-2');
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
