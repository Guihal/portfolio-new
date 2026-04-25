<script setup lang="ts">
    import { computed } from 'vue';
    import type { WindowOb } from '~/components/Window/types';
    import { useWindowsStore } from '~/stores/windows';
    import { PROGRAMS } from '~/utils/constants/programs';
    import type { ProgramType } from '~~/shared/types/filesystem';

    const store = useWindowsStore();

    const windowsGroupByProgram = computed<
        Partial<Record<ProgramType, WindowOb[]>>
    >(() => {
        const result: Partial<Record<ProgramType, WindowOb[]>> = {};

        for (const w of store.list) {
            if (!w?.file) continue;
            const t = w.file.programType;
            if (!PROGRAMS[t]) continue;
            const bucket = result[t] ?? [];
            bucket.push(w);
            result[t] = bucket;
        }

        return result;
    });
</script>

<template>
    <TransitionGroup name="taskbar__el">
        <TaskbarElementsProgram
            v-for="(windows, programType) in windowsGroupByProgram"
            :key="programType"
            :window-obs="windows ?? []"
            :program-type="programType" />
    </TransitionGroup>
</template>

<style lang="scss">
    .taskbar__el-leave-active {
        transition: opacity 0.3s ease-in-out;
    }

    .taskbar__el-leave-to {
        opacity: 0;
    }
</style>
