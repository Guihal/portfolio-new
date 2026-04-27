import { useFocusStore } from "~/stores/focus";
import type { WindowOb } from "../../types";

/**
 * Хелпер для фокуса окна по клику.
 *
 * @param windowOb - Объект окна
 * @returns focusWindow — функция для фокуса этого окна
 */
export const useFocusOnClick = (windowOb: WindowOb) => {
	const focusStore = useFocusStore();

	const focusWindow = () => {
		focusStore.focus(windowOb.id);
	};

	return { focusWindow };
};
