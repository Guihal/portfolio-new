import { storeToRefs } from "pinia";
import { useQueuedRouter } from "~/composables/useQueuedRouter";
import { useContentAreaStore } from "~/stores/contentArea";
import { useFocusStore } from "~/stores/focus";
import { useFrameStore } from "~/stores/frame";
import { useWindowsStore } from "~/stores/windows";
import type { WindowOb } from "../types";
import { useFetchEntity } from "./useFetchEntity";
import { useFocusOnClick } from "./useFocusOnClick";
import { useOnFullscreen } from "./useOnFullScreen";
import { useSeoWindow } from "./useSeoWindow";
import { useSetFocusState } from "./useSetFocusState";
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
 *  - states:          inline fullscreen-on-mount + useWindowFullscreenAutoSet
 *  - loading:         useWindowLoading + inline loading-state watch
 *  - seo:             useSeoWindow
 *  - bounds-anim:     useWindowBoundsAnimation
 *  - preview/frames:  frameStore observer (mount/unmount)
 *  - entity:          useFetchEntity (await)
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
	const { queuedPush } = useQueuedRouter();
	const unFocus = () => {
		focusStore.unFocus();
		queuedPush("/");
	};

	// states (fullscreen) — inline ex-useSetFullscreenObserver
	const windowsStore = useWindowsStore();
	const { area: contentArea } = storeToRefs(useContentAreaStore());
	let isMounted = false;

	useSetChainedWatchers(
		() => windowOb.states.fullscreen === true,
		contentArea,
		() => {
			useOnFullscreen(windowOb, !isMounted);
		},
		{ immediate: true },
	);

	let mountedTimer: ReturnType<typeof setTimeout> | null = null;
	onMounted(() => {
		windowsStore.setState(windowOb.id, "fullscreen", true);
		windowsStore.clearState(windowOb.id, "fullscreen-ready");
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

	useWindowFullscreenAutoSet(windowOb);

	// loading
	const { getIsLoading, initWindowLoading } = useWindowLoading();
	const isLoading = getIsLoading(windowOb.id);
	initWindowLoading(windowOb.id);
	// inline ex-useSetLoadingState
	watch(
		isLoading,
		() => {
			windowsStore.setState(windowOb.id, "loading", isLoading.value);
		},
		{ immediate: true },
	);

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
	await useFetchEntity(windowOb, windowRoute);

	return {
		node,
		windowRoute,
		isLoading,
		focusWindow,
		unFocus,
	};
}
