<script setup lang="ts">
    import { storeToRefs } from 'pinia';
    import { useWindowsStore } from '~/stores/windows';

    // Получаем реактивное хранилище всех окон (Record<string, WindowOb>)
    const { windows: allWindows } = storeToRefs(useWindowsStore());
</script>
<template>
    <!-- Анимированный список окон (добавление/удаление с transition) -->
    <TransitionGroup name="window">
        <Window
            v-for="windowOb in allWindows"
            :windowOb="windowOb"
            :key="windowOb.id" />
    </TransitionGroup>
</template>
<style lang="scss"></style>
