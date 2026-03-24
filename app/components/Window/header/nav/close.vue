<script setup lang="ts">
    import { useRemoveWindow } from '../../utils/removeWindow';
    import type { WindowOb } from '../../Window';

    const windowOb = inject('windowOb') as WindowOb;

    const onclick = () => {
        useRemoveWindow(windowOb);
    };
</script>
<template>
    <div class="window__nav_el window__close" @click="onclick">
        <div class="window__close_el"></div>
        <div class="window__close_el"></div>
    </div>
</template>
<style lang="scss">
    .window__close {
        position: relative;

        &_el {
            position: absolute;
            left: 50%;
            top: 50%;
            translate: -50% -50%;
            width: calc(100% - var(--offset));
            height: var(--line-width);
            background: var(--c-real);
            transition: background 0.3s ease-in-out;

            &:first-child {
                rotate: 45deg;
            }

            &:last-child {
                rotate: -45deg;
            }
        }
    }
</style>
