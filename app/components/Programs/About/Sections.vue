<script setup lang="ts">
    import type { AboutContent } from './content';

    defineProps<{ data: AboutContent }>();
</script>

<template>
    <div class="about__content pixel-box">
        <div class="about__neofetch">
            <span class="about__prompt">$ neofetch</span>
            <dl class="about__specs">
                <template v-for="([key, value], idx) in data.neofetch" :key="idx">
                    <dt class="about__spec-key">{{ key }}</dt>
                    <dd class="about__spec-value">{{ value }}</dd>
                </template>
            </dl>
        </div>
        <p class="about__text">{{ data.intro }}</p>
        <template v-for="(section, idx) in data.sections" :key="idx">
            <h2 class="about__title">{{ section.title }}</h2>
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

        &__neofetch {
            margin-bottom: 20px;
        }

        &__prompt {
            @include t(14px, 1.5, 'main');
            display: block;
            margin-bottom: 10px;
        }

        &__specs {
            display: grid;
            grid-template-columns: max-content 1fr;
            gap: 2px 12px;
            margin: 0;
        }

        &__spec-key {
            @include t(14px, 1.5, 'accent');
        }

        &__spec-value {
            @include t(14px, 1.5, 'default-contrast');
            margin: 0;
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
