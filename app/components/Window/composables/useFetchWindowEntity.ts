import type { WindowOb } from '../Window';
import { useWindowLoading } from './useWindowLoading';

export async function useWindowEntityFetcher(
    windowOb: WindowOb,
    windowRoute: Ref<string>,
) {
    const isNeedLoading = computed(() => {
        return (
            windowOb.file?.path !== windowOb.targetFile.value ||
            !windowOb.targetFile.value ||
            windowOb.targetFile.value !== windowRoute.value
        );
    });

    const isLoading = ref(false);

    const { register } = useWindowLoading();

    register(windowOb.id, isLoading);

    // Используем уникальный ключ для каждого окна
    const { data, error, refresh } = await useAsyncData(
        () => `window-entity-${windowRoute.value}`,
        async () => {
            if (!isNeedLoading.value) return null;
            isLoading.value = true;
            let res = undefined;
            try {
                res = await $fetch('/api/filesystem/get', {
                    method: 'POST',
                    body: {
                        path: windowRoute.value,
                    },
                });
            } catch (err) {
                console.error(err);
            }
            isLoading.value = false;
            return res;
        },
        {
            watch: [isNeedLoading],
            immediate: true,
            server: import.meta.server === true,
        },
    );

    watch(
        error,
        () => {
            if (!error.value) return;
            throw createError({
                statusCode: 404,
                statusMessage: 'Страница не найдена',
                fatal: true,
            });
        },
        {
            immediate: true,
        },
    );

    watch(
        data,
        () => {
            if (!data.value) return;

            windowOb.file = {
                ...data.value,
            };
        },
        {
            immediate: true,
        },
    );
}
