<script setup lang="ts">
    import { useViewportObserver } from '~/composables/global/useViewportObserver';

    useViewportObserver();

    const props = defineProps<{
        error: { statusCode: number; message?: string; statusMessage?: string };
    }>();

    const is404 = computed(() => props.error.statusCode === 404);

    const title = computed(() =>
        is404.value
            ? "404 — Портфолио Дмитрия Стаценко"
            : "Ошибка — Портфолио Дмитрия Стаценко",
    );

    const message = computed(
        () =>
            props.error.statusMessage ??
            props.error.message ??
            "Что-то пошло не так",
    );

    useSeoMeta({
        title,
        description: "Запрошенная страница не найдена или недоступна.",
        robots: "noindex, nofollow",
    });

    function handleError() {
        clearError({ redirect: "/about" });
    }
</script>

<template>
    <div class="error-page">
        <div class="error-page__inner">
            <h1 class="error-page__code">{{ error.statusCode }}</h1>
            <p class="error-page__message">{{ message }}</p>
            <button type="button" class="error-page__button" @click="handleError">
                На главную
            </button>
        </div>
    </div>
</template>

<style lang="scss">
    .error-page {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: c('default');
        color: c('default-contrast');
        padding: 20px;
        box-sizing: border-box;
    }

    .error-page__inner {
        text-align: center;
        max-width: 480px;
        background: c('default-3');
        padding: 40px 30px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: center;
    }

    .error-page__code {
        @include t($fs: 64px, $lh: 1, $cName: 'accent', $fw: 700);
        margin: 0;
        font-family: $t-default;
    }

    .error-page__message {
        @include t($fs: 16px, $lh: 1.4, $cName: 'default-contrast');
        margin: 0;
    }

    .error-page__button {
        @include t($fs: 14px, $lh: 1, $cName: 'default-contrast', $fw: 600);
        background: c('main');
        color: c('default');
        border: 0;
        padding: 10px 20px;
        cursor: pointer;
        font-family: $t-default;

        &:hover {
            background: c('accent');
        }
    }
</style>
