import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useContentAreaStore } from "~/stores/contentArea";
import { type WindowOb, WindowObKey, WindowRouteKey } from "../types";
import { useFetchEntity } from "./useFetchEntity";
import { useFocusOnClick } from "./useFocusOnClick";
import { useFrameObserverLifecycle } from "./useFrameObserverLifecycle";
import { useFullscreenOnMount } from "./useFullscreenOnMount";
import { useLoadingStateSync } from "./useLoadingStateSync";
import { useOnFullscreen } from "./useOnFullScreen";
import { useSeoWindow } from "./useSeoWindow";
import { useSetFocusState } from "./useSetFocusState";
import { useWindowBoundsAnimation } from "./useWindowBoundsAnimation";
import { useWindowFullscreenAutoSet } from "./useWindowFullscreenAutoSet";
import { useWindowLoading } from "./useWindowLoading";
import { useWindowRoute } from "./useWindowRoute";

/**
 * Фасад жизненного цикла окна. Группирует все per-window composable'ы +
 * provide'ы. Вызывается один раз из `Window/index.vue`.
 */
export async function useWindow(windowOb: WindowOb) {
	const windowRoute = useWindowRoute(windowOb);
	provide(WindowRouteKey, windowRoute);
	provide(WindowObKey, windowOb);

	useSetFocusState(windowOb);
	const { focusWindow } = useFocusOnClick(windowOb);

	const { area: contentArea } = storeToRefs(useContentAreaStore());
	const { isMounted } = useFullscreenOnMount(windowOb);
	useSetChainedWatchers(
		() => windowOb.states.fullscreen === true,
		contentArea,
		() => useOnFullscreen(windowOb, !isMounted.value),
		{ immediate: true },
	);
	useWindowFullscreenAutoSet(windowOb);

	const { getIsLoading, initWindowLoading } = useWindowLoading();
	const isLoading = getIsLoading(windowOb.id);
	initWindowLoading(windowOb.id);
	useLoadingStateSync(windowOb, isLoading);

	useSeoWindow(windowOb);

	const node = ref<HTMLElement | null>(null);
	useWindowBoundsAnimation(windowOb, node);

	useFrameObserverLifecycle(windowOb, focusWindow);

	await useFetchEntity(windowOb, windowRoute);

	return { node, windowRoute, isLoading, focusWindow };
}
