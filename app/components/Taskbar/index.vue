<script setup lang="ts">
    const taskbar = ref<HTMLElement | null>(null);
    const { setTaskbarObserver } = useContentArea();

    setTaskbarObserver(taskbar);
</script>
<template>
    <div ref="taskbar" class="taskbar"></div>
</template>
<style lang="scss">
    .taskbar {
        width: 100%;
        height: 50px;
        position: fixed;
        bottom: 0;
        left: 0;
        background: rgba(c('default'), 0.8);
        backdrop-filter: blur(5px);
        z-index: 2;
    }
</style>
