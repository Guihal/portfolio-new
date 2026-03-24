<script setup lang="ts">
    import { useCollapsed } from '../../composables/useCollapsed';
    import type { WindowOb } from '../../Window';
    const windowOb = inject('windowOb') as WindowOb;
    const onclick = useCollapsed(windowOb);
</script>
<template>
    <div class="window__nav_el window__collapse" @click="onclick">
        <div class="window__collapse_el"></div>
    </div>
</template>
<style lang="scss">
    .window__collapse {
        display: flex;
        justify-content: center;
        align-items: center;

        &_el {
            width: calc(100% - var(--offset) * 1.7);
            height: var(--line-width);
            background: var(--c-real);
            transition: background 0.3s ease-in-out;
        }
    }
</style>
