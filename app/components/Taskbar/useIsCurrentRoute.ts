export function useIsCurrentRoute(checkedRoute: Ref<string>) {
    const { allWindows } = useAllWindows();
    const isCurrentRoute = ref(false);
    const callback = () => {
        for (const key in allWindows.value) {
            const typedKey = key as keyof AllWindows;
            if (allWindows.value[typedKey]?.file?.path === checkedRoute.value) {
                isCurrentRoute.value = true;
                return;
            }
        }

        isCurrentRoute.value = false;
    };

    watch(checkedRoute, callback, {
        immediate: true,
    });
    watch(allWindows.value, callback, {
        immediate: true,
    });

    return {
        isCurrentRoute,
    };
}
