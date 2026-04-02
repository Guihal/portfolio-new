<script setup lang="ts">
    const { windowsGroupByProgram } = useWindowsGroupByProgram();
    console.log(windowsGroupByProgram.value);
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
