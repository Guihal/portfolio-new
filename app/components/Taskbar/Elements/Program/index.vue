<script setup lang="ts">
    import type { WindowOb } from '~/components/Window/types';
    import { getProgram } from '~/programs';
    import { useFocusStore } from '~/stores/focus';
    import type { ProgramType } from '~~/shared/types/filesystem';

    const { programType, windowObs } = defineProps<{
        programType: ProgramType;
        windowObs: WindowOb[];
    }>();

    const icon = computed(() => getProgram(programType)?.icon ?? '');

    const focusStore = useFocusStore();
    const focus = (id: string) => focusStore.focus(id);

    const currentIndex = ref(0);

    const { register, unregister, setContainer, show, hide, updateWindowObs } =
        useTooltipState();

    const container = ref<HTMLElement | null>(null);

    onMounted(() => {
        register(programType, windowObs);
        setContainer(programType, container.value);
    });

    watch(
        () => windowObs,
        (obs) => updateWindowObs(programType, obs),
    );

    onBeforeUnmount(() => {
        unregister(programType);
    });

    watch(currentIndex, () => {
        if (currentIndex.value > windowObs.length - 1) {
            currentIndex.value = 0;
            return;
        }

        const windowOb = windowObs[currentIndex.value];
        if (!windowOb) return;

        focus(windowOb.id);
    });

    watch(
        () => windowObs.length,
        (len) => {
            if (len === 0) hide(programType);
        },
    );

    const onClick = () => {
        currentIndex.value++;
    };
    const onMouseenter = () => show(programType);
    const onMouseleave = () => hide(programType);
</script>

<template>
    <button
        ref="container"
        class="taskbar__el"
        @click="onClick"
        @mouseenter="onMouseenter"
        @mouseleave="onMouseleave">
        <div class="taskbar__el_img" v-html="icon"></div>
    </button>
</template>

<style lang="scss"></style>
