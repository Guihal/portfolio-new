import { storeToRefs } from "pinia";
import type { WindowOb } from "~/components/Window/types";
import { useWindowsStore } from "~/stores/windows";

/** Type-only consumer: app/components/Taskbar/useIsCurrentRoute.ts. */
export type AllWindows = Record<string, WindowOb>;

export const useAllWindows = () => {
	const { windows: allWindows, counter: allWindowsIdCounter } = storeToRefs(
		useWindowsStore(),
	);
	return { allWindows, allWindowsIdCounter };
};

/**
 * Чистит ТОЛЬКО windows+counter. focus/bounds/frame intentionally untouched —
 * паритет со старым поведением; каскадный cleanup в P2-03 через orchestrator.
 */
export const clearAllWindowsState = () => {
	useWindowsStore().$reset();
};
