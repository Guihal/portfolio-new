// P8-05 — fetch wrapper для project program. Тянет content (images + entity)
// через /api/filesystem/content. RULES.md §5: useFetch в composable, не $fetch.

import type { MaybeRefOrGetter } from "vue";

export function useProjectData(path: MaybeRefOrGetter<string>) {
	const resolvedPath = toRef(() => toValue(path));

	const { data, pending, error, refresh } = useFetch(
		"/api/filesystem/content",
		{
			query: { path: resolvedPath },
			key: () => `content:${toValue(path)}`,
			server: true,
		},
	);

	return {
		data: computed(() => data.value ?? null),
		pending,
		error,
		refresh,
	};
}
