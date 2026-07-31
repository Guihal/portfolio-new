<script setup lang="ts">
    import type { TaskbarItem } from '../../useTaskbarItems';
    import { useTaskbarElement } from './useTaskbarElement';

    const { item } = defineProps<{ item: TaskbarItem }>();

    const container = ref<HTMLElement | null>(null);

    const {
        icon,
        isActive,
        isRunning,
        tag,
        onClick,
        onMouseenter,
        onMouseleave,
    } = useTaskbarElement(() => item, container);
</script>

<template>
    <component
        :is="tag"
        ref="container"
        class="taskbar__el"
        :class="{ active: isActive, 'taskbar__el--running': isRunning }"
        :href="item.path ?? undefined"
        @click="onClick"
        @mouseenter="onMouseenter"
        @mouseleave="onMouseleave">
        <div class="taskbar__el_img" v-html="icon"></div>
    </component>
</template>

<style lang="scss"></style>
