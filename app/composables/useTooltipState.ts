import { reactive } from "vue";
import type { WindowOb } from "~/components/Window/types";
import type { ProgramType } from "~~/shared/types/filesystem";

// P8-07: переименование из useTaskbarTooltips. Метод-логика — module-level
// функции (closure-free, max-lines-per-function < 60). Module-state guarded
// by import.meta.client (SSR-safe: на сервере state=null, методы no-op).
//
// Грейс перед скрытием тултипа — защита от мерцания при перелёте курсора между
// program items. Магия 150 → P8-09 (TOOLTIP_HIDE_DELAY_MS из utils/constants/timing.ts).
const HIDE_DELAY_MS = 150;

export type TooltipEntry = {
	programType: ProgramType;
	containerBounds: DOMRect | null;
	isShow: boolean;
	windowObs: WindowOb[];
	container: HTMLElement | null;
};

const state: Record<string, TooltipEntry> | null = import.meta.client
	? reactive<Record<string, TooltipEntry>>({})
	: null;
const hideTimers: Map<string, ReturnType<typeof setTimeout>> | null =
	import.meta.client ? new Map() : null;

function cancelHide(programType: ProgramType) {
	if (!hideTimers) return;
	const timer = hideTimers.get(programType);
	if (timer) {
		clearTimeout(timer);
		hideTimers.delete(programType);
	}
}

function register(programType: ProgramType, windowObs: WindowOb[]) {
	if (!state) return;
	cancelHide(programType);
	state[programType] = {
		programType,
		containerBounds: null,
		isShow: false,
		windowObs,
		container: null,
	};
}

function unregister(programType: ProgramType) {
	if (!state) return;
	// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
	delete state[programType];
	cancelHide(programType);
}

function updateWindowObs(programType: ProgramType, windowObs: WindowOb[]) {
	const entry = state?.[programType];
	if (entry) entry.windowObs = [...windowObs];
}

function setContainer(programType: ProgramType, el: HTMLElement | null) {
	const entry = state?.[programType];
	if (entry) entry.container = el;
}

function updateBounds(programType: ProgramType) {
	const entry = state?.[programType];
	if (entry?.container) {
		entry.containerBounds = entry.container.getBoundingClientRect();
	}
}

function show(programType: ProgramType) {
	if (!state) return;
	cancelHide(programType);
	const entry = state[programType];
	if (entry) {
		entry.isShow = true;
		updateBounds(programType);
	}
}

function hide(programType: ProgramType) {
	if (!state || !hideTimers) return;
	cancelHide(programType);
	hideTimers.set(
		programType,
		setTimeout(() => {
			const entry = state[programType];
			if (entry) entry.isShow = false;
			hideTimers.delete(programType);
		}, HIDE_DELAY_MS),
	);
}

const fallbackTooltips = reactive<Record<string, TooltipEntry>>({});

export const useTooltipState = () => ({
	tooltips: state ?? fallbackTooltips,
	register,
	unregister,
	updateWindowObs,
	setContainer,
	updateBounds,
	show,
	hide,
	cancelHide,
});
