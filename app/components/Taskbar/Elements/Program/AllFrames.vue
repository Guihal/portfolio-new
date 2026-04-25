<script setup lang="ts">
    import type { WindowOb } from '~/components/Window/types';

    const { windowObs } = defineProps<{
        windowObs: WindowOb[];
    }>();
</script>

<template>
    <TransitionGroup>
        <template v-for="windowOb in windowObs" :key="windowOb.id">
            <TaskbarElementsProgramFrame :windowOb="windowOb" />
        </template>
    </TransitionGroup>
</template>

<style lang="scss"></style>
