import { getTargetBounds } from "~/composables/useWindowBounds";
import { clamp } from "~/utils/math";
import type { WindowOb } from "../types";

export const MINSIZE = 320;

export type ClampFn = (
	value: number,
	bounds: WindowOb,
	cw: number,
	ch: number,
) => number;

export const clampHandlers: Record<string, ClampFn> = {
	top: (v, windowOb, _cw, ch) => {
		const target = getTargetBounds(windowOb.id);
		return clamp(v, 0, ch - Math.min(target.height, MINSIZE));
	},

	left: (v, windowOb, cw, _ch) => {
		const target = getTargetBounds(windowOb.id);
		return clamp(v, 0, cw - Math.min(target.width, MINSIZE));
	},

	width: (v, _windowOb, cw, _ch) => clamp(v, MINSIZE, cw),

	height: (v, _windowOb, _cw, ch) => clamp(v, MINSIZE, ch),
};
