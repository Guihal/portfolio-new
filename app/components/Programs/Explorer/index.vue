<script setup lang="ts">
    import type { WindowOb } from '~/components/Window/Window';

    const windowOb = inject('windowOb') as WindowOb;
    const windowRoute = inject('windowRoute') as Ref<string>;
    watchEffect(() => console.log(windowRoute.value));
    const { windowFetch } = useWindowFetch(windowOb.id);

    const { data } = await useAsyncData(
        () => `explorer-${windowRoute.value}f`,
        async () => {
            console.log(windowRoute.value);
            if (!windowRoute.value) return [];

            const result = await windowFetch(async () =>
                $fetch<FsFile[]>('/api/filesystem/list', {
                    body: { path: windowRoute.value },
                    method: 'POST',
                }),
            );
            return result ?? [];
        },
        {
            server: import.meta.server ? true : false,
            immediate: true,
        },
    );
</script>
<template>
    <div class="explorer">
        <div
            class="explorer__left"
            v-if="windowOb.bounds.calculated.width > 768">
            <ProgramsExplorerNav />
            <ProgramsExplorerNavFacts />
        </div>
        <div class="explorer__content pixel-box">
            <template v-if="data?.length > 0">
                <ProgramsExplorerShortcut
                    v-for="file in data"
                    :key="file.path"
                    :file />
            </template>
            <template v-else>
                <div class="explorer__empty">Тут ничего нет :(</div>
            </template>
        </div>
    </div>
</template>
<style lang="scss">
    .explorer {
        box-sizing: border-box;
        width: calc(100% - 20px);
        height: calc(100% - 10px);
        min-height: fit-content;
        margin: 10px;
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
            font-family: Pix, systen-ui;
            font-size: 40px;
            line-height: 100%;
            color: c('default-contrast');
        }
    }
</style>
