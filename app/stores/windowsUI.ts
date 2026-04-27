import { defineStore } from "pinia";
import { ref } from "vue";
import { useWindowsStore } from "./windows";

/**
 * P8-11: transient UI-state per-window. Вынесен из `windows.ts` чтобы оставить
 * core registry чистым (id/state/file). Сюда складываются текстовые
 * представления состояний (errorMessage), а не сами state-флаги — последние
 * остаются в `windows.ts.states` как часть incompatibility matrix.
 *
 * Контракт: setError транзакционно мутирует и `windowsUIStore.errors`, и
 * `windowsStore.states.error`. Snake-case инвариант — наличие сообщения ⇔
 * `states.error === true`. Прямой `windows.setState(id, "error", ...)` извне
 * допустим (поддерживается incompatibility matrix), и cleanup сообщения
 * выполняется кросс-стор-вызовом из windows.ts.
 */
export const useWindowsUIStore = defineStore("windowsUI", () => {
	const errors = ref<Record<string, string>>({});

	function getError(id: string): string | undefined {
		return errors.value[id];
	}

	function clear(id: string) {
		Reflect.deleteProperty(errors.value, id);
	}

	/**
	 * Транзакционно: записывает/чистит сообщение в UI-store И флипает
	 * `windows.states.error` через windowsStore. Используется как единая точка
	 * выставления ошибки для consumer'ов (useFetchEntity, etc.).
	 */
	function setError(id: string, message: string | null) {
		const ws = useWindowsStore();
		const w = ws.byId(id);
		if (!w) return;
		if (typeof message === "string") {
			errors.value[id] = message;
			ws.setState(id, "error", true);
		} else if (w.states.error || errors.value[id] !== undefined) {
			ws.clearState(id, "error");
		}
	}

	function $reset() {
		errors.value = {};
	}

	return { errors, getError, clear, setError, $reset };
});
