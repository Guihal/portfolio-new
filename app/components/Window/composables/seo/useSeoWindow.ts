// Per-window SEO: на focused=true пишет title/description/og/twitter/canonical
// + JSON-LD (Person/CreativeWork/SoftwareSourceCode + BreadcrumbList) в head.
// На focused=false и onBeforeUnmount — сбрасывает всё в undefined/[], чтобы
// предыдущее окно не оставляло свои теги (multi-window race fix).
//
// Работает даже когда windowOb.file === null (на SSR fetchEntity ещё не
// зарезолвился): title/description берутся из program (по programType) +
// последнего сегмента targetFile.path. Когда file приходит — applySeo
// перезапускается через watcher и перезаписывает полными данными.

import { useJsonLd } from "~/composables/global/useJsonLd";
import { getProgram } from "~/programs";
import { ogSlug } from "~/utils/ogSlug";
import { SEO_SUFFIX } from "~/utils/seo";
import type { WindowOb } from "../../types";

const FALLBACK_DESCRIPTION =
	"Портфолио Дмитрия Стаценко — fullstack-разработчик. Nuxt, Vue, TypeScript.";

function nameFromPath(path: string): string {
	const segs = path.split("/").filter(Boolean);
	return segs[segs.length - 1] ?? path;
}

export function useSeoWindow(windowOb: WindowOb) {
	const url = useRequestURL();
	const canonical = computed(() => `${url.origin}${url.pathname}`);
	const ogImageUrl = computed(
		() => `${url.origin}/og/${ogSlug(windowOb.targetFile.value)}.png`,
	);

	const { primary: jsonLdPrimary, breadcrumbs: jsonLdBreadcrumbs } = useJsonLd(
		computed(() => windowOb.file),
		computed(() => url.origin),
	);

	function applySeo() {
		if (!windowOb.states.focused) return;
		const file = windowOb.file;
		const program = file ? getProgram(file.programType) : null;
		const name = file?.name ?? nameFromPath(windowOb.targetFile.value);
		// SEO-title: "{name} — Дмитрий Стаценко, fullstack-разработчик".
		// label ("Проводник", "Информация о системе") остаётся в UI-заголовках
		// (useWindowTitle) — в title он уводит длину за ~60 и прячет ключевые слова.
		const title = [name, SEO_SUFFIX].filter(Boolean).join(" — ") || "Портфолио";
		const description =
			file?.description ??
			file?.summary ??
			program?.seo.defaultDescription ??
			FALLBACK_DESCRIPTION;
		const ogType = file?.programType === "about" ? "profile" : "article";

		useSeoMeta({
			title,
			description,
			ogTitle: title,
			ogDescription: description,
			ogType,
			ogImage: ogImageUrl.value,
			ogUrl: url.href,
			twitterCard: "summary_large_image",
			twitterTitle: title,
			twitterDescription: description,
			themeColor: "#151515",
			robots: "index, follow",
		});
		useHead({ link: [{ rel: "canonical", href: canonical.value }] });

		// JSON-LD: Person/CreativeWork/SoftwareSourceCode + BreadcrumbList.
		// Unhead v2 JsonLdScript: type='application/ld+json' + textContent.
		const scripts: Array<{
			type: "application/ld+json";
			textContent: Record<string, unknown>;
		}> = [];
		if (jsonLdPrimary.value)
			scripts.push({
				type: "application/ld+json",
				textContent: jsonLdPrimary.value,
			});
		if (jsonLdBreadcrumbs.value)
			scripts.push({
				type: "application/ld+json",
				textContent: jsonLdBreadcrumbs.value,
			});
		useHead({ script: scripts });
	}

	function clearSeo() {
		useSeoMeta({
			title: undefined,
			description: undefined,
			ogTitle: undefined,
			ogDescription: undefined,
			ogType: undefined,
			ogImage: undefined,
			ogUrl: undefined,
			twitterCard: undefined,
			twitterTitle: undefined,
			twitterDescription: undefined,
			themeColor: undefined,
			robots: undefined,
		});
		useHead({ link: [{ rel: "canonical", href: undefined }] });
		// Снимаем JSON-LD на focused=false / unmount.
		useHead({ script: [] });
	}

	// Реактивно пересчитываем SEO на любое изменение file/focus.
	const { cleanAll } = useSetChainedWatchers(
		() => windowOb.states.focused === true,
		() => windowOb.file,
		applySeo,
		{ immediate: true },
		(focused) => {
			if (!focused) clearSeo();
		},
	);

	onBeforeUnmount(() => {
		clearSeo();
		cleanAll();
	});
}
