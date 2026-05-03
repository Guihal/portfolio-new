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

export type CascadeLayout = "cascade" | "tile-h";

export interface CascadeWindowSpec {
	id: string;
	layout?: CascadeLayout;
}

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

/**
 * Sequential spawn: каждое окно создаётся через useCreateWindowByPath,
 * затем bounds приклеиваются через boundsStore. Sequential await гарантирует
 * порядок и focus на последнем окне (focus обновляется внутри регистрации
 * + явный focus после setTarget).
 */
export function useCascadeLayout() {
	async function spawnCodeWindows(
		parentEntityPath: string,
		codeWindows: CascadeWindowSpec[],
	) {
		if (codeWindows.length === 0) return;
		const layout: CascadeLayout = codeWindows[0]?.layout ?? "cascade";
		const viewport = useContentAreaStore().area;
		const boundsStore = useBoundsStore();
		const windowsStore = useWindowsStore();
		const focusStore = useFocusStore();

		for (let i = 0; i < codeWindows.length; i++) {
			const cw = codeWindows[i];
			if (!cw) continue;
			const bounds = computeCascadeBounds(layout, i, viewport);
			const path = `${parentEntityPath}/code/${cw.id}`;
			const ok = await useCreateWindowByPath(path);
			if (!ok) continue;
			const win = windowsStore.byPath(path);
			if (!win) continue;
			boundsStore.setTarget(win.id, bounds);
			focusStore.focus(win.id);
		}
	}

	return { computeBounds: computeCascadeBounds, spawnCodeWindows };
}
