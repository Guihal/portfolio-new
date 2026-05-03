import { inject } from "vue";
import { type WindowOb, WindowObKey } from "../../types";

/**
 * Type-safe inject для WindowOb. Бросает если используется вне Window/index.vue
 * tree (где `useWindow()` делает provide(WindowObKey, ...)).
 */
export function useInjectWindow(): WindowOb {
	const w = inject(WindowObKey);
	if (!w) {
		throw new Error(
			"useInjectWindow(): WindowOb not provided. Must be used within Window/index.vue tree.",
		);
	}
	return w;
}
