<script setup lang="ts">
    import { useCreateAndRegisterWindow } from '~/components/Window/composables/lifecycle/useCreateAndRegisterWindow';
    import { useIsCurrentRoute } from '../useIsCurrentRoute';

    const aboutRoute = ref('/about');

    const handleClick = (ev: MouseEvent) => {
        ev.preventDefault();

        setTimeout(() => {
            useCreateAndRegisterWindow(aboutRoute.value);
        });
    };

    const { isCurrentRoute } = useIsCurrentRoute(aboutRoute);
</script>

<template>
    <a
        :href="aboutRoute"
        class="taskbar__el about__link"
        :class="{
            active: isCurrentRoute,
        }"
        @click="handleClick">
        <svg
            class="taskbar__el_img"
            width="70"
            height="70"
            viewBox="0 0 70 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
                d="M46 2H50V4H54V6H56V8H58V10H60V12H62V14H64V16H66V20H68V24H70V44H68V48H66V52H64V56H62V58H60V60H58V62H56V64H52V66H48V68H44V70H26V68H22V66H18V64H14V62H12V60H10V58H8V56H6V52H4V48H2V44H0V26H2V22H4V18H6V14H8V12H10V10H12V8H14V6H18V4H20V2H24V0H46V2ZM26 6H22V8H18V10H16V12H14V14H12V16H10V20H8V24H6V28H4V42H6V46H8V50H10V54H12V56H14V58H16V60H18V62H24V64H28V66H42V64H46V62H52V60H54V58H56V56H58V54H60V50H62V48H64V42H66V26H64V22H62V18H60V16H58V14H56V12H54V10H52V8H50V6H44V4H26V6ZM23.5459 52.3477V56H19.7275V52.3477H23.5459ZM50.2725 52.3477V56H46.4541V52.3477H50.2725ZM23.5459 14V17.6523H27.3633V21.3047H42.6367V17.6523H46.4541V14H52.1816V26.7822H56V43.2178H52.1816V48.6953H46.4541V52.3477H23.5459V48.6953H17.8184V52.3477H14V48.6953H17.8184V43.2178H14V26.7822H17.8184V14H23.5459ZM56 48.6953V52.3477H52.1816V48.6953H56ZM31.1816 39.5654V43.2178H33.0908V48.6953H36.9092V43.2178H38.8184V39.5654H31.1816ZM25.4541 32.2607V35.9131H29.2725V32.2607H25.4541ZM40.7275 32.2607V35.9131H44.5459V32.2607H40.7275Z"
                fill="var(--icon-color)" />
        </svg>
    </a>
</template>

<style lang="scss">
    .about__link {
        &.active {
            svg {
                --icon-color: #{c('default')};
            }
        }
        svg {
            --icon-color: #{c('main')};

            path {
                transition: fill 0.3s ease-in-out;
            }
        }
    }
</style>
