<script setup lang="ts">
    import { computed } from 'vue';
    import type { WindowOb } from '~/components/Window/types';
    import { useRemoveWindow } from '~/components/Window/utils/removeWindow';
    import { useFocusStore } from '~/stores/focus';
    import { useScale } from '../../useScale';
    import FrameCloseButton from './FrameCloseButton.vue';
    import { useTaskbarFramePosition } from './useTaskbarFramePosition';
    import { useWindowPreview } from './useWindowPreview';

    const { windowOb } = defineProps<{ windowOb: WindowOb }>();
    const { scaledHeight, scaledWidth } = useScale();
    const { frameWidth, frameHeight, frameLeft, frameTop } =
        useTaskbarFramePosition(windowOb);
    const { src, onPreview, offPreview } = useWindowPreview(windowOb);
    const { title } = useWindowTitle(computed(() => windowOb.file));

    const focusStore = useFocusStore();
    const onclickframe = () => focusStore.focus(windowOb.id);
    const close = () => useRemoveWindow(windowOb);
</script>

<template>
    <div class="taskbar__frame-wrapper" @mouseenter="onPreview" @mouseleave="offPreview">
        <div class="taskbar__frame__header">
            <div class="taskbar__frame_name" v-if="title">{{ title }}</div>
            <FrameCloseButton @close="close" />
        </div>
        <div
            class="taskbar__frame"
            :class="{ 'taskbar__frame--active': windowOb.states.focused === true }"
            :style="{ 'min-width': scaledWidth + 'px', 'min-height': scaledHeight + 'px' }"
            @click="onclickframe">
            <img
                :src
                :style="{
                    width: frameWidth + 'px',
                    height: frameHeight + 'px',
                    'margin-top': frameTop + 'px',
                    'margin-left': frameLeft + 'px',
                }"
                :width="frameWidth"
                :height="frameHeight"
                class="taskbar__frame-img" />
        </div>
    </div>
</template>

<style lang="scss">
    .taskbar__frame {
        position: relative;
        border: 1px solid rgba(c('default-contrast'), 0.2);
        transition: border-color 0.3s ease-in-out;
        cursor: pointer;
        user-select: none;

        &--active { border-color: rgba(c('default-contrast'), 0.8); }
        &_name {
            font-size: 10px;
            max-width: 100%;
            overflow: hidden;
            text-wrap: nowrap;
            text-overflow: ellipsis;
            color: c('default-contrast');
            width: fit-content;
        }
        &__header {
            gap: 10px;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        &-wrapper { display: flex; flex-direction: column; align-items: end; gap: 10px; }

        @media (hover: hover) { &:hover { border-color: c('default-contrast'); } }
    }
</style>
