import { isNavigationFailure } from "vue-router";
import { callWithNuxt } from "#app";
import { useCreateAndRegisterWindow } from "~/components/Window/composables/useCreateAndRegisterWindow";

const CANONICAL_ENTRY = "/about";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function normalizePath(p: string): string {
	return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
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

	if (isFirstVisit && !onCanonical) {
		if (import.meta.server) {
			// Cookie до navigateTo — Set-Cookie встаёт в 302 response.
			// Assumption: CANONICAL_ENTRY статический; navigateTo не throws.
			visited.value = "1";
			return await navigateTo(CANONICAL_ENTRY, { redirectCode: 302 });
		}
		// Client: router.push напрямую (queuedPush always-resolves → глотает ошибки).
		try {
			const nav = await router.push(CANONICAL_ENTRY);
			if (!isNavigationFailure(nav)) {
				visited.value = "1";
				// Source-of-truth — currentRoute отражает фактический endpoint
				// (защищает от будущих middleware-редиректов).
				effectivePath = normalizePath(router.currentRoute.value.path);
			} else {
				logger.warn("[useAppBootstrap] push navigation failure", nav);
			}
		} catch (err) {
			logger.error("[useAppBootstrap] push", err);
		}
	} else if (isFirstVisit && onCanonical) {
		visited.value = "1";
	}

	await callWithNuxt(nuxtApp, () => {
		// Per-request stateless SSR render: allWindows обнуляется каждый SSR hit.
		// На клиенте (hydration + lifecycle) — НЕ clear'ить: payload корректен.
		if (import.meta.server) {
			clearAllWindowsState();
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
}
