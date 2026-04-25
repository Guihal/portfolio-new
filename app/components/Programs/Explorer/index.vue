<script setup lang="ts">
    
    import { useInjectWindow } from '~/components/Window/composables/useInjectWindow';
import { useInjectWindowRoute } from '~/components/Window/composables/useInjectWindowRoute';
    import { useWindowLoading } from '~/components/Window/composables/useWindowLoading';
    import type { WindowOb } from '~/components/Window/types';
    import type { ProgramConfig } from '~/programs';

    const windowOb = useInjectWindow();
    const windowRoute = useInjectWindowRoute();
    const programConfig = inject<Ref<ProgramConfig | null>>(
        'programConfig',
        ref(null),
    );

    const canNavigate = computed(
        () => programConfig.value?.canNavigate ?? true,
    );

    const isLoading = ref(false);
    useWindowLoading().register(windowOb.id, isLoading);

    const { data } = await useAsyncData<FsFile[]>(
        () => `explorer-${windowRoute.value}`,
        async () => {
            if (!windowRoute.value) return [];
            isLoading.value = true;
            try {
                return (
                    (await $fetch<FsFile[]>('/api/filesystem/list', {
                        query: { path: windowRoute.value },
                    })) ?? []
                );
            } catch (err) {
                logger.error('[explorer]', err);
                return [];
            } finally {
                isLoading.value = false;
            }
        },
        {
            server: true,
            immediate: true,
            transform: (d) => d ?? [],
            default: () => [],
        },
    );
</script>
<template>
    <div class="explorer">
        <div class="explorer__left">
            <ProgramsExplorerNav v-if="canNavigate" />
            <ClientOnly>
                <ProgramsExplorerNavFacts />
            </ClientOnly>
        </div>
        <ProgramsExplorerList :items="data" />
    </div>
</template>
<style lang="scss">
    .explorer {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        min-height: fit-content;
        margin-top: 0;
        display: flex;
        gap: 10px;

        * {
            scrollbar-color: c('default-contrast') c('default-3');
        }

        &__left {
            width: 200px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            gap: 10px;

            @include cw('md') {
                display: none;
            }
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
        }

        &:has(.explorer__empty) {
            .explorer__content {
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }

        &__empty {
            font-family: $t-default;
            font-size: 40px;
            line-height: 100%;
            color: c('default-contrast');
        }
    }
</style>
