import type { WindowOb } from "../types";

export function useSeoWindow(windowOb: WindowOb) {
	const { title } = useWindowTitle(computed(() => windowOb.file));

	const { cleanAll } = useSetChainedWatchers(
		() => windowOb.states.focused === true,
		() => windowOb.file,
		() => {
			if (!windowOb.file) return;
			useSeoMeta({
				title: title,
			});
		},
		{
			immediate: true,
		},
	);

	onBeforeUnmount(cleanAll);
}
