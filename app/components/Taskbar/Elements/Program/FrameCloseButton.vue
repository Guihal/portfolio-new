<script setup lang="ts">
    defineEmits<{
        close: [];
    }>();
</script>

<template>
    <div class="taskbar__frame-close" @click="$emit('close')">
        <div class="taskbar__frame-close_el"></div>
        <div class="taskbar__frame-close_el"></div>
    </div>
</template>

<style lang="scss">
    .taskbar__frame-close {
        height: 10px;
        width: 10px;
        cursor: pointer;
        user-select: none;
        position: relative;

        &_el {
            width: 10px;
            height: 2px;
            background-color: c('default-contrast');
            position: absolute;
            left: 50%;
            top: 50%;
            translate: -50% -50%;

            &:first-child {
                rotate: -45deg;
            }

            &:last-child {
                rotate: 45deg;
            }
        }
    }
</style>
