import { storeToRefs } from "pinia";
import { useContentAreaStore } from "~/stores/contentArea";
import { useWindowsStore } from "~/stores/windows";
import type { WindowOb } from "../types";
import { useOnFullscreen } from "./useOnFullScreen";

/**
 * Устанавливает fullscreen при монтировании окна.
 *
 * Логика:
 * 1. При монтировании — сразу включает fullscreen
 * 2. После монтирования — следит за changes contentArea и обновляет fullscreen
 *
 * @param windowOb - Объект окна
 */
export function useSetFullscreenObserver(windowOb: WindowOb) {
	const { area: contentArea } = storeToRefs(useContentAreaStore());
	const windowsStore = useWindowsStore();

	// Флаг: окно ещё не смонтировано (для принудительной установки fullscreen)
	let isMounted = false;

	// Chained watcher: при изменении contentArea обновляет fullscreen размеры
	useSetChainedWatchers(
		() => windowOb.states.fullscreen === true,
		contentArea,
		() => {
			useOnFullscreen(windowOb, !isMounted);
		},
		{
			immediate: true,
		},
	);

	let mountedTimer: ReturnType<typeof setTimeout> | null = null;

	onMounted(() => {
		// Принудительно включаем fullscreen при монтировании
		windowsStore.setState(windowOb.id, "fullscreen", true);
		windowsStore.clearState(windowOb.id, "fullscreen-ready");

		// Через 100ms помечаем как смонтированное
		mountedTimer = setTimeout(() => {
			mountedTimer = null;
			isMounted = true;
		}, 100);
	});

	onScopeDispose(() => {
		if (mountedTimer !== null) {
			clearTimeout(mountedTimer);
			mountedTimer = null;
		}
	});
}
