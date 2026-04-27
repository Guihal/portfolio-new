<script setup lang="ts">
    import { storeToRefs } from 'pinia';
    import { useWindowsStore } from '~/stores/windows';

    const store = useWindowsStore();
    const { byProgramMap } = storeToRefs(store);
</script>

<template>
    <TransitionGroup name="taskbar__el">
        <TaskbarElementsProgram
            v-for="[programType, windows] in byProgramMap"
            :key="programType"
            :window-obs="windows"
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
