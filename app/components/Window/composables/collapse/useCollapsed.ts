import type { WindowOb } from "../../types";
import { useCollapseBoundsMemory } from "./useCollapseBoundsMemory";
import { useCollapseOffscreenPosition } from "./useCollapseOffscreenPosition";
import { useCollapseTrigger } from "./useCollapseTrigger";

/**
 * Facade над bounds-memory, offscreen-position и trigger sub-composables.
 * Возвращает click-handler для инициации сворачивания.
 */
export function useCollapsed(windowOb: WindowOb): () => void {
	useCollapseBoundsMemory(windowOb);
	useCollapseOffscreenPosition(windowOb);
	return useCollapseTrigger(windowOb);
}
