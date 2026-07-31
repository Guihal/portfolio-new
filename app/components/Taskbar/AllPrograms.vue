<script setup lang="ts">
    import { useTaskbarItems } from './useTaskbarItems';

    const items = useTaskbarItems();
</script>

<template>
    <TransitionGroup name="taskbar__el">
        <TaskbarElementsProgram
            v-for="item in items"
            :key="item.type"
            :item="item" />
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
