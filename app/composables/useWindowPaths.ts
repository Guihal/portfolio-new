import { useWindowsStore } from "~/stores/windows";

/**
 * Composable для работы с путями окон.
 * Тонкий фасад над useWindowsStore.byPath.
 */
export const useWindowPaths = () => {
	const store = useWindowsStore();

	const hasPath = (path: string): string | false =>
		store.byPath(path)?.id ?? false;

	return { hasPath };
};
