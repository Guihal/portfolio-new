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

    const width = computed(() => contentArea.value.width);
    const height = computed(() => contentArea.value.height);

    const columns = computed(() => {
        const count = cellsInElement.x;
        const size = realCell.value.width;

        return `repeat(${count}, ${size}px)`;
    });

    const rows = computed(() => {
        const count = cellsInElement.y;
        const size = realCell.value.height;
        return `repeat(${count}, ${size}px)`;
    });

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
    <div ref="workbench" class="workbench" @click="unFocus">
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
        width: calc(v-bind(width) * 1px - var(--offset) * 2);
        height: calc(v-bind(height) * 1px - var(--offset) * 2);
        display: grid;
        grid-template-columns: v-bind(columns);
        grid-template-rows: v-bind(rows);
        box-sizing: border-box;
        margin: var(--offset);
        z-index: 1;
    }
</style>
