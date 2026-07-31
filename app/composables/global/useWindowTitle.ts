// Расширенный useWindowTitle: возвращает не только title, но и SEO-мета для
// per-page useSeoMeta. Fallback chain гарантирует непустой description:
// entity.description → entity.summary → program.seo.defaultDescription → FALLBACK.

import { getProgram } from "~/programs";

const FALLBACK_DESCRIPTION =
	"Портфолио Дмитрия Стаценко — fullstack-разработчик. Nuxt, Vue, TypeScript.";

const OG_TYPE: Record<string, "profile" | "article"> = {
	about: "profile",
};

export function useWindowTitle(file: Ref<FsFile | null>) {
	const program = computed(() =>
		file.value ? getProgram(file.value.programType) : null,
	);

	const label = computed(() => program.value?.label ?? "");
	const name = computed(() => file.value?.name ?? "");

	const title = computed(() =>
		[label.value, name.value].filter(Boolean).join(" — "),
	);

	const description = computed(() => {
		if (!file.value) return FALLBACK_DESCRIPTION;
		return (
			file.value.description ??
			file.value.summary ??
			program.value?.seo.defaultDescription ??
			FALLBACK_DESCRIPTION
		);
	});

	const ogType = computed(() => {
		if (!file.value) return "article" as const;
		return OG_TYPE[file.value.programType] ?? ("article" as const);
	});

	const ogImage = computed(
		() => program.value?.seo.defaultOgImage ?? "/og/default.png",
	);

	return { label, name, title, description, ogType, ogImage };
}
