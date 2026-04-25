import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type {
	WindowOb,
	WindowState,
	WindowStates,
} from "~/components/Window/types";
import type { FsFile, ProgramType } from "~~/shared/types/filesystem";

export const useWindowsStore = defineStore("windows", () => {
	const windows = ref<Record<string, WindowOb>>({});
	const counter = ref(0);

	const list = computed<WindowOb[]>(() => Object.values(windows.value));
	const byId = (id: string): WindowOb | undefined => windows.value[id];

	// First-wins: при дублирующихся path возвращаем самое раннее окно.
	// Паритет с тестом «double create того же path → byPath возвращает первое».
	const byPathMap = computed<Map<string, WindowOb>>(() => {
		const m = new Map<string, WindowOb>();
		for (const w of list.value) {
			const p = w.targetFile.value;
			if (!m.has(p)) m.set(p, w);
		}
		return m;
	});
	const byProgramMap = computed<Map<ProgramType, WindowOb[]>>(() => {
		const m = new Map<ProgramType, WindowOb[]>();
		for (const w of list.value) {
			const t = w.file?.programType;
			if (!t) continue;
			const arr = m.get(t);
			if (arr) arr.push(w);
			else m.set(t, [w]);
		}
		return m;
	});
	const byPath = (path: string): WindowOb | undefined =>
		byPathMap.value.get(path);
	const byProgram = (type: ProgramType): WindowOb[] =>
		byProgramMap.value.get(type) ?? [];

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

	/**
	 * Удалить окно. Возвращает `true` если окно существовало и было удалено,
	 * иначе `false`. Cascade focus reset / bounds / frame / loaders / router —
	 * в useRemoveWindow.
	 */
	function remove(id: string): boolean {
		if (!(id in windows.value)) return false;
		Reflect.deleteProperty(windows.value, id);
		return true;
	}

	/**
	 * Таблица несовместимых state-комбинаций.
	 * При setState(id, key, true) автоматически clear все states из incompatible[key].
	 * Базируется на UI-инвариантах:
	 *   - fullscreen ↔ collapsed: окно не может быть одновременно fullscreen и свернуто
	 *   - fullscreen ↔ drag/resize: пользователь не может тащить/ресайзить fullscreen-окно
	 *   - collapsed ↔ drag/resize: свёрнутое окно не интерактивно
	 */
	const INCOMPATIBLE: Partial<Record<WindowState, readonly WindowState[]>> = {
		fullscreen: ["collapsed", "drag", "resize"],
		collapsed: ["fullscreen", "drag", "resize"],
		drag: ["fullscreen", "collapsed"],
		resize: ["fullscreen", "collapsed"],
		// One-way: новый fetch (loading=true) сбрасывает прошлую ошибку.
		// Обратное (error → clear loading) НЕ добавляем — иначе setError во время
		// in-flight fetch ложно сбросит loading flag.
		loading: ["error"],
	};

	function setState<K extends WindowState>(id: string, key: K, value: boolean) {
		const w = windows.value[id];
		if (!w) return;
		if (value) {
			w.states[key] = true;
			const conflicts = INCOMPATIBLE[key];
			if (conflicts) {
				for (const k of conflicts) {
					Reflect.deleteProperty(w.states, k);
					if (k === "error") w.errorMessage = undefined;
				}
			}
		} else {
			Reflect.deleteProperty(w.states, key);
			if (key === "error") w.errorMessage = undefined;
		}
	}

	function clearState(id: string, key: WindowState) {
		const w = windows.value[id];
		if (!w) return;
		Reflect.deleteProperty(w.states, key);
		if (key === "error") w.errorMessage = undefined;
	}

	function setError(id: string, message: string | null) {
		const w = windows.value[id];
		if (!w) return;
		if (typeof message === "string") {
			setState(id, "error", true);
			w.errorMessage = message;
		} else if (w.states.error || w.errorMessage !== undefined) {
			clearState(id, "error");
		}
	}

	function toggleState(id: string, key: WindowState) {
		const w = windows.value[id];
		if (!w) return;
		setState(id, key, !w.states[key]);
	}

	/**
	 * Установить FsFile в окне. Единственно-разрешённый способ мутации
	 * `windowOb.file` — прямая мутация снаружи store запрещена (см. P*-1).
	 */
	function setFile(id: string, file: FsFile) {
		const w = windows.value[id];
		if (!w) return;
		w.file = { ...file };
	}

	/**
	 * Обновить targetFile.value окна. Единственно-разрешённый способ —
	 * прямая мутация снаружи store запрещена (см. P*-1).
	 */
	function setTargetFile(id: string, path: string) {
		const w = windows.value[id];
		if (!w) return;
		w.targetFile.value = path;
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
		byPathMap,
		byProgramMap,
		create,
		remove,
		setState,
		clearState,
		setError,
		toggleState,
		setFile,
		setTargetFile,
		$reset,
	};
});
