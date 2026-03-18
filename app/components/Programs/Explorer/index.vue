<script setup lang="ts">
    import { useWindowLoading } from '~/components/Window/composables/useWindowLoading';
    import type { WindowOb } from '~/components/Window/Window';

    const { windowOb } = defineProps<{
        windowOb: WindowOb;
    }>();

    const { register } = useWindowLoading();
    const isLoading = ref(true);

    register(windowOb.id, isLoading);

    const { data, pending } = await useAsyncData(
        () => `explorer-list-${windowOb.targetFile}`,
        () => {
            return $fetch('/api/filesystem/list', {
                body: {
                    path: windowOb.targetFile,
                },
                method: 'POST',
            });
        },
        {
            watch: [() => windowOb.targetFile],
            server: import.meta.server ? true : false,
        },
    );

    watch(
        pending,
        () => {
            isLoading.value = pending.value;
        },
        {
            immediate: true,
        },
    );
</script>
<template>
    <div class="explorer">
        <template v-if="data?.length">
            <ProgramsExplorerShortcut
                v-for="file in data"
                :key="file.path"
                :file
                :windowOb />
        </template>
        <template v-else>
            <div class="explorer__empty">Тут ничего нет :(</div>
        </template>
    </div>
</template>
<style lang="scss">
    .explorer {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        min-height: fit-content;

        &:has(.explorer__empty) {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        &__empty {
            font-family: Pix, systen-ui;
            font-size: 40px;
            line-height: 100%;
            color: c('default-contrast');
        }
    }
</style>
