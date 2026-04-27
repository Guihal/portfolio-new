<script setup lang="ts">
    import { useInjectWindow } from '~/components/Window/composables/useInjectWindow';
    import { useProgramSetup } from '~/components/Window/composables/useProgramSetup';

    const windowOb = useInjectWindow();
    const { programView } = useProgramSetup(windowOb);

    const hasError = computed(() => windowOb.states.error === true);
    const isLoading = computed(() => windowOb.states.loading === true);
    const errorText = computed(
        () => windowOb.errorMessage || 'Не удалось открыть',
    );
</script>

<template>
    <div class="window__content">
        <div class="window__content__wrapper">
            <template v-if="isLoading">
                <!-- spinner живёт в WindowLoader (Window/index.vue) -->
            </template>
            <template v-else-if="hasError">
                <div class="window__content__error">
                    {{ errorText }}
                </div>
            </template>
            <template v-else-if="programView">
                <component :is="programView.component" />
            </template>
        </div>
    </div>
</template>

<style lang="scss">
    .window__content {
        width: 100%;
        flex: 1;
        min-height: 0;
        overflow: hidden;
        box-sizing: border-box;

        &__wrapper {
            padding: 10px;
            padding-top: 0;
            width: 100%;
            height: 100%;
            max-width: 100%;
            overflow: hidden;
            scrollbar-width: thin;
        }

        &__error {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            padding: 20px;
            text-align: center;
            color: c-rgba('text', 0.7);
        }
    }
</style>
