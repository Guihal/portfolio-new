// useAppBootstrap: 404-check → preload entity для per-window SEO → store reset
// на SSR → register window.
//
// Раньше здесь был cookie-онбординг с 302 на /about при первом заходе. Удалён:
// юзер остаётся на URL, на который пришёл (включая /, который рендерит
// workbench без окон). Документация по старому механизму —
// docs/refactor/P1-02-fix-onboarding-flow.md (историческая).

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

function normalizePath(p: string): string {
	return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

// Heuristic: path содержит точку → статика (asset с расширением: .png, .svg,
// .js, .css, .jpg, .avif, .mp3, .woff2, .json). Программные entity-пути
// (типа "/about", "/projects/u24") точки не содержат. Используется чтобы
// пропустить 404-check и register на статических asset-запросах.
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
	// title/description идут через path-fallback). Только SSR: на client модуль
	// не загружается, иначе server-side scanTree через process.cwd() валил бы
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
	const effectivePath = normalizePath(route.path);

	// Asset-URL (/og/default.png, /_nuxt/foo.js, /favicon.svg, /imgs/me.jpg):
	// никакого 404-check, никакого register. Asset-пути — это не entity,
	// не программа. Если asset не существует, Nitro сам отдаст 404.
	if (isAssetPath(effectivePath)) return;

	if (import.meta.server && effectivePath !== "/") {
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
