import type { MaybeRefOrGetter } from "vue";

interface ParsedImagePath {
	entityPath: string;
	filename: string;
}

/**
 * Резолвит изображение из виртуального пути `/projects/x/image.png`.
 * Грузит content endpoint parent-сущности и выбирает нужный image URL.
 */
export function useShowcaseImage(path: MaybeRefOrGetter<string>) {
	const parsed = computed<ParsedImagePath | null>(() => {
		const p = toValue(path);
		const m = p.match(/^(.*)\/([\w._-]+\.(?:png|jpg|jpeg|webp|svg))$/i);
		if (!m) return null;
		const entityPath = m[1];
		const filename = m[2];
		if (!entityPath || !filename) return null;
		return { entityPath, filename };
	});

	const entityPathRef = computed(() => parsed.value?.entityPath ?? "");

	const { data } = useFetch("/api/filesystem/content", {
		query: { path: entityPathRef },
		key: () => `content:${entityPathRef.value}`,
		server: true,
	});

	const imageUrl = computed<string | null>(() => {
		const images = data.value?.images;
		if (!images || !parsed.value) return null;
		const filename = parsed.value.filename;
		return images.find((u) => u.endsWith(`/${filename}`)) ?? null;
	});

	return {
		imageUrl,
		entity: computed(() => data.value?.entity ?? null),
	};
}
