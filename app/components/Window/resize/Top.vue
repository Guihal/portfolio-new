<script setup lang="ts">
    import { useInjectWindow } from '~/components/Window/composables/lifecycle/useInjectWindow';
    import type { ChainedKey } from '../composables/resize/useResizeForDirections';
    import type { WindowOb } from '../types';

    const directions: [ChainedKey] = ['top'];

    const windowOb = useInjectWindow();
</script>
<template>
    <WindowResize :directions="directions" :windowOb />
</template>
<style lang="scss" scoped>
    .window__resize__controlls {
        --top: 0;
        --left: 0;
        --width: var(--default-size);
        --height: var(--default-size-px);
        z-index: var(--z-index-sides);
        cursor: n-resize;
    }
</style>
