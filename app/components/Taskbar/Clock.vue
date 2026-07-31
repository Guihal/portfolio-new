<script setup lang="ts">
    import { useClock } from '~/composables/global/useClock';

    const clock = useClock();
</script>

<template>
    <div class="taskbar__el taskbar__clock">
        <span class="taskbar__clock-time">{{ clock.time }}</span>
        <span class="taskbar__clock-date">{{ clock.date }}</span>
    </div>
</template>

<style lang="scss">
    .taskbar__clock {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 2px;

        &-time {
            @include t(12px, 1, 'default-contrast');
        }

        &-date {
            @include t(9px, 1, 'default-contrast');
        }
    }
</style>
