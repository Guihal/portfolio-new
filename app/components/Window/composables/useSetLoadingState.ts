import { useWindowsStore } from "~/stores/windows";
import type { WindowOb } from "../types";

export function useSetLoadingState(
	windowOb: WindowOb,
	isLoading: Ref<boolean>,
) {
	const windowsStore = useWindowsStore();
	watch(
		isLoading,
		() => {
			windowsStore.setState(windowOb.id, "loading", isLoading.value);
		},
		{
			immediate: true,
		},
	);
}
