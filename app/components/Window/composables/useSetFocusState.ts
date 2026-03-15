import type { WindowOb } from '../Window';

export function useSetFocusState(windowOb: WindowOb) {
    const { getIsFocusedState } = useFocusWindowController();

    const isFocused = getIsFocusedState(windowOb);

    watch(
        isFocused,
        () => {
            if (isFocused.value) {
                windowOb.states.focused = true;
            } else {
                delete windowOb.states.focused;
            }
        },
        {
            immediate: true,
        },
    );

    watch(
        () => windowOb.states.fullscreen,
        (st) => {
            setTimeout(() => {
                if (st) {
                    windowOb.states.focused = true;
                }
            });
        },
        {
            immediate: true,
        },
    );
}
