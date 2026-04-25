import { useQueuedRouterStore } from "~/stores/queuedRouter";
import type { WindowOb } from "../types";
import { debounce } from "../utils/debounce";

export function useWindowRoute(windowOb: WindowOb) {
	const route = useRoute();
	const queuedRouter = useQueuedRouterStore();

	const windowRoute = ref(windowOb.targetFile.value);
	const syncSource = ref<"route" | "window" | "idle">("idle");

	// Window → URL. Слияние прошлых двух watcher-ов (targetFile + focused):
	// cb триггерится при смене любого из [targetFile, focused] и покрывает
	// и смену пути окна, и получение фокуса.
	watch(
		[() => windowOb.targetFile.value, () => windowOb.states.focused],
		([newPath, focused]) => {
			if (syncSource.value === "route" || !newPath) return;
			windowRoute.value = newPath;
			if (!focused || route.path === newPath) return;
			syncSource.value = "window";
			queuedRouter.push(newPath).finally(() => {
				if (syncSource.value === "window") syncSource.value = "idle";
			});
		},
		{ immediate: true },
	);

	// URL → Window.
	watch(
		() => route.path,
		debounce((newPath: string) => {
			if (syncSource.value === "window") {
				syncSource.value = "idle";
				return;
			}
			if (!windowOb.states.focused || !newPath || newPath === windowRoute.value)
				return;
			syncSource.value = "route";
			windowRoute.value = newPath;
			windowOb.targetFile.value = newPath;
			syncSource.value = "idle";
		}, 16),
	);

	return readonly(windowRoute);
}
