<script setup lang="ts">
    import { PROGRAMS } from '~/utils/constants/PROGRAMS';
    import type { WindowOb } from './Window';

    const windowOb = inject('windowOb') as WindowOb;

    const component: Ref<Component | null> = shallowRef(null);

    const callback = () => {
        if (windowOb.file === null) return null;

        const program = PROGRAMS[windowOb.file.programType];

        if (!program) return null;

        const componentReal = program.component;

        if (componentReal === undefined) return null;

        return componentReal;
    };

    watch(
        () => windowOb.file,
        () => {
            component.value = callback();
        },
        {
            immediate: true,
        },
    );
</script>

<template>
    <div class="window__content">
        <div class="window__content__wrapper">
            <template v-if="component">
                <component :is="component" :windowOb />
            </template>
        </div>
    </div>
</template>

<style lang="scss">
    .window__content {
        width: 100%;
        height: 100%;
        box-sizing: border-box;

        &__wrapper {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            overflow: auto;
            scrollbar-width: thin;
        }
    }
</style>
