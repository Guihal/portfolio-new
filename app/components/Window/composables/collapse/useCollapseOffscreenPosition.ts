import { storeToRefs } from "pinia";
import { useBoundsStore } from "~/stores/bounds";
import { useContentAreaStore } from "~/stores/contentArea";
import type { WindowOb } from "../../types";

/**
 * При collapsed=true перемещает окно за пределы видимой области
 * (target.top = contentArea.height * 1.5). Реагирует на изменения contentArea
 * через useSetChainedWatchers; debounced через setTimeout для batched flush
 * с reactive system.
 *
 * Mutates: bounds.target.top.
 */
export function useCollapseOffscreenPosition(windowOb: WindowOb): void {
	const { area: contentArea } = storeToRefs(useContentAreaStore());
	const target = useBoundsStore().ensure(windowOb.id).target;

	let timer: ReturnType<typeof setTimeout> | null = null;

	useSetChainedWatchers(
		() => windowOb.states.collapsed === true,
		() => contentArea,
		() => {
			if (timer !== null) clearTimeout(timer);
			timer = setTimeout(() => {
				timer = null;
				if (windowOb.states.collapsed) {
					target.top = contentArea.value.height * 1.5;
				}
			});
		},
		{
			immediate: true,
		},
	);

	onScopeDispose(() => {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
	});
}
