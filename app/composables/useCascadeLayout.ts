import { useCreateWindowByPath } from "~/components/Window/composables/lifecycle/useCreateWindowByPath";
import { useBoundsStore } from "~/stores/bounds";
import { useContentAreaStore } from "~/stores/contentArea";
import { useFocusStore } from "~/stores/focus";
import { useWindowsStore } from "~/stores/windows";
import {
	CASCADE_INITIAL_HEIGHT,
	CASCADE_INITIAL_WIDTH,
	CASCADE_OFFSET_X,
	CASCADE_OFFSET_Y,
	TILE_H_GAP,
} from "~/utils/constants/cascade";
import type { CodeWindowsConfig } from "~~/server/utils/manifest/resolveCodeContent";

export type CascadeLayout = CodeWindowsConfig["layout"];

interface BoundsRect {
	left: number;
	top: number;
	width: number;
	height: number;
}

interface Viewport {
	width: number;
	height: number;
}

export function computeCascadeBounds(
	layout: CascadeLayout,
	idx: number,
	viewport: Viewport,
): BoundsRect {
	if (layout === "tile-h") {
		const half = Math.max(0, (viewport.width - TILE_H_GAP) / 2);
		return {
			left: idx === 0 ? 0 : half + TILE_H_GAP,
			top: 0,
			width: half,
			height: viewport.height,
		};
	}
	return {
		left: CASCADE_OFFSET_X * idx,
		top: CASCADE_OFFSET_Y * idx,
		width: CASCADE_INITIAL_WIDTH,
		height: CASCADE_INITIAL_HEIGHT,
	};
}

export function useCascadeLayout() {
	async function spawnCodeWindows(
		parentEntityPath: string,
		config: CodeWindowsConfig,
	) {
		if (config.windows.length === 0) return;
		const viewport = useContentAreaStore().area;
		const boundsStore = useBoundsStore();
		const windowsStore = useWindowsStore();
		const focusStore = useFocusStore();
		for (let i = 0; i < config.windows.length; i++) {
			const cw = config.windows[i];
			if (!cw) continue;
			const bounds = computeCascadeBounds(config.layout, i, viewport);
			const path = `${parentEntityPath}/code/${cw.id}`;
			const ok = await useCreateWindowByPath(path, {
				skipFullscreenOnMount: true,
			});
			if (!ok) continue;
			const win = windowsStore.byPath(path);
			if (!win) continue;
			boundsStore.setTarget(win.id, bounds);
			boundsStore.syncCalculated(win.id);
			focusStore.focus(win.id);
		}
	}

	return { computeBounds: computeCascadeBounds, spawnCodeWindows };
}
