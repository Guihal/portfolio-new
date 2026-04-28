<script setup lang="ts">
    import { computed, onErrorCaptured } from 'vue';
    import { useInjectWindow } from '~/components/Window/composables/lifecycle/useInjectWindow';
    import { useProgramSetup } from '~/components/Window/composables/program/useProgramSetup';
    import { useWindowsUIStore } from '~/stores/windowsUI';

    const windowOb = useInjectWindow();
    const { programView } = useProgramSetup(windowOb);
    const uiStore = useWindowsUIStore();

    const hasError = computed(() => windowOb.states.error === true);
    const isLoading = computed(() => windowOb.states.loading === true);
    const errorText = computed(
        () => uiStore.getError(windowOb.id) || 'Не удалось открыть',
    );

    onErrorCaptured((err, _instance, info) => {
        logger.error('[window/content] async program component threw', {
            windowId: windowOb.id,
            info,
            err,
        });
        const message =
            err instanceof Error ? err.message : 'Внутренняя ошибка программы';
        uiStore.setError(windowOb.id, message);
        return false;
    });
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
                <Suspense>
                    <component :is="programView.component" />
                    <template #fallback>
                        <div class="window__content__suspense-fallback" />
                    </template>
                </Suspense>
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
            color: c-rgba('default-contrast', 0.7);
        }

        &__suspense-fallback {
            width: 100%;
            height: 100%;
            background: c('default-1');
        }
    }
</style>
