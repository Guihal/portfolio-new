<script setup lang="ts">
    const { tooltips } = useTooltipState();

    const visibleTooltips = computed(() =>
        Object.values(tooltips).filter((t) => t.isShow),
    );
</script>

<template>
    <TransitionGroup name="taskbar__tooltip-group">
        <TaskbarTooltipItem
            v-for="entry in visibleTooltips"
            :key="entry.programType"
            :program-type="entry.programType"
            :window-obs="entry.windowObs"
            :container-bounds="entry.containerBounds" />
    </TransitionGroup>
</template>

<style lang="scss">
    .taskbar__tooltip-group-enter-active {
        transition: opacity 0.3s ease;
    }
    .taskbar__tooltip-group-leave-active {
        transition: opacity 0.3s ease;
        position: absolute;
    }
    .taskbar__tooltip-group-enter-from,
    .taskbar__tooltip-group-leave-to {
        opacity: 0;
    }
</style>
