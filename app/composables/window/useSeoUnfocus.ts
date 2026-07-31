// SEO для случая «ни одно окно не сфокусировано» — пишет дефолтные
// title/description/og/canonical + WebSite JSON-LD в head. На focusedId → null
// — ставит root meta; на focusedId → <id> (per-window) — useSeoWindow
// перезаписывает (per-window JSON-LD тоже).
//
// Все reactive поля (ogImage, ogType, ogUrl, JSON-LD) возвращают undefined
// при focusedId !== null, чтобы не дублировать meta с per-window.

import { storeToRefs } from "pinia";
import { useFocusStore } from "~/stores/focus";
import { ogSlug } from "~/utils/ogSlug";
import type { FsFile } from "~~/shared/types/filesystem";

const FALLBACK_TITLE = "Портфолио Дмитрия Стаценко — fullstack-разработчик";
const FALLBACK_DESCRIPTION =
	"Портфолио fullstack-разработчика Дмитрия Стаценко (Nuxt, Vue, TypeScript, Pinia, WebGL): проекты, код, контакты. Сделано в стиле десктопной ОС.";

export function useSeoUnfocus() {
	const { data } = useAsyncData(
		"entity-/",
		async () => {
			try {
				return await $fetch<FsFile>("/api/filesystem/get", {
					query: { path: "/" },
				});
			} catch (err) {
				logger.error("[useSeoUnfocus]", err);
				return null;
			}
		},
		{ immediate: true, server: true },
	);

	const { focusedId } = storeToRefs(useFocusStore());

	const url = useRequestURL();
	const canonical = computed(() => `${url.origin}/`);
	const rootOgImage = computed(() => `${url.origin}/og/${ogSlug("/")}.png`);

	const rootTitle = computed(() => {
		if (focusedId.value) return undefined;
		return data.value?.name ?? FALLBACK_TITLE;
	});

	const rootDescription = computed(() => {
		if (focusedId.value) return undefined;
		return (
			data.value?.description ?? data.value?.summary ?? FALLBACK_DESCRIPTION
		);
	});

	useSeoMeta({
		title: rootTitle,
		description: rootDescription,
		ogTitle: rootTitle,
		ogDescription: rootDescription,
		ogType: computed(() => (focusedId.value ? undefined : "website")),
		ogImage: computed(() => (focusedId.value ? undefined : rootOgImage.value)),
		ogUrl: computed(() => (focusedId.value ? undefined : canonical.value)),
		twitterCard: "summary_large_image",
		twitterTitle: rootTitle,
		twitterDescription: rootDescription,
	});

	useHead({
		link: [
			{
				rel: "canonical",
				href: computed(() => (focusedId.value ? undefined : canonical.value)),
			},
		],
	});

	// WebSite JSON-LD — только когда фокус-null. На focused окне useSeoWindow
	// пишет per-window JSON-LD, чтобы не было двух schema-блоков в head.
	const rootWebSite = computed(() => {
		if (focusedId.value) return null;
		return {
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: "Dimonya OS",
			url: url.origin,
			inLanguage: "ru-RU",
			publisher: {
				"@type": "Person",
				name: "Дмитрий Стаценко",
				url: "https://github.com/Guihal",
			},
		} as Record<string, unknown>;
	});

	useHead({
		script: computed(() => {
			if (!rootWebSite.value) return [];
			return [
				{
					type: "application/ld+json" as const,
					textContent: rootWebSite.value,
				},
			];
		}),
	});
}
