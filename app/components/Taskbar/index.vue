<script setup lang="ts">
    const taskbar = ref<HTMLElement | null>(null);
    const { setTaskbarObserver } = useContentArea();

    setTaskbarObserver(taskbar);

    const { unFocus } = useFocusWindowController();
</script>
<template>
    <nav ref="taskbar" class="taskbar pixel-box">
        <div class="taskbar__bg" @click="unFocus"></div>
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

        display: flex;
        justify-content: space-between;

        z-index: 100;

        &__bg {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: c-rgba('default', 0.8);
        }

        &__list {
            width: fit-content;
            display: flex;

            &--left {
                justify-content: end;
            }
        }
    }
</style>
