<script setup lang="ts">
    import { useInjectWindow } from '~/components/Window/composables/lifecycle/useInjectWindow';
    import { useInjectWindowRoute } from '~/components/Window/composables/lifecycle/useInjectWindowRoute';
    import { useWindowLoading } from '~/components/Window/composables/route/useWindowLoading';
    import { useProgramFetch } from '~/composables/useProgramFetch';

    const windowOb = useInjectWindow();
    const windowRoute = useInjectWindowRoute();

    // Nav показывает листинг родительской папки. lastPath = parent of windowRoute.
    const lastPath = computed<string>(() => {
        if (windowRoute.value === '/') return '';
        const segments = windowRoute.value.split('/');
        if (segments.length > 1) {
            segments.splice(segments.length - 1, 1);
        }
        return segments.length > 1 ? segments.join('/') : '/';
    });

    const { data, isLoading } = await useProgramFetch({
        path: () => lastPath.value,
        kind: 'list',
    });
    useWindowLoading().register(windowOb.id, isLoading);

    const items = computed<FsFile[]>(() => data.value ?? []);
</script>
<template>
    <nav v-if="items.length > 0" class="explorer__nav pixel-box">
        <div class="explorer__nav_title">Прошлая папка</div>
        <ProgramsExplorerNavShortcut
            v-for="file in items"
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
