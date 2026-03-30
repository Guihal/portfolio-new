<script setup lang="ts">
    import type { WindowOb } from '~/components/Window/Window';
    import * as htmlToImage from 'html-to-image';

    import { MAX_SIZE, useScale } from '../../useScale';

    const { windowOb } = defineProps<{
        windowOb: WindowOb;
    }>();
    const { contentArea } = useContentArea();
    const { scaledHeight, scaledWidth, scale } = useScale();

    const frameWidth = computed(() => {
        return windowOb.bounds.calculated.width * scale.value;
    });

    const frameHeight = computed(() => {
        return windowOb.bounds.calculated.height * scale.value;
    });

    const frameLeft = computed(() => {
        const value =
            Math.max(
                Math.min(
                    contentArea.value.width - windowOb.bounds.calculated.width,
                    windowOb.bounds.calculated.left,
                ),
                0,
            ) * scale.value;
        return value;
    });

    const frameTop = computed(() => {
        const value =
            Math.max(
                Math.min(
                    contentArea.value.height -
                        windowOb.bounds.calculated.height,
                    windowOb.bounds.calculated.top,
                ),
                0,
            ) * scale.value;
        return value;
    });

    const src = ref('');

    onMounted(async () => {
        const window = document.getElementById(`window-${windowOb.id}`);
        console.log(window);
        if (!window) return;
        const wrapper = window.querySelector<HTMLElement>('.window__wrapper');
        console.log(wrapper);
        if (!wrapper) return;

        src.value = await htmlToImage.toJpeg(wrapper, {
            width: windowOb.bounds.calculated.width,
            height: windowOb.bounds.calculated.height,
            cacheBust: true,

            quality: 1,
        });
    });
</script>

<template>
    <div class="taskbar__frame-wrapper">
        <div class="taskbar__frame-close">
            <div class="taskbar__frame-close_el"></div>
            <div class="taskbar__frame-close_el"></div>
        </div>
        <div
            class="taskbar__frame"
            :style="{
                'min-width': scaledWidth + 'px',
                'min-height': scaledHeight + 'px',
            }">
            <img
                :src
                :style="{
                    width: frameWidth + 'px',
                    height: frameHeight + 'px',
                    'margin-top': frameTop + 'px',
                    'margin-left': frameLeft + 'px',
                }"
                class="taskbar__frame-img" />
        </div>
    </div>
</template>

<style lang="scss">
    .taskbar__frame {
        position: relative;

        &-img {
        }

        &-wrapper {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
    }
</style>
