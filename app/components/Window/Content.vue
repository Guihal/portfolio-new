<script setup lang="ts">
    import { getProgram } from '~/programs';
    import type { WindowOb } from './types';

    const windowOb = inject('windowOb') as WindowOb;

    const component: Ref<Component | null> = shallowRef(null);

    const callback = () => {
        if (windowOb.file === null) return null;

        const program = getProgram(windowOb.file.programType);

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
                <component :is="component" />
            </template>
        </div>
    </div>
</template>

<style lang="scss">
    .window__content {
        width: 100%;
        flex: 1;
        min-height: 0;
        overflow: hidden;
        box-sizing: border-box;

        &__wrapper {
            padding: 10px;
            padding-top: 0;
            width: 100%;
            height: 100%;
            max-width: 100%;
            overflow: hidden;
            scrollbar-width: thin;
        }
    }
</style>
