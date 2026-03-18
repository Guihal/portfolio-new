<script setup lang="ts">
    import type { ProgramType } from '~~/shared/types/Program';
    import type { WindowOb } from '../Window/Window';
    import { PROGRAMS } from '~/utils/constants/PROGRAMS';
    import { debounce } from '../Window/utils/debounce';

    const { allWindows } = useAllWindows();

    const windowsGroupByProgram: Ref<Partial<Record<ProgramType, WindowOb[]>>> =
        ref({});

    watch(
        allWindows.value,
        debounce(() => {
            windowsGroupByProgram.value = {};

            for (const id in allWindows.value) {
                const typedId = id as keyof AllWindows;

                if (!allWindows.value[typedId]?.file) continue;

                const typeProgram = allWindows.value[typedId].file.programType;

                if (!PROGRAMS[typeProgram]) continue;

                if (!windowsGroupByProgram.value[typeProgram]) {
                    windowsGroupByProgram.value[typeProgram] = [];
                }

                windowsGroupByProgram.value[typeProgram].push(
                    allWindows.value[typedId],
                );
            }
        }, 200),
        {
            immediate: true,
            deep: true,
        },
    );
</script>

<template>
    <TransitionGroup name="taskbar__el">
        <template
            v-for="(windows, programType) in windowsGroupByProgram"
            :key="programType">
            <TaskbarElementsProgram :windowObs="windows" :programType />
        </template>
    </TransitionGroup>
</template>

<style lang="scss"></style>
