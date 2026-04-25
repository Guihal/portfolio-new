import { useBoundsStore } from "~/stores/bounds";

export type WindowBounds = {
	left: number;
	top: number;
	width: number;
	height: number;
};

export type WindowBoundsKey = keyof WindowBounds;

export const CSS_VAR_KEYS: Record<WindowBoundsKey, string> = {
	left: "--w-left",
	top: "--w-top",
	width: "--w-width",
	height: "--w-height",
};

export const getTargetBounds = (id: string): WindowBounds =>
	useBoundsStore().ensure(id).target;

export const getCalculatedBounds = (id: string): WindowBounds =>
	useBoundsStore().ensure(id).calculated;

export const removeWindowBounds = (id: string) => {
	useBoundsStore().remove(id);
};

export const useWindowBounds = (id: string) => {
	const slot = useBoundsStore().ensure(id);
	return { target: slot.target, calculated: slot.calculated };
};
