<script setup lang="ts">
    
    import { getTargetBounds } from '~/composables/useWindowBounds';
import { OFFSET } from '~/utils/constants/offset';
    import type { WindowOb } from '../../types';
    import { setSize } from '../../utils/setSize';

    const windowOb = inject('windowOb') as WindowOb;

    const onclick = () => {
        const target = getTargetBounds(windowOb.id);
        if (windowOb.states.fullscreen) {
            delete windowOb.states.fullscreen;
            const UNFULLSCREENOFFSET = OFFSET * 2;

            target.left = UNFULLSCREENOFFSET;
            target.top = UNFULLSCREENOFFSET;

            setSize(windowOb, 'width', target.width - UNFULLSCREENOFFSET * 2);
            setSize(windowOb, 'height', target.height - UNFULLSCREENOFFSET * 2);
        } else {
            windowOb.states.fullscreen = true;
        }
    };
</script>
<template>
    <div class="window__nav_el window__fullscreen" @click="onclick">
        <div class="window__fullscreen_el"></div>
        <div class="window__fullscreen_el"></div>
    </div>
</template>
<style lang="scss">
    .window__fullscreen {
        position: relative;

        &_el {
            --bg-default: #{c('default')};
            width: calc(100% - var(--offset) * 1.9);
            height: calc(100% - var(--offset) * 1.9);
            position: absolute;
            left: 50%;
            top: 50%;
            translate: -50% -50%;
            border: var(--line-width) solid var(--c-real);
            background: var(--bg-real);
            transition:
                0.3s ease-in-out border,
                0.3s ease-in-out translate,
                0.3s ease-in-out background;
        }
    }

    .fullscreen {
        .window__fullscreen_el {
            translate: -30% -60%;

            &:last-child {
                translate: -75% -25%;
            }
        }
    }
</style>
