import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type {
	WindowOb,
	WindowState,
	WindowStates,
} from "~/components/Window/types";
import type { FsFile, ProgramType } from "~~/shared/types/filesystem";
import { useFocusStore } from "./focus";

export const useWindowsStore = defineStore("windows", () => {
	const windows = ref<Record<string, WindowOb>>({});
	const counter = ref(0);

	const list = computed<WindowOb[]>(() => Object.values(windows.value));
	const byId = (id: string): WindowOb | undefined => windows.value[id];
	const byPath = (path: string): WindowOb | undefined =>
		list.value.find((w) => w.targetFile.value === path);
	const byProgram = (type: ProgramType): WindowOb[] =>
		list.value.filter((w) => w.file?.programType === type);

	function create(file: FsFile | string): WindowOb {
		let id: string;
		do {
			id = (++counter.value).toString();
		} while (id in windows.value);
		const path = typeof file === "string" ? file : file.path;
		const ob: WindowOb = {
			id,
			states: {} as WindowStates,
			targetFile: { value: path },
			file: typeof file === "string" ? null : file,
		};
		windows.value[id] = ob;
		// Возвращаем reactive-обёртку (ту же, что отдаст byId), иначе
		// референсное равенство create() vs byId() не работает.
		return windows.value[id] as WindowOb;
	}

	function remove(id: string) {
		if (!(id in windows.value)) return;
		Reflect.deleteProperty(windows.value, id);
		const focus = useFocusStore();
		if (focus.focusedId === id) focus.unFocus();
		// Cascade cleanup (bounds/frame/loaders) выполняется orchestrator'ом
		// useRemoveWindow в app/components/Window/utils/removeWindow.ts.
	}

	function focus(id: string) {
		useFocusStore().focus(id);
	}

	function unFocus() {
		useFocusStore().unFocus();
	}

	function setState<K extends WindowState>(id: string, key: K, value: boolean) {
		const w = windows.value[id];
		if (!w) return;
		if (value) w.states[key] = true;
		else Reflect.deleteProperty(w.states, key);
	}

	function clearState(id: string, key: WindowState) {
		const w = windows.value[id];
		if (!w) return;
		Reflect.deleteProperty(w.states, key);
	}

	/**
	 * Сбрасывает ТОЛЬКО windows+counter. focus/bounds/frame intentionally
	 * untouched — паритет со старым SSR-сбросом; каскадный cleanup на удалении
	 * конкретного окна — через orchestrator (useRemoveWindow).
	 */
	function $reset() {
		windows.value = {};
		counter.value = 0;
	}

	return {
		windows,
		counter,
		list,
		byId,
		byPath,
		byProgram,
		create,
		remove,
		focus,
		unFocus,
		setState,
		clearState,
		$reset,
	};
});
