import type { WindowOb } from "~/components/Window/types";
import type { ProgramType } from "~~/shared/types/filesystem";

export type TooltipEntry = {
	programType: ProgramType;
	containerBounds: DOMRect | null;
	isShow: boolean;
	windowObs: WindowOb[];
	container: HTMLElement | null;
};

// Client-only. SSR: per-call пустой reactive для tooltips-экспорта; все методы no-op.
const state: Record<string, TooltipEntry> | null = import.meta.client
	? reactive<Record<string, TooltipEntry>>({})
	: null;
const hideTimers: Map<string, ReturnType<typeof setTimeout>> | null =
	import.meta.client ? new Map() : null;

export const useTaskbarTooltips = () => {
	const cancelHide = (programType: ProgramType) => {
		if (!hideTimers) return;
		const timer = hideTimers.get(programType);
		if (timer) {
			clearTimeout(timer);
			hideTimers.delete(programType);
		}
	};

	const register = (programType: ProgramType, windowObs: WindowOb[]) => {
		if (!state) return;
		// Race-protection: отменить pending hide от предыдущей регистрации.
		cancelHide(programType);
		state[programType] = {
			programType,
			containerBounds: null,
			isShow: false,
			windowObs,
			container: null,
		};
	};

	const unregister = (programType: ProgramType) => {
		if (!state || !hideTimers) return;
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete state[programType];
		const timer = hideTimers.get(programType);
		if (timer) {
			clearTimeout(timer);
			hideTimers.delete(programType);
		}
	};

	const updateWindowObs = (programType: ProgramType, windowObs: WindowOb[]) => {
		if (!state) return;
		if (state[programType]) {
			state[programType].windowObs = [...windowObs];
		}
	};

	const setContainer = (programType: ProgramType, el: HTMLElement | null) => {
		if (!state) return;
		if (state[programType]) {
			state[programType].container = el;
		}
	};

	const updateBounds = (programType: ProgramType) => {
		if (!state) return;
		const entry = state[programType];
		if (entry?.container) {
			entry.containerBounds = entry.container.getBoundingClientRect();
		}
	};

	const show = (programType: ProgramType) => {
		if (!state) return;
		cancelHide(programType);
		const entry = state[programType];
		if (entry) {
			entry.isShow = true;
			updateBounds(programType);
		}
	};

	const hide = (programType: ProgramType) => {
		if (!state || !hideTimers) return;
		cancelHide(programType);
		hideTimers.set(
			programType,
			setTimeout(() => {
				const entry = state[programType];
				if (entry) {
					entry.isShow = false;
				}
				hideTimers.delete(programType);
			}, 150),
		);
	};

	return {
		tooltips: state ?? reactive<Record<string, TooltipEntry>>({}),
		register,
		unregister,
		updateWindowObs,
		setContainer,
		updateBounds,
		show,
		hide,
		cancelHide,
	};
};
