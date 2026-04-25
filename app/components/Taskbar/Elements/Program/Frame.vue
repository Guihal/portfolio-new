<script setup lang="ts">
    import type { WindowOb } from '~/components/Window/types';
    import { useRemoveWindow } from '~/components/Window/utils/removeWindow';
    import { useFrameObserver } from '~/composables/useFrameObserver';
    import { getCalculatedBounds } from '~/composables/useWindowBounds';
    import { useScale } from '../../useScale';

    const { windowOb } = defineProps<{
        windowOb: WindowOb;
    }>();
    const { contentArea } = useContentArea();
    const { scaledHeight, scaledWidth, scale } = useScale();
    const { getSrc } = useFrameObserver();

    const PLACEHOLDER_IMG =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    const srcRaw = getSrc(windowOb.id);
    const lastNonEmpty = ref<string>(srcRaw.value);
    watch(srcRaw, (v) => {
        if (v) lastNonEmpty.value = v;
    });
    const src = computed(() => lastNonEmpty.value || PLACEHOLDER_IMG);
    const calculated = getCalculatedBounds(windowOb.id);

    const frameWidth = computed(() => {
        return calculated.width * scale.value;
    });

    const frameHeight = computed(() => {
        return calculated.height * scale.value;
    });

    const frameLeft = computed(() => {
        const value =
            Math.max(
                Math.min(
                    contentArea.value.width - calculated.width,
                    calculated.left,
                ),
                0,
            ) * scale.value;
        return value;
    });

    const frameTop = computed(() => {
        const value =
            Math.max(
                Math.min(
                    contentArea.value.height - calculated.height,
                    calculated.top,
                ),
                0,
            ) * scale.value;
        return value;
    });

    const file = computed(() => windowOb.file);

    const { title } = useWindowTitle(file);

    const { focus } = useFocusWindowController();
    const onclickframe = () => focus(windowOb.id);
    const close = () => {
        useRemoveWindow(windowOb);
    };

    const onPreview = () => {
        windowOb.states.preview = true;
    };
    const offPreview = () => {
        delete windowOb.states.preview;
    };
</script>

<template>
    <div
        class="taskbar__frame-wrapper"
        @mouseenter="onPreview"
        @mouseleave="offPreview">
        <div class="taskbar__frame__header">
            <div class="taskbar__frame_name" v-if="title">{{ title }}</div>
            <div class="taskbar__frame-close" @click="close">
                <div class="taskbar__frame-close_el"></div>
                <div class="taskbar__frame-close_el"></div>
            </div>
        </div>
        <div
            class="taskbar__frame"
            :class="{
                'taskbar__frame--active': windowOb.states.focused === true,
            }"
            :style="{
                'min-width': scaledWidth + 'px',
                'min-height': scaledHeight + 'px',
            }"
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

        &--active {
            border-color: rgba(c('default-contrast'), 0.8);
        }

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

        @media (hover: hover) {
            &:hover {
                border-color: c('default-contrast');
            }
        }

        &-img {
        }

        &-close {
            height: 10px;
            width: 10px;
            cursor: pointer;
            user-select: none;
            position: relative;

            &_el {
                width: 10px;
                height: 2px;
                background-color: c('default-contrast');
                position: absolute;
                left: 50%;
                top: 50%;
                translate: -50% -50%;

                &:first-child {
                    rotate: -45deg;
                }

                &:last-child {
                    rotate: 45deg;
                }
            }
        }

        &-wrapper {
            display: flex;
            flex-direction: column;
            align-items: end;
            gap: 10px;
        }
    }
</style>
