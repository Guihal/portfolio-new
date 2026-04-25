import type { WindowOb } from "../types";

/**
 * Хелпер для фокуса окна по клику.
 *
 * @param windowOb - Объект окна
 * @returns focusWindow — функция для фокуса этого окна
 */
export const useFocusOnClick = (windowOb: WindowOb) => {
	const { focus } = useFocusWindowController();

	const focusWindow = () => {
		focus(windowOb.id);
	};

	return { focusWindow };
};
