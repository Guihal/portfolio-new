import type { ProgramType } from '~~/shared/types/Program';
import type { WindowOb } from '~/components/Window/Window';

export type TooltipEntry = {
    programType: ProgramType;
    containerBounds: DOMRect | null;
    isShow: boolean;
    windowObs: WindowOb[];
    container: HTMLElement | null;
};

const state = reactive<Record<string, TooltipEntry>>({});
const hideTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useTaskbarTooltips = () => {
    const register = (programType: ProgramType, windowObs: WindowOb[]) => {
        state[programType] = {
            programType,
            containerBounds: null,
            isShow: false,
            windowObs,
            container: null,
        };
    };

    const unregister = (programType: ProgramType) => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete state[programType];
        const timer = hideTimers.get(programType);
        if (timer) {
            clearTimeout(timer);
            hideTimers.delete(programType);
        }
    };

    const updateWindowObs = (
        programType: ProgramType,
        windowObs: WindowOb[],
    ) => {
        if (state[programType]) {
            state[programType].windowObs = [...windowObs];
        }
    };

    const setContainer = (programType: ProgramType, el: HTMLElement | null) => {
        if (state[programType]) {
            state[programType].container = el;
        }
    };

    const updateBounds = (programType: ProgramType) => {
        const entry = state[programType];
        if (entry?.container) {
            entry.containerBounds = entry.container.getBoundingClientRect();
        }
    };

    const cancelHide = (programType: ProgramType) => {
        const timer = hideTimers.get(programType);
        if (timer) {
            clearTimeout(timer);
            hideTimers.delete(programType);
        }
    };

    const show = (programType: ProgramType) => {
        cancelHide(programType);
        const entry = state[programType];
        if (entry) {
            entry.isShow = true;
            updateBounds(programType);
        }
    };

    const hide = (programType: ProgramType) => {
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
        tooltips: state,
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
