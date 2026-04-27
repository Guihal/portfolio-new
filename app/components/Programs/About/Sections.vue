<script setup lang="ts">
    import type { AboutContent } from './content';

    defineProps<{ data: AboutContent }>();
</script>

<template>
    <div class="about__content pixel-box">
        <template v-for="(section, idx) in data.sections" :key="idx">
            <h3 class="about__title">{{ section.title }}</h3>
            <p
                v-for="(p, pIdx) in section.paragraphs"
                :key="pIdx"
                class="about__text">
                {{ p }}
            </p>
        </template>
    </div>
</template>

<style lang="scss">
    .about {
        &__content {
            background: c('default-3');
            height: 100%;
            padding: 10px;
            box-sizing: border-box;
            overflow-y: auto;
            overflow-x: hidden;
            max-height: 100%;
            width: 100%;

            @include cw('sm') {
                height: fit-content;
                max-height: fit-content;
                flex-shrink: 0;
                padding-bottom: 0;
            }
        }

        &__title {
            @include t(20px, 1.2, 'default-contrast', 600);
            margin: 0 0 10px;

            &:not(:first-child) {
                margin-top: 20px;
            }
        }

        &__text {
            @include t(14px, 1.5, 'default-contrast');
            margin: 0 0 10px;

            &:last-child {
                margin-bottom: 0;
            }
        }
    }
</style>
