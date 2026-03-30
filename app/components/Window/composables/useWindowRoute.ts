import { debounce } from '../utils/debounce';
import type { WindowOb } from '../Window';

export function useWindowRoute(windowOb: WindowOb) {
    const route = useRoute();

    const windowRoute = ref(windowOb.targetFile.value);

    const { queuedPush, isQueueEmpty } = useQueuedRouter();
    let isProgrammaticNavigation = true;

    watch(
        () => windowOb.states.focused,
        (focused) => {
            if (!focused) return;

            const path = windowOb.targetFile.value;
            if (!path || route.path === path) return;

            isProgrammaticNavigation = true;

            queuedPush(path).finally(() => {
                isProgrammaticNavigation = false;
            });
        },
        {
            immediate: true,
        },
    );

    // Окно меняет свой путь → двигаем роутер (только если окно в фокусе)
    watch(
        () => windowOb.targetFile.value,
        (newPath) => {
            if (!newPath) return;

            windowRoute.value = newPath;

            // Не в фокусе — только запоминаем путь, роутер не трогаем
            if (!windowOb.states.focused) return;

            if (route.path !== newPath) {
                isProgrammaticNavigation = true;
                queuedPush(newPath).finally(() => {
                    isProgrammaticNavigation = false;
                });
            }
        },
        {
            immediate: true,
        },
    );

    watch(
        () => route.path,
        debounce((newPath) => {
            if (isProgrammaticNavigation) return;
            if (!windowOb.states.focused) return;
            if (!newPath) return;

            windowRoute.value = newPath;
            windowOb.targetFile.value = newPath;
        }, 16),
    );

    return computed(() => windowRoute.value);
}
