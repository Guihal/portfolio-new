import { onMounted, onScopeDispose, ref } from "vue";
import { useWindowsStore } from "~/stores/windows";
import type { WindowOb } from "../types";

/**
 * On mount: ставит state.fullscreen=true, чистит fullscreen-ready,
 * через 100ms помечает isMounted=true. Возвращает isMounted ref —
 * нужен parent useSetChainedWatchers, чтобы знать «первое срабатывание
 * после mount» vs «последующие изменения contentArea».
 */
export function useFullscreenOnMount(windowOb: WindowOb): {
	isMounted: { readonly value: boolean };
} {
	const windowsStore = useWindowsStore();
	const isMounted = ref(false);
	let mountedTimer: ReturnType<typeof setTimeout> | null = null;

	onMounted(() => {
		windowsStore.setState(windowOb.id, "fullscreen", true);
		windowsStore.clearState(windowOb.id, "fullscreen-ready");
		mountedTimer = setTimeout(() => {
			mountedTimer = null;
			isMounted.value = true;
		}, 100);
	});
	onScopeDispose(() => {
		if (mountedTimer !== null) {
			clearTimeout(mountedTimer);
			mountedTimer = null;
		}
	});

	return { isMounted };
}
