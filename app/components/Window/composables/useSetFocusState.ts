import type { WindowOb } from "../types";

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

	let fullscreenFocusTimer: ReturnType<typeof setTimeout> | null = null;
	watch(
		() => windowOb.states.fullscreen,
		(st) => {
			// Безусловный clear: любая смена fullscreen отменяет устаревший pending focus.
			if (fullscreenFocusTimer !== null) clearTimeout(fullscreenFocusTimer);
			fullscreenFocusTimer = setTimeout(() => {
				fullscreenFocusTimer = null;
				if (st) focus(windowOb.id);
			});
		},
		{
			immediate: true,
		},
	);

	onScopeDispose(() => {
		if (fullscreenFocusTimer !== null) {
			clearTimeout(fullscreenFocusTimer);
			fullscreenFocusTimer = null;
		}
	});
}
