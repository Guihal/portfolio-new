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
			// SSR положил content в Nuxt payload (ключ `content:<path>`).
			// Дефолтный getCachedData читает payload только пока идёт
			// isHydrating, а setup окна выполняется внутри Suspense после
			// основного hydration-pass → payload пропускается и клиент
			// рендерит path-fallback (hydration mismatch с SSR). Явно
			// читаем payload всегда, чтобы entity была синхронно.
			getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
		},
	);

	return {
		data: computed(() => data.value ?? null),
		pending,
		error,
		refresh,
	};
}
