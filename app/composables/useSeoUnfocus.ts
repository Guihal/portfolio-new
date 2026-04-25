export function useSeoUnfocus() {
	const { data } = useAsyncData(
		"entity-/",
		async () => {
			try {
				return await $fetch("/api/filesystem/get", {
					query: { path: "/" },
				});
			} catch (err) {
				logger.error("[useSeoUnfocus]", err);
			}
		},
		{ immediate: true, server: true },
	);

	const focusedWindowId = useFocusedWindowId();

	useSeoMeta({
		title: () => (focusedWindowId.value ? undefined : data.value?.name),
	});
}
