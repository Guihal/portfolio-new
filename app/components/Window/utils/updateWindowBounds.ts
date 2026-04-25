import {
	useBoundsStore,
	type WindowBounds,
	type WindowBoundsKey,
} from "~/stores/bounds";
import type { WindowOb } from "../types";

export function useUpdateWindowBounds(windowOb: WindowOb) {
	return (targetBounds: WindowBounds) => {
		const target = useBoundsStore().ensure(windowOb.id).target;
		const keys: WindowBoundsKey[] = ["left", "top", "width", "height"];
		for (const key of keys) {
			target[key] = targetBounds[key];
		}
	};
}
