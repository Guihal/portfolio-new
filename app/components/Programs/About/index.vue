<script setup lang="ts">
    
    import { ABOUT_CONTENT } from './content';
import Profile from './Profile.vue';
    import Sections from './Sections.vue';
</script>

<template>
    <div class="about pixel-box">
        <Profile :data="ABOUT_CONTENT" />
        <Sections :data="ABOUT_CONTENT" />
    </div>
</template>

<style lang="scss">
    .about {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        max-height: 100%;

        display: flex;
        gap: 10px;

        @include cw('sm') {
            flex-direction: column-reverse;
            overflow-y: auto;
            overflow-x: hidden;
            background: c('default-3');
        }

        *,
        & {
            scrollbar-color: c('default-contrast') c('default-3');
        }
    }
</style>
