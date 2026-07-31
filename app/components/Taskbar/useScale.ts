import { storeToRefs } from "pinia";
import { useContentAreaStore } from "~/stores/contentArea";

export const MAX_SIZE = 150;

// Client-only singleton. SSR возвращает свежий stub за вызов (Tooltip скрыт v-show=false на SSR).
let scale: Ref<number> | null = null;
let scaledWidth: Ref<number> | null = null;
let scaledHeight: Ref<number> | null = null;

type ScaleTriplet = {
	scale: Ref<number>;
	scaledWidth: Ref<number>;
	scaledHeight: Ref<number>;
};

export function useScale(): ScaleTriplet {
	if (import.meta.server) {
		return {
			scale: computed(() => 1),
			scaledWidth: computed(() => 0),
			scaledHeight: computed(() => 0),
		};
	}

	if (!scale) {
		const { area: contentArea } = storeToRefs(useContentAreaStore());

		scale = computed(
			() =>
				MAX_SIZE / Math.max(contentArea.value.width, contentArea.value.height),
		);

		// Локальный const: scale только что присвоен, гарантированно non-null.
		// biome-ignore lint/style/noNonNullAssertion: scale assigned on previous line, narrowing to Ref<number>
		const s = scale!;
		scaledWidth = computed(() => contentArea.value.width * s.value);
		scaledHeight = computed(() => contentArea.value.height * s.value);
	}

	return { scale, scaledWidth, scaledHeight } as ScaleTriplet;
}
