import { useBoundsStore, type WindowBoundsKey } from "~/stores/bounds";
import type { WindowOb } from "../types";

export type SetBoundsBounds = Partial<Record<WindowBoundsKey, number>>;

export function setCalculatedBounds(
	windowOb: WindowOb,
	bounds: SetBoundsBounds,
) {
	const calculated = useBoundsStore().ensure(windowOb.id).calculated;
	for (const key in bounds) {
		const typedKey = key as WindowBoundsKey;
		calculated[typedKey] = bounds[typedKey]!;
	}
}
