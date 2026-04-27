import { inject, type Ref } from "vue";
import { WindowRouteKey } from "../../types";

/**
 * Type-safe inject для windowRoute Ref. Бросает если используется вне
 * Window/index.vue tree (где `useWindow()` делает provide(WindowRouteKey, ...)).
 */
export function useInjectWindowRoute(): Readonly<Ref<string>> {
	const r = inject(WindowRouteKey);
	if (!r) {
		throw new Error(
			"useInjectWindowRoute(): windowRoute not provided. Must be used within Window/index.vue tree.",
		);
	}
	return r;
}
