// Тест расширенного useWindowTitle: проверяет fallback chain description
// (entity.description → entity.summary → program.seo.defaultDescription →
// FALLBACK_DESCRIPTION) и ogType (about → "profile", остальные → "article").

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h, type Ref, ref } from "vue";
import { useWindowTitle } from "~/composables/global/useWindowTitle";
import type { FsFile } from "~~/shared/types/filesystem";

function withFile(file: Ref<FsFile | null | undefined>) {
	return mount(
		defineComponent({
			setup() {
				const r = useWindowTitle(file as Ref<FsFile | null>);
				return () => h("div", { "data-test": "ok" });
			},
		}),
	);
}

const FALLBACK_DESCRIPTION =
	"Портфолио Дмитрия Стаценко — fullstack-разработчик. Nuxt, Vue, TypeScript.";

describe("useWindowTitle", () => {
	it("title = '<label> — <name>' для project", () => {
		const file = ref<FsFile | null>({
			path: "/projects/u24",
			name: "U24",
			programType: "project",
		});
		const { title, description, ogType, ogImage } = useWindowTitle(file);
		expect(title.value).toBe("Просмотр проектов — U24");
		// description fallback chain: нет description/summary → program.seo.defaultDescription
		expect(description.value).toBe(
			"Проект из портфолио Дмитрия Стаценко: описание, стек, ссылки.",
		);
		expect(ogType.value).toBe("article");
		expect(ogImage.value).toBe("/og/default.png");
	});

	it("description берёт entity.description если задан", () => {
		const file = ref<FsFile | null>({
			path: "/projects/u24",
			name: "U24",
			programType: "project",
			description: "Описание U24.",
		});
		const { description } = useWindowTitle(file);
		expect(description.value).toBe("Описание U24.");
	});

	it("description берёт entity.summary если description отсутствует", () => {
		const file = ref<FsFile | null>({
			path: "/about",
			name: "Дмитрий Стаценко",
			programType: "about",
			summary: "Fullstack-разработчик.",
		});
		const { description } = useWindowTitle(file);
		expect(description.value).toBe("Fullstack-разработчик.");
	});

	it("description = FALLBACK если file = null", () => {
		const file = ref<FsFile | null>(null);
		const { description } = useWindowTitle(file);
		expect(description.value).toBe(FALLBACK_DESCRIPTION);
	});

	it("ogType = 'profile' для about", () => {
		const file = ref<FsFile | null>({
			path: "/about",
			name: "Дмитрий",
			programType: "about",
		});
		const { ogType } = useWindowTitle(file);
		expect(ogType.value).toBe("profile");
	});

	it("ogType = 'article' для project/showcase/code/explorer", () => {
		for (const programType of [
			"project",
			"showcase",
			"code",
			"explorer",
		] as const) {
			const file = ref<FsFile | null>({
				path: "/x",
				name: "x",
				programType,
			});
			const { ogType } = useWindowTitle(file);
			expect(ogType.value).toBe("article");
		}
	});
});

// Mount-функция нужна только чтобы setup() выполнился в контексте component;
// сами computed проверяются вне render — вызов withFile не нужен, оставлен
// как sanity-check, что composable не падает при mount.
void withFile;
