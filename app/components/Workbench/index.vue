<script setup lang="ts">
    import { storeToRefs } from 'pinia';
    import { useContentAreaStore } from '~/stores/contentArea';
    import { useFocusStore } from '~/stores/focus';
    import { useQueuedRouterStore } from '~/stores/queuedRouter';
    import type { FsFile } from '~~/shared/types/filesystem';

    const workbench: Ref<null | HTMLElement> = ref(null);
    const { area: contentArea } = storeToRefs(useContentAreaStore());

    const { cellsInElement, realCell, subscribe } = useGridCells(workbench, {
        width: 100,
        height: 120,
    });

    const gridStyle = computed(() => ({
        width: `calc(${contentArea.value.width}px - var(--offset) * 2)`,
        height: `calc(${contentArea.value.height}px - var(--offset) * 2)`,
        gridTemplateColumns: `repeat(${cellsInElement.x}, ${realCell.value.width}px)`,
        gridTemplateRows: `repeat(${cellsInElement.y}, ${realCell.value.height}px)`,
    }));

    onMounted(subscribe);

    const { data } = await useAsyncData(
        'workbench',
        async () => {
            let data: FsFile[] | undefined;
            try {
                data = await $fetch<FsFile[]>('/api/filesystem/list', {
                    query: { path: '/' },
                });
            } catch (err) {
                logger.error('[Workbench]', err);
            }

            return data;
        },
        {
            transform: (data) => {
                return data?.filter((entity) => !entity?.hidden);
            },
        },
    );

    const focusStore = useFocusStore();
    const queuedRouter = useQueuedRouterStore();
    const unFocus = () => {
        focusStore.unFocus();
        queuedRouter.push('/');
    };

</script>
<template>
    <div
        ref="workbench"
        class="workbench"
        :style="gridStyle"
        @click="unFocus">
        <WorkbenchShortcut
            v-for="file in data"
            :key="file.path"
            :file="file" />
    </div>
</template>
<style lang="scss">
    .workbench {
        position: fixed;
        left: 0;
        top: 0;
        --offset: 10px;
        display: grid;
        box-sizing: border-box;
        margin: var(--offset);
        z-index: 1;
    }
</style>
