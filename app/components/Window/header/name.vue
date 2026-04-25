<script setup lang="ts">
    import { PROGRAMS } from '~/utils/constants/PROGRAMS';
    import type { WindowOb } from '../Window';

    const windowOb = inject('windowOb') as WindowOb;

    const icon = computed(() => {
        if (windowOb.file === null) return '';

        const iconString = PROGRAMS[windowOb.file.programType].icon;

        if (!iconString) return '';

        return iconString;
    });

    const { title } = useWindowTitle(computed(() => windowOb.file));
</script>

<template>
    <div v-if="windowOb.file" class="window__name">
        <div class="window__name-icon" v-html="icon"></div>
        <div class="window__name-text">
            {{ title }}
        </div>
    </div>
</template>

<style lang="scss">
    .drag {
        .window__name-icon {
            --icon-color: #{c('accent')};
        }

        .window__name-text {
            color: #{c('accent')};
        }
    }

    .window__name {
        display: flex;
        gap: 10px;
        align-items: center;
        max-width: 100%;
        width: 100%;

        &-icon {
            aspect-ratio: 1 / 1;
            width: 20px;
            --icon-color: #{c('default-contrast')};
            flex-shrink: 0;

            svg {
                width: 100%;
                height: 100%;

                path {
                    transition: fill 0.3s ease-in-out;
                }
            }
        }

        &-text {
            font-family: $t-default;
            font-size: 15px;
            line-height: 1;
            letter-spacing: 0.02em;
            color: c('default-contrast');
            height: fit-content;
            max-width: calc(100% - 30px);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: color 0.3s ease-in-out;
        }
    }
</style>
