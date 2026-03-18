import { debounce } from '../utils/debounce';

const loaders: Record<string, Ref<Ref<boolean>[]>> = {};

export function useWindowLoading() {
    const register = (windowId: string, isLoading: Ref<boolean>) => {
        if (!loaders[windowId]) {
            loaders[windowId] = ref([]);
        }

        loaders[windowId].value.push(isLoading);
    };

    const isLoading = (windowId: string) =>
        loaders[windowId]?.value.some((ref) => (ref ? ref.value : false)) ??
        false;

    const getIsLoading = (windowId: string) =>
        computed(() => isLoading(windowId));

    const { allWindows } = useAllWindows();

    const initWindowLoading = (windowId: string) => {
        if (!loaders[windowId]) {
            loaders[windowId] = ref([]); // ← создаём до watch
        }

        watchEffect(
            debounce(() => {
                const windowOb = allWindows.value[windowId];

                if (!windowOb) return;
                const windowLoaders = loaders[windowId];
                if (!windowLoaders) return;

                const loading =
                    windowLoaders?.value.some((ref) => ref.value) ?? false;

                if (loading) {
                    windowOb.states.loading = true;
                } else {
                    delete windowOb.states.loading;
                }
            }),
        );
    };

    return {
        initWindowLoading,
        register,
        getIsLoading,
    };
}
