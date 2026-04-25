<script setup lang="ts">
    import { useInjectWindow } from '~/components/Window/composables/useInjectWindow';
    import type { WindowOb } from '~/components/Window/types';
    import { useBoundsStore } from '~/stores/bounds';
    import { SOCIAL_LINKS } from '~/utils/constants/socials';

    const windowOb = useInjectWindow();
    const bounds = useBoundsStore().ensure(windowOb.id);
</script>

<template>
    <div class="about pixel-box">
        <div
            class="about__left"
            :class="{
                'pixel-box': bounds.target.height < 600,
            }">
            <div class="about__photo pixel-box">
                <img
                    src="/imgs/me.jpg"
                    alt="Дмитрий Стаценко"
                    class="about__photo-img pixel-box" />
            </div>
            <div class="about__info pixel-box">
                <h2 class="about__name">Дмитрий Стаценко</h2>
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
                        <span class="about__social-label">{{
                            social.label
                        }}</span>
                    </a>
                </div>
            </div>
        </div>
        <div class="about__content pixel-box">
            <h3 class="about__title">Добро пожаловать в Dimonya OS v1.0</h3>
            <p class="about__text">
                Привет! Ты загрузился в моё портфолио, замаскированное под
                десктопную ОС. Здесь нет стандартных обоев и пасьянса — зато
                есть мои проекты, которые можно открывать, перетаскивать и
                сворачивать как настоящие окна. Осваивайся 🙂
            </p>

            <h3 class="about__title">/about/dmitry</h3>
            <p class="about__text">
                Меня зовут Дима, я fullstack-разработчик из Ростова-на-Дону.
                Начинал с вёрстки в студии Insaim, потом вордпрессил ThunderWeb
                и SeoLeo, а сейчас уже больше около года работаю с продакшеном
                на Vue, Nuxt и TypeScript. Любимый стек — Nuxt + Pinia, а на
                бэкенде в последнее время экспериментирую с Elysia на Bun.
                Иногда возвращаюсь к WordPress — старый друг всё ещё выручает.
            </p>

            <p class="about__text">
                Учусь в Донском государственном техническом университете. В
                работе делаю упор на UX и производительность: пользователь не
                должен ждать, а интерфейс — раздражать. Если нужно быстро —
                делаю быстро, но без потери качества.
            </p>

            <h3 class="about__title">/about/hobbies</h3>
            <p class="about__text">
                Когда не кодю — играю в игры, слежу за политикой, читаю про
                современную историю и иногда залипаю на стройки. Да, я не строю
                дома — просто люблю смотреть, как это делают другие. Тоже своего
                рода хобби.
            </p>

            <h3 class="about__title">/help/navigation</h3>
            <p class="about__text">
                Панель задач внизу — твой главный ориентир. Двойной клик по
                ярлыку открывает папки, окна можно перетаскивать за заголовок,
                менять их размер, сворачивать и разворачивать на весь экран. В
                общем, всё как в настоящей ОС — только без синего экрана смерти.
                По крайней мере, я на это надеюсь.
            </p>
        </div>
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

        &__left {
            width: 300px;
            min-width: 300px;
            flex-shrink: 0;
            display: flex;
            max-height: 100%;
            flex-direction: column;
            gap: 10px;
            box-sizing: border-box;

            @include cwh('sm') {
                background: c('default-3');
                overflow-y: auto;
            }

            @include cw('sm') {
                height: fit-content;
                max-height: fit-content;
                width: 100%;
                padding: 10px;
            }
        }

        &__photo {
            background: c('default-3');
            padding: 10px;
            box-sizing: border-box;
            height: auto;
            flex-shrink: 0;
            aspect-ratio: 1 / 1;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            max-height: 100%;

            &-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                image-rendering: auto;
            }

            @include ch('sm') {
                padding-bottom: 0;
            }

            @include cw('sm') {
                padding: 0;
            }
        }

        &__info {
            background: c('default-3');
            padding: 10px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 10px;
            flex: 1;
            min-height: 0;
            overflow: auto;

            @include cwh('sm') {
                padding-top: 0;
                overflow: visible;
                height: fit-content;
                min-height: fit-content;
                flex-shrink: 0;
            }

            @include cw('sm') {
                padding: 0;
            }
        }

        &__name {
            @include t(20px, 1.2, 'default-contrast', 600);
            margin: 0;
        }

        &__socials {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        &__social-link {
            display: flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            color: c('default-contrast');
            transition: color 0.2s ease-in-out;

            @media (hover: hover) {
                &:hover {
                    color: c('accent');
                }
            }

            &:active {
                color: c('accent');
            }
        }

        &__social-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            flex-shrink: 0;

            svg {
                width: 20px;
                height: 20px;
            }
        }

        &__social-label {
            @include t(14px, 1, 'default-contrast');
        }

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
