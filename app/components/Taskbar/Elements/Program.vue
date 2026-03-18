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

    watch(currentIndex, () => {
        if (currentIndex.value > windowObs.length - 1) {
            currentIndex.value = 0;
            return;
        }

        const windowOb = windowObs[currentIndex.value];
        console.log(windowOb?.id);
        if (!windowOb) return;

        focus(windowOb.id);
    });

    const onClick = debounce(() => currentIndex.value++, 50);
</script>

<template>
    <button class="taskbar__el" @click="onClick">
        <div class="taskbar__el_img" v-html="icon"></div>
        <div class="taskbar__el_number">
            {{ windowObs.length }}
        </div>
    </button>
</template>

<style lang="scss"></style>
