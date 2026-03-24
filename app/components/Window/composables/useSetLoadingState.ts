import type { WindowOb } from '../Window';

export function useSetLoadingState(
    windowOb: WindowOb,
    isLoading: Ref<boolean>,
) {
    watch(
        isLoading,
        () => {
            if (isLoading.value) {
                windowOb.states.loading = true;
            } else {
                delete windowOb.states.loading;
            }
        },
        {
            immediate: true,
        },
    );
}
