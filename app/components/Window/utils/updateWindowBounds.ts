import {
	getTargetBounds,
	type WindowBounds,
	type WindowBoundsKey,
} from "~/composables/useWindowBounds";
import type { WindowOb } from "../types";

export function useUpdateWindowBounds(windowOb: WindowOb) {
	return (targetBounds: WindowBounds) => {
		const target = getTargetBounds(windowOb.id);
		const keys: WindowBoundsKey[] = ["left", "top", "width", "height"];
		for (const key of keys) {
			target[key] = targetBounds[key];
		}
	};
}
