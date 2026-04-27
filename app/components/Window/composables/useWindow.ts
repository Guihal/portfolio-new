import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useContentAreaStore } from "~/stores/contentArea";
import { type WindowOb, WindowObKey, WindowRouteKey } from "../types";
import { useWindowBoundsAnimation } from "./anim/useWindowBoundsAnimation";
import { useFetchEntity } from "./fetch/useFetchEntity";
import { useLoadingStateSync } from "./fetch/useLoadingStateSync";
import { useFocusOnClick } from "./focus/useFocusOnClick";
import { useSetFocusState } from "./focus/useSetFocusState";
import { useFullscreenOnMount } from "./fullscreen/useFullscreenOnMount";
import { useOnFullscreen } from "./fullscreen/useOnFullScreen";
import { useWindowFullscreenAutoSet } from "./fullscreen/useWindowFullscreenAutoSet";
import { useFrameObserverLifecycle } from "./lifecycle/useFrameObserverLifecycle";
import { useWindowLoading } from "./route/useWindowLoading";
import { useWindowRoute } from "./route/useWindowRoute";
import { useSeoWindow } from "./seo/useSeoWindow";

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
