// P8-XX useAppBootstrap: cookie-онбординг (302 на /about) → 404-check →
// preload entity для per-window SEO → store reset на SSR → register window.

import { isNavigationFailure } from "vue-router";
import { callWithNuxt } from "#app";
import { useCreateAndRegisterWindow } from "~/components/Window/composables/lifecycle/useCreateAndRegisterWindow";
import { useBoundsStore } from "~/stores/bounds";
import { useContentAreaStore } from "~/stores/contentArea";
import { useFocusStore } from "~/stores/focus";
import { useFrameStore } from "~/stores/frame";
import { useQueuedRouterStore } from "~/stores/queuedRouter";
import { useWindowsStore } from "~/stores/windows";
import { useWindowsUIStore } from "~/stores/windowsUI";
import type { FsFile } from "~~/shared/types/filesystem";

const CANONICAL_ENTRY = "/about";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// Token-based UA sniff: exact-match по бот-токенам. Избегает false-positives
// "notgooglebot" / "googlebot-fake". Содержит основных crawler'ов + шеринг
// ботов. Расширяется по мере появления новых.
const CRAWLER_BOTS = new Set([
	"googlebot",
	"bingbot",
	"yandex",
	"duckduckbot",
	"applebot",
	"facebookexternalhit",
	"twitterbot",
	"linkedinbot",
	"slurp",
	"baiduspider",
	"ahrefsbot",
	"semrushbot",
]);

function isCrawler(userAgent: string): boolean {
	if (!userAgent) return false;
	const tokens = userAgent.toLowerCase().split(/[\s/;()[\],]+/);
	return tokens.some((t) => CRAWLER_BOTS.has(t));
}

function normalizePath(p: string): string {
	return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

// Heuristic: path содержит точку → статика (asset с расширением: .png, .svg,
// .js, .css, .jpg, .webp, .mp3, .woff2, .json). Программные entity-пути
// (типа "/about", "/projects/u24") точки не содержат. Используется чтобы
// пропустить cookie-онбординг и 404-check на статических asset-запросах.
function isAssetPath(p: string): boolean {
	return p.includes(".");
}

async function assertPathExists(path: string): Promise<void> {
	const exists = await $fetch<FsFile | null>("/api/filesystem/get", {
		query: { path },
	}).catch(() => null);
	if (!exists) {
		throw createError({
			statusCode: 404,
			statusMessage: "Not Found",
			fatal: true,
		});
	}
}

async function preloadWindowEntity(path: string): Promise<void> {
	// Синхронно подгружаем entity до useSeoWindow (иначе file=null на SSR →
	// title/description идут через path-fallback: "about" вместо
	// "Информация о системе — Обо мне"). Только SSR: на client модуль не
	// загружается, иначе server-side scanTree через process.cwd() валил бы
	// client bundle.
	if (!import.meta.server) return;
	const windowOb = useWindowsStore().byPath(path);
	if (!windowOb) return;
	const file = await $fetch<FsFile | null>("/api/filesystem/get", {
		query: { path },
	}).catch(() => null);
	if (file) windowOb.file = file;
}

export async function useAppBootstrap() {
	const nuxtApp = useNuxtApp();
	const route = useRoute();
	const router = useRouter();
	const visited = useCookie("about_visited", { maxAge: COOKIE_MAX_AGE });

	const isFirstVisit = !visited.value;
	const currentPath = normalizePath(route.path);
	const onCanonical = currentPath === CANONICAL_ENTRY;

	let effectivePath = currentPath;

	// Строгий guard для asset-URL (/og/default.png, /_nuxt/foo.js, /favicon.svg,
	// /imgs/me.jpg): никакого cookie, никакого 404-check, никакого register.
	// Asset-пути — это не entity, не программа. Если asset не существует, Nitro
	// сам отдаст 404. Выставление cookie здесь сломало бы онбординг: бот или
	// юзер, начавший сессию с asset-URL, потерял бы 302 на /about.
	if (isAssetPath(currentPath)) return;

	if (isFirstVisit && !onCanonical) {
		const ua = import.meta.server ? (useRequestHeader("user-agent") ?? "") : "";
		if (isCrawler(ua)) {
			// Crawler / share-bot: cookie молча, render в target (НЕ редирект).
			// Googlebot должен видеть SSR-контент /projects/u24 иначе он
			// проиндексирует только /about (redirect target), а sitemap
			// публикует /projects/u24 как самостоятельный URL — конфликт.
			visited.value = "1";
			// effectivePath остаётся currentPath.
		} else if (import.meta.server) {
			visited.value = "1";
			return await navigateTo(CANONICAL_ENTRY, { redirectCode: 302 });
		} else {
			try {
				const nav = await router.push(CANONICAL_ENTRY);
				if (!isNavigationFailure(nav)) {
					visited.value = "1";
					effectivePath = normalizePath(router.currentRoute.value.path);
				} else {
					logger.warn("[useAppBootstrap] push navigation failure", nav);
				}
			} catch (err) {
				logger.error("[useAppBootstrap] push", err);
			}
		}
	} else if (isFirstVisit && onCanonical) {
		visited.value = "1";
	}

	if (
		import.meta.server &&
		effectivePath !== "/" &&
		!isAssetPath(effectivePath)
	) {
		await assertPathExists(effectivePath);
	}

	await callWithNuxt(nuxtApp, () => {
		if (import.meta.server) {
			useWindowsStore().$reset();
			useBoundsStore().$reset();
			useFocusStore().$reset();
			useFrameStore().$reset();
			useContentAreaStore().$reset();
			useQueuedRouterStore().$reset();
			useWindowsUIStore().$reset();
		}
		if (effectivePath !== "/") {
			try {
				useCreateAndRegisterWindow(effectivePath);
			} catch (err) {
				logger.error("[useAppBootstrap] register", {
					target: effectivePath,
					err,
				});
			}
		}
	});

	// Preload entity AFTER register+reset. $reset стирает windows, поэтому
	// register должен быть внутри callWithNuxt; scanTree async — выносим await
	// за пределы callback (callback не async).
	if (import.meta.server && effectivePath !== "/") {
		await preloadWindowEntity(effectivePath);
	}
}
