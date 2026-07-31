<script setup lang="ts">
    import { useInjectWindow } from '~/components/Window/composables/lifecycle/useInjectWindow';
    import { useInjectWindowRoute } from '~/components/Window/composables/lifecycle/useInjectWindowRoute';
    import { useWindowLoading } from '~/components/Window/composables/route/useWindowLoading';
    import { ProgramViewKey } from '~/components/Window/types';
    import { useProgramFetch } from '~/composables/window/useProgramFetch';

    const windowOb = useInjectWindow();
    const windowRoute = useInjectWindowRoute();
    // P8-10: переход с string-key 'programConfig' на типизированный
    // ProgramViewKey. ProgramView содержит config; canNavigate берём оттуда.
    const programView = inject(ProgramViewKey, null);

    const canNavigate = computed(
        () => programView?.value?.config.canNavigate ?? true,
    );

    const { data, isLoading } = await useProgramFetch({
        path: () => windowRoute.value,
        kind: 'list',
    });
    useWindowLoading().register(windowOb.id, isLoading);

    const items = computed<FsFile[]>(() => data.value ?? []);

    // h1 окна: entity.name (например «Рабочий стол», «Проекты»).
    // Fallback на label программы, если entity не загрузился.
    const { data: entityData } = await useProgramFetch({
        path: () => windowRoute.value,
        kind: 'get',
    });
    const title = computed(
        () =>
            entityData.value?.name ??
            programView?.value?.label ??
            '',
    );
</script>
<template>
    <div class="explorer">
        <h1 v-if="title" class="explorer__title">{{ title }}</h1>
        <div class="explorer__body">
            <div class="explorer__left">
                <ProgramsExplorerNav v-if="canNavigate" />
                <ClientOnly>
                    <ProgramsExplorerNavFacts />
                </ClientOnly>
            </div>
            <ProgramsExplorerList :items="items" />
        </div>
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
        flex-direction: column;
        gap: 10px;

        * {
            scrollbar-color: c('default-contrast') c('default-3');
        }

        &__title {
            @include t($fs: 20px, $lh: 1.2, $cName: 'default-contrast', $fw: 700);
            margin: 0;
            padding: 10px 0 0;
        }

        &__body {
            flex: 1;
            min-height: 0;
            display: flex;
            gap: 10px;
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
