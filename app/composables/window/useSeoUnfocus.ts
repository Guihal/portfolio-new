import { storeToRefs } from "pinia";
import { useFocusStore } from "~/stores/focus";

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

	const { focusedId } = storeToRefs(useFocusStore());

	useSeoMeta({
		title: () => (focusedId.value ? undefined : data.value?.name),
	});
}
