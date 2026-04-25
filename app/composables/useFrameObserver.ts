import type { ComputedRef } from "vue";
import type { WindowOb } from "~/components/Window/types";
import { useFrameStore } from "~/stores/frame";

export const useFrameObserver = () => {
	const store = useFrameStore();

	return {
		createObserver: (windowOb: WindowOb) => store.createObserver(windowOb),
		destroyObserver: (windowId: string) => store.destroyObserver(windowId),
		getSrc: (windowId: string): ComputedRef<string> =>
			computed(() => store.images[windowId] ?? ""),
	};
};
