<script setup lang="ts">
    import { useInjectWindow } from '~/components/Window/composables/lifecycle/useInjectWindow';
    import { useBoundsStore } from '~/stores/bounds';
    import { SOCIAL_LINKS } from '~/utils/constants/socials';
    import type { AboutContent } from './content';

    defineProps<{ data: AboutContent }>();

    const windowOb = useInjectWindow();
    const bounds = useBoundsStore().ensure(windowOb.id);
</script>

<template>
    <div
        class="about__left"
        :class="{ 'pixel-box': bounds.target.height < 600 }">
        <div class="about__photo pixel-box">
            <img
                :src="data.photoSrc"
                :alt="data.photoAlt"
                class="about__photo-img pixel-box" />
        </div>
        <div class="about__info pixel-box">
            <h2 class="about__name">{{ data.name }}</h2>
            <div class="about__socials">
                <a
                    v-for="social in SOCIAL_LINKS"
                    :key="social.id"
                    :href="social.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="about__social-link"
                    :title="social.label">
                    <span class="about__social-icon" v-html="social.icon" />
                    <span class="about__social-label">{{ social.label }}</span>
                </a>
            </div>
        </div>
    </div>
</template>

<style src="./profile.scss" lang="scss"></style>
