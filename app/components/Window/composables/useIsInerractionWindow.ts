import type { WindowOb } from '../Window';

export function useIsInteractionWindow(windowOb: WindowOb) {
    return computed(
        () => windowOb.states.resize === true || windowOb.states.drag === true,
    );
}
