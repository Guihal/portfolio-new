<script setup lang="ts">
    import { debounce } from '~/components/Window/utils/debounce';
    import type { WindowOb } from '~/components/Window/Window';
    import { PROGRAMS } from '~/utils/constants/PROGRAMS';
    import type { ProgramType } from '~~/shared/types/Program';

    const { programType, windowObs } = defineProps<{
        programType: ProgramType;
        windowObs: WindowOb[];
    }>();

    const icon = computed(() => {
        if (!PROGRAMS[programType]) return '';
        return PROGRAMS[programType].icon;
    });

    const { focus } = useFocusWindowController();

    const currentIndex = ref(0);

    const { register, unregister, setContainer, show, hide, updateWindowObs } =
        useTaskbarTooltips();

    const container = ref<HTMLElement | null>(null);

    onMounted(() => {
        register(programType, windowObs);
        setContainer(programType, container.value);
    });

    watch(
        () => windowObs,
        (obs) => updateWindowObs(programType, obs),
        { deep: true },
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

    const onClick = debounce(() => currentIndex.value++, 50);
    const onMouseover = debounce(() => show(programType), 16);
    const onMouseout = debounce(() => hide(programType), 16);
</script>

<template>
    <button
        ref="container"
        class="taskbar__el"
        @click="onClick"
        @mouseover="onMouseover"
        @mouseout="onMouseout">
        <div class="taskbar__el_img" v-html="icon"></div>
    </button>
</template>

<style lang="scss"></style>
