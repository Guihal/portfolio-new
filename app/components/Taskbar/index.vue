<script setup lang="ts">
    const taskbar = ref<HTMLElement | null>(null);
    const { setTaskbarObserver } = useContentArea();

    setTaskbarObserver(taskbar);

    const { unFocus } = useFocusWindowController();
</script>
<template>
    <nav ref="taskbar" class="taskbar pixel-box" @click="unFocus">
        <ul class="taskbar__list">
            <TaskbarElementsAbout />
            <TaskbarAllPrograms />
        </ul>
        <div class="taskbar__list taskbar__list--left"></div>
    </nav>
</template>
<style lang="scss">
    .taskbar {
        width: 100%;
        height: 50px;
        position: fixed;
        bottom: 0;
        left: 0;
        background: rgba(c('default'), 0.8);
        display: flex;
        justify-content: space-between;

        z-index: 2;

        &__list {
            width: fit-content;
            display: flex;

            &--left {
                justify-content: end;
            }
        }
    }
</style>
