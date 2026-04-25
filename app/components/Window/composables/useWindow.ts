import { useFocusStore } from "~/stores/focus";
import { useFrameStore } from "~/stores/frame";
import { useQueuedRouterStore } from "~/stores/queuedRouter";
import type { WindowOb } from "../types";
import { useWindowEntityFetcher } from "./useFetchWindowEntity";
import { useFocusOnClick } from "./useFocusOnClick";
import { useSeoWindow } from "./useSeoWindow";
import { useSetFocusState } from "./useSetFocusState";
import { useSetFullscreenObserver } from "./useSetFullscreenObserver";
import { useSetLoadingState } from "./useSetLoadingState";
import { useWindowBoundsAnimation } from "./useWindowBoundsAnimation";
import { useWindowFullscreenAutoSet } from "./useWindowFullscreenAutoSet";
import { useWindowLoading } from "./useWindowLoading";
import { useWindowRoute } from "./useWindowRoute";

/**
 * Единый фасад жизненного цикла окна. Группирует все per-window composable'ы
 * и provide'ы. Вызывается один раз из `Window/index.vue`.
 *
 * Логические группы (см. docs/refactor/P3-01):
 *  - routing:         useWindowRoute
 *  - focus:           useSetFocusState + useFocusOnClick
 *  - states:          useSetFullscreenObserver + useWindowFullscreenAutoSet
 *  - loading:         useWindowLoading + useSetLoadingState
 *  - seo:             useSeoWindow
 *  - bounds-anim:     useWindowBoundsAnimation
 *  - preview/frames:  frameStore observer (mount/unmount)
 *  - entity:          useWindowEntityFetcher (await)
 */
export async function useWindow(windowOb: WindowOb) {
	// routing
	const windowRoute = useWindowRoute(windowOb);
	provide("windowRoute", windowRoute);
	provide("windowOb", windowOb);

	// focus
	useSetFocusState(windowOb);
	const { focusWindow } = useFocusOnClick(windowOb);
	const focusStore = useFocusStore();
	const queuedRouter = useQueuedRouterStore();
	const unFocus = () => {
		focusStore.unFocus();
		queuedRouter.push("/");
	};

	// states (fullscreen)
	useSetFullscreenObserver(windowOb);
	useWindowFullscreenAutoSet(windowOb);

	// loading
	const { getIsLoading, initWindowLoading } = useWindowLoading();
	const isLoading = getIsLoading(windowOb.id);
	initWindowLoading(windowOb.id);
	useSetLoadingState(windowOb, isLoading);

	// seo
	useSeoWindow(windowOb);

	// bounds animation (RAF + CSS vars)
	const node = ref<HTMLElement | null>(null);
	useWindowBoundsAnimation(windowOb, node);

	// preview frames + initial focus
	const frameStore = useFrameStore();
	onMounted(() => {
		focusWindow();
		frameStore.createObserver(windowOb);
	});
	onUnmounted(() => {
		unFocus();
		frameStore.destroyObserver(windowOb.id);
	});

	// entity (must be last — has top-level await)
	await useWindowEntityFetcher(windowOb, windowRoute);

	return {
		node,
		windowRoute,
		isLoading,
		focusWindow,
		unFocus,
	};
}
