<script setup lang="ts">
    const audio = ref<null | HTMLAudioElement>(null);
    const isLoading = ref(true);
    const isClicked = ref(false);

    const onclick = () => {
        if (isLoading.value) return;
        isClicked.value = true;
        if (!audio.value) return;
        audio.value.volume = 0.3;
        audio.value.play();
    };

    onMounted(() => {
        setTimeout(() => {
            isLoading.value = false;
        }, 2000);
    });
</script>

<template>
    <Transition
        name="loader"
        :class="{
            'loader--end': !isLoading,
        }"
        @click="onclick">
        <div v-show="!isClicked" class="loader">
            <Transition name="loader__icon">
                <svg
                    v-if="isLoading"
                    class="loader__icon"
                    width="70"
                    height="70"
                    viewBox="0 0 70 70"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M46 2H50V4H54V6H56V8H58V10H60V12H62V14H64V16H66V20H68V24H70V44H68V48H66V52H64V56H62V58H60V60H58V62H56V64H52V66H48V68H44V70H26V68H22V66H18V64H14V62H12V60H10V58H8V56H6V52H4V48H2V44H0V26H2V22H4V18H6V14H8V12H10V10H12V8H14V6H18V4H20V2H24V0H46V2ZM26 6H22V8H18V10H16V12H14V14H12V16H10V20H8V24H6V28H4V42H6V46H8V50H10V54H12V56H14V58H16V60H18V62H24V64H28V66H42V64H46V62H52V60H54V58H56V56H58V54H60V50H62V48H64V42H66V26H64V22H62V18H60V16H58V14H56V12H54V10H52V8H50V6H44V4H26V6ZM23.5459 52.3477V56H19.7275V52.3477H23.5459ZM50.2725 52.3477V56H46.4541V52.3477H50.2725ZM23.5459 14V17.6523H27.3633V21.3047H42.6367V17.6523H46.4541V14H52.1816V26.7822H56V43.2178H52.1816V48.6953H46.4541V52.3477H23.5459V48.6953H17.8184V52.3477H14V48.6953H17.8184V43.2178H14V26.7822H17.8184V14H23.5459ZM56 48.6953V52.3477H52.1816V48.6953H56ZM31.1816 39.5654V43.2178H33.0908V48.6953H36.9092V43.2178H38.8184V39.5654H31.1816ZM25.4541 32.2607V35.9131H29.2725V32.2607H25.4541ZM40.7275 32.2607V35.9131H44.5459V32.2607H40.7275Z"
                        fill="inherit" />
                </svg>
            </Transition>
            <Transition name="loader__text">
                <div v-if="!isLoading" class="loader__text">
                    Нажмите для входа в Dimonya OS
                </div>
            </Transition>
            <audio v-show="false" ref="audio" src="/loading-end.mp3"></audio>
        </div>
    </Transition>
</template>

<style lang="scss">
    .loader {
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: c('default');
        transition-property: opacity, scale;
        transition-duration: 0.3s;
        transition-timing-function: ease-in-out;
        display: flex;
        justify-content: center;
        align-items: center;

        &--end {
            cursor: pointer;
            user-select: none;
        }

        &__text {
            font-family: Pix, system-ui;
            color: c('default-contrast');
            font-size: 20px;
            animation: flick 1s ease-in-out infinite;

            @keyframes flick {
                0% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.5;
                }
                100% {
                    opacity: 1;
                }
            }
        }

        &__icon {
            @keyframes rotate {
                0% {
                    transform: rotateY(0deg);
                }

                33% {
                    transform: rotateY(360deg);
                }

                66% {
                    transform: rotateY(0deg);
                }

                100% {
                    transform: rotateY(-360deg);
                }
            }
            position: absolute;
            left: 50%;
            top: 50%;
            translate: -50% -50%;
            fill: c('main');
            animation: rotate 3s ease-in-out infinite;

            &-enter-active,
            &-leave-active {
                transition-property: opacity, scale;
                transition-duration: 0.3s;
                transition-timing-function: ease-in-out;
            }

            &-enter-from,
            &-leave-to {
                opacity: 0 !important;
                scale: 0.9;
            }
        }

        &-enter-active,
        &-leave-active {
            transition-property: translate;
            transition-duration: 0.3s;
            transition-timing-function: ease-in-out;
        }

        &-enter-from,
        &-leave-to {
            translate: 0 -100%;
        }
    }
</style>
