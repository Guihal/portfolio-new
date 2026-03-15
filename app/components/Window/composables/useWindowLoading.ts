const loaders: Record<string, Ref<boolean>[]> = reactive({});

export function useWindowLoading() {
    const register = (windowId: string, isLoading: Ref<boolean>) => {
        if (!loaders[windowId]) {
            loaders[windowId] = [];
        }

        loaders[windowId].push(isLoading);
    };

    const getIsLoading = (windowId: string) =>
        computed(
            () =>
                loaders[windowId]?.some((ref) => (ref ? ref.value : false)) ??
                false,
        );

    const { allWindows } = useAllWindows();

    const initWindowLoading = (windowId: string) => {
        watch(
            () => loaders[windowId],
            () => {
                const windowOb = allWindows.value[windowId];
                if (!windowOb) return;

                if (isLoading(windowId)) {
                    windowOb.states.loading = true;
                } else {
                    delete windowOb.states.loading;
                }
            },
            {
                immediate: true,
                deep: true,
            },
        );
    };

    return {
        initWindowLoading,
        register,
        getIsLoading,
    };
}
