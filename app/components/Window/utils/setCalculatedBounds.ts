import {
	getCalculatedBounds,
	type WindowBoundsKey,
} from "~/composables/useWindowBounds";
import type { WindowOb } from "../types";

export type SetBoundsBounds = Partial<Record<WindowBoundsKey, number>>;

export function setCalculatedBounds(
	windowOb: WindowOb,
	bounds: SetBoundsBounds,
) {
	const calculated = getCalculatedBounds(windowOb.id);
	for (const key in bounds) {
		const typedKey = key as WindowBoundsKey;
		calculated[typedKey] = bounds[typedKey]!;
	}
}
