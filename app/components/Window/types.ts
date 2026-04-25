import type { InjectionKey, Ref } from "vue";
import type { FsFile } from "~~/shared/types/filesystem";
import type { ChainedKey } from "./composables/useResizeForDirections";

export type WindowState =
	| "fullscreen"
	| "fullscreen-ready"
	| "collapsed"
	| "drag"
	| "resize"
	| "loading"
	| "error"
	| "focused"
	| "preview";

export type WindowResizeDirections = Partial<Record<ChainedKey, boolean>>;

export type WindowStates = Partial<Record<WindowState, true>>;
export type WindowFile = FsFile | null;
export type WindowOb = {
	id: string;
	states: WindowStates;
	// Маскируется под Ref, но не Ref: Pinia reactive proxy auto-unwrap'нул бы
	// nested ref внутри plain object, ломая `.value` API. Plain wrapper —
	// намеренный workaround. Мутировать только через windowsStore.setTargetFile.
	targetFile: {
		value: string;
	};
	file: WindowFile;
	errorMessage?: string;
};

export const WindowObKey: InjectionKey<WindowOb> = Symbol("WindowOb");
export const WindowRouteKey: InjectionKey<Readonly<Ref<string>>> =
	Symbol("WindowRoute");
