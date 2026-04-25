<script setup lang="ts">
    import { useWindowLoading } from '~/components/Window/composables/useWindowLoading';
    import type { WindowOb } from '~/components/Window/types';

    const windowOb = inject('windowOb') as WindowOb;
    const windowRoute = inject('windowRoute') as Ref<string>;

    const lastPath: Ref<null | string> = computed(() => {
        if (windowRoute.value === '/') return null;

        const segments = windowRoute.value.split('/');

        if (segments.length > 1) {
            segments.splice(segments.length - 1, 1);
        }

        const path = segments.length > 1 ? segments.join('/') : '/';

        return path;
    });

    const { windowFetch } = useWindowFetch(windowOb.id);

    const { data } = await useAsyncData(
        () => `explorer-${lastPath.value}`,
        async () => {
            if (!lastPath.value) return [];
            const result = await windowFetch(async () =>
                $fetch<FsFile[]>('/api/filesystem/list', {
                    query: { path: lastPath.value },
                }),
            );
            return result ?? [];
        },
        {
            watch: [lastPath],
            server: import.meta.server ? true : false,
            immediate: true,
        },
    );
</script>
<template>
    <nav class="explorer__nav pixel-box" v-if="(data?.length ?? 0) > 0">
        <div class="explorer__nav_title">Прошлая папка</div>
        <ProgramsExplorerNavShortcut
            v-for="file in data"
            :key="file.path"
            :file />
    </nav>
</template>
<style lang="scss">
    .explorer__nav {
        background: c('default-3');
        flex-shrink: 0;
        display: flex;
        flex-direction: column;

        &_title {
            font-size: 20px;
            padding-bottom: 10px;
            color: c('default-contrast');
        }

        padding: 10px;
        box-sizing: border-box;

        &__content {
            height: 100%;
            padding: 10px;
            box-sizing: border-box;
        }

        height: calc(50% - 5px);
        overflow: hidden;
        max-height: 100%;
    }
</style>
