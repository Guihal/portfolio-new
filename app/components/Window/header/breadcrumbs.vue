<script setup lang="ts">
    import type { FsFile } from '~~/shared/types/filesystem';
    import { useWindowLoading } from '../composables/useWindowLoading';
    import type { WindowOb } from '../types';

    const windowRoute = inject('windowRoute') as Ref<string>;
    const windowOb = inject('windowOb') as WindowOb;

    const { register } = useWindowLoading();

    const isLoading = ref(false);
    register(windowOb.id, isLoading);

    const { data } = useAsyncData(
        () => `breadcrumbs-${windowRoute.value}`,
        async () => {
            isLoading.value = true;
            let resp: FsFile[] | null | undefined;
            try {
                resp = await $fetch<FsFile[] | null>('/api/filesystem/breadcrumbs', {
                    query: { path: windowRoute.value },
                });
            } catch (err) {
                logger.error('[breadcrumbs]', err);
            }
            isLoading.value = false;

            return resp;
        },
        {
            watch: [windowRoute],
            immediate: true,
            server: import.meta.server === true,
        },
    );

    const goTo = (path: string) => {
        windowOb.targetFile.value = path;
    };
</script>

<template>
    <div class="window__breadcrumbs">
        <div class="window__breadcrumbs__wrapper pixel-box">
            <template v-for="(file, i) in data" :key="file.path">
                <div
                    v-if="i !== 0"
                    class="window__breadcrumbs_el window__breadcrumbs_separator">
                    /
                </div>
                <a
                    v-if="i + 1 !== data?.length && data?.length !== 1"
                    :href="file.path"
                    class="window__breadcrumbs_el"
                    @click.prevent="goTo(file.path)">
                    {{ file.name }}
                </a>
                <div v-else class="window__breadcrumbs_el">
                    {{ file.name }}
                </div>
            </template>
        </div>
    </div>
</template>

<style lang="scss">
    .window__breadcrumbs {
        width: 100%;
        padding: 10px;
        padding-top: 0;
        box-sizing: border-box;

        &__wrapper {
            padding: 10px;
            width: 100%;
            display: flex; // inline-flex → flex
            gap: 10px;
            background: c('default-3');
            box-sizing: border-box;
            overflow: hidden;
            // text-overflow убрать — не работает с дочерними элементами
        }

        &_el {
            font-family: $t-default;
            font-size: 15px;
            line-height: 1;
            letter-spacing: 0.02em;

            flex-shrink: 1;
            min-width: 0;
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: color 0.3s ease-in-out;

            color: c('default-contrast');

            &[href] {
                @media (hover: hover) {
                    &:hover {
                        color: c('accent');
                    }
                }

                &:active {
                    color: c('accent');
                }
            }
        }
    }
</style>
