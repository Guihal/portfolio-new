import type { WindowOb } from "../types";

export function useIsInteractionWindow(windowOb: WindowOb) {
	return computed(
		() => windowOb.states.resize === true || windowOb.states.drag === true,
	);
}
