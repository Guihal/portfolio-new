import { useQueuedRouterStore } from "~/stores/queuedRouter";
import { useWindowsStore } from "~/stores/windows";
import type { WindowOb } from "../types";

/**
 * Двухсторонняя синхронизация пути окна с URL (только когда окно focused).
 *
 * Без флагов / debounce: oscillation предотвращается early-return guard'ами
 * на обоих watcher'ах (newPath === current → skip), плюс queuedRouter сам
 * dedup'ит push'ы.
 */
export function useWindowRoute(windowOb: WindowOb) {
	const route = useRoute();
	const queuedRouter = useQueuedRouterStore();
	const windowsStore = useWindowsStore();

	const windowRoute = ref(windowOb.targetFile.value);

	// Window → URL.
	watch(
		[() => windowOb.targetFile.value, () => windowOb.states.focused],
		([newPath, focused]) => {
			if (!newPath) return;
			if (windowRoute.value !== newPath) windowRoute.value = newPath;
			if (!focused) return;
			if (route.path === newPath) return;
			queuedRouter.push(newPath);
		},
		{ immediate: true },
	);

	// URL → Window.
	watch(
		() => route.path,
		(newPath) => {
			if (!windowOb.states.focused || !newPath) return;
			if (newPath === windowOb.targetFile.value) return;
			windowsStore.setTargetFile(windowOb.id, newPath);
		},
	);

	return readonly(windowRoute);
}
