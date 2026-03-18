<script setup lang="ts">
    import type { WindowOb } from '../../Window';

    const { windowOb } = defineProps<{
        windowOb: WindowOb;
    }>();
</script>
<template>
    <div class="window__nav__wrapper">
        <WindowHeaderNavCollapse :windowOb />
        <WindowHeaderNavFullscreen :windowOb />
        <WindowHeaderNavClose :windowOb />
    </div>
</template>
<style lang="scss">
    .window__nav {
        z-index: 1000;
        position: relative;

        &_el {
            --line-width: 2px;
            --offset: 10px;

            --c-default: #{c('default-contrast')};
            --c-hover: #{c('accent')};

            --c-real: var(--c-default);

            --bg-default: #{c('default-1')};
            --bg-hover: #{c('default-contrast')};

            --bg-real: var(--bg-default);

            width: 30px;
            height: 30px;
            cursor: pointer;
            transition: background 0.3s ease-in-out;

            background: var(--bg-real);
            mask-image: url('/imgs/window-nav-el-bg.svg');

            @media (hover: hover) {
                &:hover {
                    --bg-real: var(--bg-hover);
                    --c-real: var(--c-hover);
                }
            }

            &:active {
                --bg-real: var(--bg-hover);
                --c-real: var(--c-hover);
            }
        }

        &__wrapper {
            display: flex;
            gap: 10px;
            padding: 10px;
        }
    }
</style>
