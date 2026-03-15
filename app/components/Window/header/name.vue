<script setup lang="ts">
    import { PROGRAMS } from '~/utils/constants/PROGRAMS';
    import type { WindowOb } from '../Window';

    const { windowOb } = defineProps<{
        windowOb: WindowOb;
    }>();

    const icon = computed(() => {
        if (windowOb.file === null) return '';

        const iconString = PROGRAMS[windowOb.file.programType].icon;

        if (!iconString) return '';

        return iconString;
    });

    const label = computed(() => {
        if (!windowOb.file) return '';
        const labelString = PROGRAMS[windowOb.file.programType].label;
        if (!labelString) return;

        return labelString;
    });

    const name = computed(() => {
        if (!windowOb.file) return '';
        const nameString = windowOb.file.name;
        if (!nameString) return;

        return nameString;
    });

    const totalText = computed(() => {
        const total = [label.value, name.value].filter(Boolean);

        return total.join(' - ');
    });
</script>

<template>
    <div class="window__name" v-if="windowOb.file">
        <div class="window__name-icon" v-html="icon"></div>
        <div class="window__name-text">
            {{ totalText }}
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
            font-family: Pix, system-ui;
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
