import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useJsonLd } from "~/composables/global/useJsonLd";
import type { FsFile } from "~~/shared/types/filesystem";

const ORIGIN = ref("https://example.com");

function makeFile(over: Partial<FsFile> = {}): FsFile {
	return { name: "X", programType: "explorer", path: "/x", ...over };
}

describe("useJsonLd", () => {
	it("about → Person", () => {
		const f = ref<FsFile | null>(
			makeFile({ name: "Обо мне", programType: "about", tags: ["vue"] }),
		);
		const { primary } = useJsonLd(f, ORIGIN);
		expect(primary.value).toMatchObject({
			"@type": "Person",
			name: "Обо мне",
			knowsAbout: ["vue"],
			url: "https://example.com/about",
		});
	});

	it("project → CreativeWork", () => {
		const f = ref<FsFile | null>(
			makeFile({
				name: "U24",
				programType: "project",
				path: "/projects/u24",
				tags: ["vue", "ts"],
			}),
		);
		const { primary } = useJsonLd(f, ORIGIN);
		expect(primary.value).toMatchObject({
			"@type": "CreativeWork",
			name: "U24",
			url: "https://example.com/projects/u24",
			keywords: "vue, ts",
		});
	});

	it("code → SoftwareSourceCode с programmingLanguage", () => {
		const f = ref<FsFile | null>(
			makeFile({
				name: "useFoo",
				programType: "code",
				path: "/x/code/foo",
				tags: ["ts", "vue"],
			}),
		);
		const { primary } = useJsonLd(f, ORIGIN);
		expect(primary.value?.["@type"]).toBe("SoftwareSourceCode");
		expect(primary.value?.programmingLanguage).toBe("ts, vue");
	});

	it("code без known langs → programmingLanguage undefined", () => {
		const f = ref<FsFile | null>(
			makeFile({
				name: "useFoo",
				programType: "code",
				path: "/x/code/foo",
				tags: ["frontend"],
			}),
		);
		const { primary } = useJsonLd(f, ORIGIN);
		expect(primary.value?.programmingLanguage).toBeUndefined();
	});

	it("explorer → null (нет schema)", () => {
		const f = ref<FsFile | null>(makeFile({ name: "X", programType: "explorer" }));
		const { primary } = useJsonLd(f, ORIGIN);
		expect(primary.value).toBeNull();
	});

	it("showcase → null (нет schema)", () => {
		const f = ref<FsFile | null>(makeFile({ name: "X", programType: "showcase" }));
		const { primary } = useJsonLd(f, ORIGIN);
		expect(primary.value).toBeNull();
	});

	it("null file → null schema + null breadcrumbs", () => {
		const f = ref<FsFile | null>(null);
		const { primary, breadcrumbs } = useJsonLd(f, ORIGIN);
		expect(primary.value).toBeNull();
		expect(breadcrumbs.value).toBeNull();
	});

	it("breadcrumbs → list с entityName в последнем item", () => {
		const f = ref<FsFile | null>(
			makeFile({ name: "U24", programType: "project", path: "/projects/u24" }),
		);
		const { breadcrumbs } = useJsonLd(f, ORIGIN);
		expect(breadcrumbs.value).toMatchObject({ "@type": "BreadcrumbList" });
		const items = (
			breadcrumbs.value as { itemListElement: { position: number; name: string }[] }
		).itemListElement;
		expect(items.at(-1)?.name).toBe("U24");
		expect(items).toHaveLength(2);
		expect(items[0]?.name).toBe("projects");
	});

	it("breadcrumbs для /about → 1 item", () => {
		const f = ref<FsFile | null>(
			makeFile({ name: "Обо мне", programType: "about", path: "/about" }),
		);
		const { breadcrumbs } = useJsonLd(f, ORIGIN);
		const items = (
			breadcrumbs.value as { itemListElement: { position: number; name: string }[] }
		).itemListElement;
		expect(items).toHaveLength(1);
		expect(items[0]?.name).toBe("Обо мне");
		expect(items[0]?.item).toBe("https://example.com/about");
	});
});
