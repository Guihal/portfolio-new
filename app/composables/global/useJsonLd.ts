// JSON-LD structured data для per-window SEO. Возвращает reactive `primary`
// (Person/CreativeWork/SoftwareSourceCode) + `breadcrumbs` (BreadcrumbList).
// Подключается из useSeoWindow через useHead({ script: ... }).
//
// Тестируемость: origin принимается параметром Ref<string>, не через
// useRequestURL() — тесты могут инжектить фикстуру.

import type { FsFile } from "~~/shared/types/filesystem";

const AUTHOR = {
	"@type": "Person",
	name: "Дмитрий Стаценко",
	url: "https://github.com/Guihal",
};

function personLd(file: FsFile, origin: string) {
	return {
		"@context": "https://schema.org",
		"@type": "Person",
		name: file.name,
		jobTitle: "Fullstack-разработчик",
		description: file.description ?? file.summary,
		url: `${origin}/about`,
		sameAs: ["https://github.com/Guihal"],
		knowsAbout: file.tags ?? [],
	};
}

function creativeWorkLd(file: FsFile, origin: string) {
	return {
		"@context": "https://schema.org",
		"@type": "CreativeWork",
		name: file.name,
		description: file.description,
		keywords: file.tags?.join(", "),
		url: `${origin}${file.path}`,
		author: AUTHOR,
		dateCreated: file.year,
	};
}

const KNOWN_LANGS = new Set([
	"js",
	"ts",
	"vue",
	"py",
	"go",
	"rs",
	"cpp",
	"java",
	"php",
]);

function sourceCodeLd(file: FsFile, origin: string) {
	const langs = (file.tags ?? []).filter((t) =>
		KNOWN_LANGS.has(t.toLowerCase()),
	);
	return {
		"@context": "https://schema.org",
		"@type": "SoftwareSourceCode",
		name: file.name,
		description: file.description,
		keywords: file.tags?.join(", "),
		programmingLanguage: langs.length ? langs.join(", ") : undefined,
		url: `${origin}${file.path}`,
		author: AUTHOR,
	};
}

function breadcrumbLd(path: string, origin: string, entityName?: string) {
	const segs = path.split("/").filter(Boolean);
	const items = segs.map((seg, i) => ({
		"@type": "ListItem",
		position: i + 1,
		name: seg,
		item: `${origin}/${segs.slice(0, i + 1).join("/")}`,
	}));
	if (entityName && items.length) {
		const last = items[items.length - 1]!;
		items[items.length - 1] = { ...last, name: entityName };
	}
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items,
	};
}

export function useJsonLd(file: Ref<FsFile | null>, origin: Ref<string>) {
	const primary = computed(() => {
		if (!file.value) return null;
		const o = origin.value;
		switch (file.value.programType) {
			case "about":
				return personLd(file.value, o);
			case "project":
				return creativeWorkLd(file.value, o);
			case "code":
				return sourceCodeLd(file.value, o);
			default:
				return null;
		}
	});

	const breadcrumbs = computed(() => {
		if (!file.value) return null;
		return breadcrumbLd(file.value.path, origin.value, file.value.name);
	});

	return { primary, breadcrumbs };
}
