import { useBoundsStore, type WindowBoundsKey } from "~/stores/bounds";
import type { WindowOb } from "../types";

export type SetBoundsBounds = Partial<Record<WindowBoundsKey, number>>;

export function setTargetBounds(windowOb: WindowOb, bounds: SetBoundsBounds) {
	const target = useBoundsStore().ensure(windowOb.id).target;
	for (const key in bounds) {
		const typedKey = key as WindowBoundsKey;
		target[typedKey] = bounds[typedKey]!;
	}
}
