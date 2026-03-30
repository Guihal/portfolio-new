import type { WindowOb } from '../Window';

export function useSetFocusState(windowOb: WindowOb) {
    const { getIsFocusedState, focus } = useFocusWindowController();

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
        () => windowOb.states.focused === true,
        (v) => {
            if (v) {
                delete windowOb.states.collapsed;
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
                    focus(windowOb.id);
                }
            });
        },
        {
            immediate: true,
        },
    );
}
