import type { MaybeRefOrGetter } from "vue";
import type { CodeSnippet } from "~~/server/utils/manifest/resolveCodeContent";

interface ParsedCodePath {
	entityPath: string;
	snippetId: string | null;
}

/**
 * Резолвит сниппет кода из виртуального пути `/projects/x/code` или
 * `/projects/x/code/<snippet-id>`. Грузит content endpoint parent-сущности
 * и выбирает нужный snippet по id (или первый по умолчанию).
 */
export function useCodeSnippet(path: MaybeRefOrGetter<string>) {
	const parsed = computed<ParsedCodePath | null>(() => {
		const p = toValue(path);
		const m = p.match(/^(.+)\/code(?:\/([\w-]+))?$/);
		if (!m) return null;
		const entityPath = m[1];
		if (!entityPath) return null;
		return { entityPath, snippetId: m[2] ?? null };
	});

	const entityPathRef = computed(() => parsed.value?.entityPath ?? "");

	const { data, error } = useFetch("/api/filesystem/content", {
		query: { path: entityPathRef },
		key: () => `content:${entityPathRef.value}`,
		server: true,
	});

	const snippet = computed<CodeSnippet | null>(() => {
		const codes = data.value?.codes;
		if (!codes || codes.length === 0) return null;
		if (!parsed.value?.snippetId) return codes[0] ?? null;
		return codes.find((c) => c.id === parsed.value?.snippetId) ?? null;
	});

	const notFound = computed(
		() =>
			parsed.value !== null && data.value !== null && snippet.value === null,
	);

	return {
		snippet,
		entity: computed(() => data.value?.entity ?? null),
		error,
		notFound,
	};
}
