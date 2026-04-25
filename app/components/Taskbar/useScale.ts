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
		const { contentArea } = useContentArea();

		scale = computed(
			() =>
				MAX_SIZE / Math.max(contentArea.value.width, contentArea.value.height),
		);

		scaledWidth = computed(() => contentArea.value.width * scale!.value);
		scaledHeight = computed(() => contentArea.value.height * scale!.value);
	}

	return { scale, scaledWidth, scaledHeight } as ScaleTriplet;
}
