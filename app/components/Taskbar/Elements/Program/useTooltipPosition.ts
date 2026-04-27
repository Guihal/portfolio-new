// P8-17: positioning state для taskbar tooltip. Измеряет sizes через
// ResizeObserver, делегирует pure-вычисление services/tooltipState.

import { storeToRefs } from "pinia";
import { computed, type MaybeRefOrGetter, ref, toValue } from "vue";
import { useResizeObserver } from "~/composables/window/useResizeObserver";
import { positionTooltip } from "~/services/tooltipState";
import { useContentAreaStore } from "~/stores/contentArea";

export function useTooltipPosition(
	tooltipRef: Ref<HTMLElement | null>,
	contentRef: Ref<HTMLElement | null>,
	containerBounds: MaybeRefOrGetter<DOMRect | null>,
) {
	const tooltipBounds = ref<DOMRect | null>(null);
	const contentBounds = ref<DOMRect | null>(null);

	useResizeObserver(tooltipRef, () => {
		if (tooltipRef.value)
			tooltipBounds.value = tooltipRef.value.getBoundingClientRect();
	});
	useResizeObserver(contentRef, () => {
		if (contentRef.value)
			contentBounds.value = contentRef.value.getBoundingClientRect();
	});

	const { area: contentArea } = storeToRefs(useContentAreaStore());

	const position = computed(() =>
		positionTooltip({
			target: toValue(containerBounds),
			tooltip: tooltipBounds.value,
			viewportWidth: contentArea.value.width,
		}),
	);

	return {
		top: computed(() => position.value.top),
		left: computed(() => position.value.left),
		contentBounds,
		maxWidth: computed(() => contentArea.value.width),
	};
}
